const express = require("express");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { requireOfficerLogin } = require("../middlewares/authMiddleware");
const seedCertificateFallback = require("../models/seedCertificateFallback");
const vendorNotificationStore = require("../models/vendorNotificationStore");

const router = express.Router();
const sentNotifications = new Map();
const rejectedNotifications = new Map();

function isDatabaseUnavailable(error) {
  return error.code === "ELOGIN" || error.code === "ESOCKET" || error.code === "ETIMEOUT";
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function isExpiringWithinSixMonths(expiryDate) {
  const today = new Date();
  const sixMonthsFromNow = new Date(today);
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const expiry = new Date(expiryDate);

  return expiry >= today && expiry <= sixMonthsFromNow;
}

function buildNotificationMessage(certificate) {
  return `Your ${certificate.certificateName} for ${certificate.stallName} will expire on ${certificate.expiryDate}. Please renew it early to avoid disruption.`;
}

function buildRejectionMessage(certificate) {
  return `Your ${certificate.certificateName} for ${certificate.stallName} was not approved by NEA. Please upload a valid certificate for review.`;
}

function buildApprovalMessage(certificate) {
  return `Your ${certificate.certificateName} for ${certificate.stallName} has been approved by the NEA officer.`;
}

function mapCertificate(row) {
  const expiryDate = formatDate(row.expiryDate);
  const notificationSent = sentNotifications.has(row.certificateId);

  return {
    certificateId: row.certificateId,
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    vendorEmail: row.vendorEmail,
    stallName: row.stallName || "No stall assigned",
    stallLocation: row.stallLocation || "No location added",
    certificateName: row.certificateName,
    certificateNumber: `CERT-${row.certificateId}`,
    issueDate: formatDate(row.issueDate),
    expiryDate,
    issuingAuthority: row.issuingAuthority,
    status: row.approvalStatus,
    certificateUrl: row.certificateUrl || null,
    notificationStatus: notificationSent ? "Sent" : isExpiringWithinSixMonths(expiryDate) ? "Pending" : "Not Due",
    notificationSentAt: sentNotifications.get(row.certificateId) || null,
    rejectionNotificationSentAt: rejectedNotifications.get(row.certificateId) || null,
    notificationDue: isExpiringWithinSixMonths(expiryDate)
  };
}

router.get("/", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().query(`
      IF COL_LENGTH('FoodHandlerCertificate', 'certificate_image_path') IS NULL
      BEGIN
        ALTER TABLE FoodHandlerCertificate
        ADD certificate_image_path VARCHAR(500) NULL;
      END
    `);
    const result = await pool.request().query(`
      SELECT
        c.certificate_id AS certificateId,
        c.vendor_id AS vendorId,
        c.certificate_name AS certificateName,
        c.issue_date AS issueDate,
        c.expiry_date AS expiryDate,
        c.issuing_authority AS issuingAuthority,
        c.approval_status AS approvalStatus,
        c.certificate_image_path AS certificateUrl,
        CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
        v.email AS vendorEmail,
        s.stall_name AS stallName,
        s.location AS stallLocation
      FROM FoodHandlerCertificate c
      INNER JOIN Vendors v ON c.vendor_id = v.vendor_id
      OUTER APPLY (
        SELECT TOP 1 stall_name, location
        FROM Stalls
        WHERE Stalls.vendor_id = c.vendor_id
        ORDER BY stall_id
      ) s
      ORDER BY c.expiry_date ASC
    `);

    res.json(result.recordset.map(mapCertificate));
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return res.json(seedCertificateFallback.getCertificates().map(mapCertificate));
    }

    res.status(500).json({ message: "Failed to load certificate records.", error: error.message });
  }
});

router.put("/:certificateId/approve", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("certificateId", sql.Int, req.params.certificateId)
      .query(`
        UPDATE FoodHandlerCertificate
        SET approval_status = 'Approved'
        OUTPUT
          INSERTED.certificate_id AS certificateId,
          INSERTED.vendor_id AS vendorId,
          INSERTED.certificate_name AS certificateName,
          INSERTED.issue_date AS issueDate,
          INSERTED.expiry_date AS expiryDate,
          INSERTED.issuing_authority AS issuingAuthority,
          INSERTED.approval_status AS approvalStatus,
          INSERTED.certificate_image_path AS certificateUrl
        WHERE certificate_id = @certificateId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Certificate record not found." });
    }

    const vendorResult = await pool.request()
      .input("vendorId", sql.Int, result.recordset[0].vendorId)
      .query(`
        SELECT
          CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
          v.email AS vendorEmail,
          s.stall_name AS stallName,
          s.location AS stallLocation
        FROM Vendors v
        OUTER APPLY (
          SELECT TOP 1 stall_name, location
          FROM Stalls
          WHERE Stalls.vendor_id = v.vendor_id
          ORDER BY stall_id
        ) s
        WHERE v.vendor_id = @vendorId
      `);

    const certificate = mapCertificate({
      ...result.recordset[0],
      ...vendorResult.recordset[0]
    });
    vendorNotificationStore.addNotification({
      vendorId: certificate.vendorId,
      type: "certificate-approved",
      title: "Certificate approved",
      message: buildApprovalMessage(certificate),
      certificateId: certificate.certificateId
    });

    res.json({
      message: "Certificate approved successfully. The vendor has been notified.",
      certificate,
      notificationMessage: buildApprovalMessage(certificate)
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      const certificate = seedCertificateFallback.getCertificates()
        .find((record) => record.certificateId === Number(req.params.certificateId));

      if (!certificate) {
        return res.status(404).json({ message: "Certificate record not found." });
      }

      certificate.approvalStatus = "Approved";
      const mappedCertificate = mapCertificate(certificate);
      vendorNotificationStore.addNotification({
        vendorId: mappedCertificate.vendorId,
        type: "certificate-approved",
        title: "Certificate approved",
        message: buildApprovalMessage(mappedCertificate),
        certificateId: mappedCertificate.certificateId
      });

      return res.json({
        message: "Certificate approved successfully. The vendor has been notified.",
        certificate: mappedCertificate,
        notificationMessage: buildApprovalMessage(mappedCertificate)
      });
    }

    res.status(500).json({ message: "Failed to approve certificate.", error: error.message });
  }
});

router.put("/:certificateId/disapprove", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("certificateId", sql.Int, req.params.certificateId)
      .query(`
        UPDATE FoodHandlerCertificate
        SET approval_status = 'Rejected'
        OUTPUT
          INSERTED.certificate_id AS certificateId,
          INSERTED.certificate_name AS certificateName,
          INSERTED.issue_date AS issueDate,
          INSERTED.expiry_date AS expiryDate,
          INSERTED.issuing_authority AS issuingAuthority,
          INSERTED.approval_status AS approvalStatus
        WHERE certificate_id = @certificateId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Certificate record not found." });
    }

    const vendorResult = await pool.request()
      .input("certificateId", sql.Int, req.params.certificateId)
      .query(`
        SELECT
          c.certificate_id AS certificateId,
          c.vendor_id AS vendorId,
          c.certificate_name AS certificateName,
          c.issue_date AS issueDate,
          c.expiry_date AS expiryDate,
          c.issuing_authority AS issuingAuthority,
          c.approval_status AS approvalStatus,
          CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
          v.email AS vendorEmail,
          s.stall_name AS stallName,
          s.location AS stallLocation
        FROM FoodHandlerCertificate c
        INNER JOIN Vendors v ON c.vendor_id = v.vendor_id
        OUTER APPLY (
          SELECT TOP 1 stall_name, location
          FROM Stalls
          WHERE Stalls.vendor_id = c.vendor_id
          ORDER BY stall_id
        ) s
        WHERE c.certificate_id = @certificateId
      `);

    const certificate = mapCertificate(vendorResult.recordset[0]);
    rejectedNotifications.set(certificate.certificateId, new Date().toISOString());
    vendorNotificationStore.addNotification({ vendorId: certificate.vendorId, type: "certificate-rejected", title: "Certificate not approved", message: buildRejectionMessage(certificate), certificateId: certificate.certificateId });

    res.json({
      message: `Certificate disapproved. Notification sent to ${certificate.vendorEmail}.`,
      certificate: mapCertificate({
        ...vendorResult.recordset[0],
        approvalStatus: "Rejected"
      }),
      notificationMessage: buildRejectionMessage(certificate)
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      const certificate = seedCertificateFallback.getCertificates()
        .find((record) => record.certificateId === Number(req.params.certificateId));

      if (!certificate) {
        return res.status(404).json({ message: "Certificate record not found." });
      }

      certificate.approvalStatus = "Rejected";
      rejectedNotifications.set(certificate.certificateId, new Date().toISOString());
      vendorNotificationStore.addNotification({ vendorId: certificate.vendorId, type: "certificate-rejected", title: "Certificate not approved", message: buildRejectionMessage(mapCertificate(certificate)), certificateId: certificate.certificateId });

      return res.json({
        message: `Certificate disapproved. Notification sent to ${certificate.vendorEmail}.`,
        certificate: mapCertificate(certificate),
        notificationMessage: buildRejectionMessage(mapCertificate(certificate))
      });
    }

    res.status(500).json({ message: "Failed to disapprove certificate.", error: error.message });
  }
});

router.post("/:certificateId/notify", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("certificateId", sql.Int, req.params.certificateId)
      .query(`
        SELECT
          c.certificate_id AS certificateId,
          c.vendor_id AS vendorId,
          c.certificate_name AS certificateName,
          c.issue_date AS issueDate,
          c.expiry_date AS expiryDate,
          c.issuing_authority AS issuingAuthority,
          c.approval_status AS approvalStatus,
          CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
          v.email AS vendorEmail,
          s.stall_name AS stallName,
          s.location AS stallLocation
        FROM FoodHandlerCertificate c
        INNER JOIN Vendors v ON c.vendor_id = v.vendor_id
        OUTER APPLY (
          SELECT TOP 1 stall_name, location
          FROM Stalls
          WHERE Stalls.vendor_id = c.vendor_id
          ORDER BY stall_id
        ) s
        WHERE c.certificate_id = @certificateId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Certificate record not found." });
    }

    const certificate = mapCertificate(result.recordset[0]);

    if (!certificate.notificationDue) {
      return res.json({ message: "Certificate is not within the 6-month reminder period." });
    }

    sentNotifications.set(certificate.certificateId, new Date().toISOString());
    vendorNotificationStore.addNotification({ vendorId: certificate.vendorId, type: "certificate-expiry", title: "Certificate expiry reminder", message: buildNotificationMessage(certificate), certificateId: certificate.certificateId });

    res.json({
      message: `Expiry notification sent to ${certificate.vendorEmail}.`,
      notificationMessage: buildNotificationMessage(certificate)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send certificate notification.", error: error.message });
  }
});

router.delete("/:certificateId", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("certificateId", sql.Int, req.params.certificateId)
      .query(`
        DELETE FROM FoodHandlerCertificate
        WHERE certificate_id = @certificateId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Certificate record not found." });
    }

    res.json({ message: "Certificate record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete certificate record.", error: error.message });
  }
});

module.exports = router;


