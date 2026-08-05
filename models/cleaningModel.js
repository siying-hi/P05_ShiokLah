const sql = require("mssql");
const dbConfig = require("../dbConfig");
const seedCleaningFallback = require("./seedCleaningFallback");

function normalizePhotoPath(imagePath) {
  if (!imagePath) return null;

  const trimmed = String(imagePath).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed.replaceAll("\\", "/");
  }

  const publicIndex = trimmed.toLowerCase().indexOf("public");
  if (publicIndex >= 0) {
    return trimmed.slice(publicIndex + "public".length).replaceAll("\\", "/");
  }

  return `/${trimmed.replaceAll("\\", "/")}`;
}

const submittedCleaningPhotoMap = {
  "banana-leaf-cleaning-watermarked-1.jpg": "/images/cleaning-submissions/banana-leaf-cleaning-watermarked-1.svg",
  "banana-leaf-before-watermarked.jpg": "/images/cleaning-submissions/banana-leaf-before-watermarked.svg",
  "boon-lay-counter-watermarked.jpg": "/images/cleaning-submissions/boon-lay-counter-watermarked.svg",
  "ismail-counter-missing-watermark.jpg": "/images/cleaning-submissions/ismail-counter-missing-watermark.svg",
  "boon-lay-deep-clean-before.jpg": "/images/cleaning-submissions/boon-lay-deep-clean-before.svg"
};

const stallDisplayPhotoNames = new Set([
  "banana leaf nasi lemak picture.jpg",
  "set meal a picture.jpg",
  "boon lay fried carrot cake & kway teow mee picture.jpg",
  "i.mohamed ismail food stall picture.jpg",
  "black carrot cake picture.jpg"
]);

function getSubmittedCleaningPhotoPath(row) {
  const uploadedFilename = String(row.photoFilename || "").trim().toLowerCase();
  if (submittedCleaningPhotoMap[uploadedFilename]) {
    return submittedCleaningPhotoMap[uploadedFilename];
  }

  const normalizedPath = normalizePhotoPath(row.photoUrl);
  const sourceName = String(normalizedPath || "").split("/").pop().toLowerCase();

  if (stallDisplayPhotoNames.has(sourceName)) {
    return null;
  }

  return normalizedPath;
}

function mapSubmission(row) {
  const frequencyDays = row.frequencyDays || 7;
  const dueDate = row.nextScheduledCleaning || row.cleaningDate;

  return {
    id: row.submissionId,
    stall: row.stallName || "Unnamed stall",
    stallNo: row.stallLocation || `#${row.stallId}`,
    vendorId: `V-${row.vendorId}`,
    vendorName: row.vendorName || "Vendor",
    vendorEmail: row.vendorEmail || "No email found",
    schedule: row.cleaningType
      ? `${row.cleaningType} every ${frequencyDays} day(s)`
      : `Every ${frequencyDays} day(s)`,
    cleaningDate: row.cleaningDate,
    cleaningTime: row.cleaningTime || null,
    cleaningDescription: row.cleaningDescription || "",
    submissionReason: row.submissionReason || "",
    dueDate,
    photoUrl: getSubmittedCleaningPhotoPath(row),
    photoUrls: String(row.photoUrls || row.photoUrl || "").split("|").filter(Boolean).map(normalizePhotoPath),
    status: String(row.status || "Pending").toLowerCase(),
    reviewRemarks: row.reviewRemarks || "",
    reviewedBy: row.reviewedBy || "",
    reviewDate: row.reviewDate || null
  };
}

async function getCleaningSubmissions() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT
        vcs.submission_id AS submissionId,
        vcs.stall_id AS stallId,
        CONVERT(varchar(10), vcs.cleaning_date, 23) AS cleaningDate,
        vcs.status,
        CONVERT(varchar(5), vcs.cleaning_time, 108) AS cleaningTime,
        vcs.cleaning_description AS cleaningDescription,
        CASE WHEN CHARINDEX('Reason for submission:', vcs.cleaning_description) > 0
          THEN LTRIM(SUBSTRING(vcs.cleaning_description, CHARINDEX('Reason for submission:', vcs.cleaning_description) + LEN('Reason for submission:'), 8000))
          ELSE NULL END AS submissionReason,
        vcs.review_remarks AS reviewRemarks,
        vcs.reviewed_by AS reviewedBy,
        CONVERT(varchar(19), vcs.review_date, 120) AS reviewDate,
        COALESCE(vcs.cleaning_type, ccr.cleaning_type, 'Cleaning') AS cleaningType,
        COALESCE(ccr.frequency_days, ccr.max_days_between_cleaning, 7) AS frequencyDays,
        CONVERT(varchar(10), COALESCE(lcd.next_scheduled_cleaning, vcs.cleaning_date), 23) AS nextScheduledCleaning,
        s.stall_name AS stallName,
        s.location AS stallLocation,
        v.vendor_id AS vendorId,
        CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
        v.email AS vendorEmail,
        img.image_path AS photoUrl,
        img.image_filename AS photoFilename,
        images.photoUrls
      FROM vendor_cleaning_submissions vcs
      INNER JOIN Stalls s ON s.stall_id = vcs.stall_id
      INNER JOIN Vendors v ON v.vendor_id = s.vendor_id
      OUTER APPLY (
        SELECT TOP 1 image_path
        FROM submission_images
        WHERE submission_images.submission_id = vcs.submission_id
        ORDER BY is_primary DESC, upload_order ASC, submission_image_id ASC
      ) img
      OUTER APPLY (
        SELECT STRING_AGG(CAST(image_path AS varchar(max)), '|') WITHIN GROUP (ORDER BY upload_order, submission_image_id) AS photoUrls
        FROM submission_images
        WHERE submission_images.submission_id = vcs.submission_id
      ) images
      OUTER APPLY (
        SELECT TOP 1 cleaning_type, frequency_days, max_days_between_cleaning
        FROM Cleaning_compliance_rules
        WHERE (Cleaning_compliance_rules.stall_id = vcs.stall_id OR Cleaning_compliance_rules.stall_id IS NULL)
          AND is_active = 1
        ORDER BY CASE WHEN Cleaning_compliance_rules.stall_id = vcs.stall_id THEN 0 ELSE 1 END, rule_id
      ) ccr
      OUTER APPLY (
        SELECT TOP 1 next_scheduled_cleaning
        FROM Latest_cleaning_dates
        WHERE Latest_cleaning_dates.stall_id = vcs.stall_id
        ORDER BY updated_at DESC, cleaning_id DESC
      ) lcd
      ORDER BY vcs.submission_datetime DESC, vcs.submission_id DESC
    `);

    if (result.recordset.length === 0) {
      return seedCleaningFallback.getCleaningSubmissions();
    }

    return result.recordset.map(mapSubmission);
  } catch (error) {
    return seedCleaningFallback.getCleaningSubmissions();
  }
}

async function reviewCleaningSubmission(submissionId, review) {
  if (Number(submissionId) >= 9000) {
    return seedCleaningFallback.reviewCleaningSubmission(submissionId, review);
  }

  const pool = await sql.connect(dbConfig);
  const status = review.status === "approved" ? "Approved" : "Rejected";

  const result = await pool.request()
    .input("submissionId", sql.Int, submissionId)
    .input("status", sql.VarChar, status)
    .input("reviewedBy", sql.VarChar, review.reviewedBy)
    .input("remarks", sql.VarChar, review.remarks || null)
    .query(`
      UPDATE vendor_cleaning_submissions
      SET
        status = @status,
        reviewed_by = @reviewedBy,
        review_date = GETDATE(),
        review_remarks = @remarks,
        updated_at = GETDATE()
      WHERE submission_id = @submissionId
    `);

  if (result.rowsAffected[0] === 0) {
    return null;
  }

  if (status === "Approved") {
    await pool.request()
      .input("submissionId", sql.Int, submissionId)
      .input("reviewedBy", sql.VarChar, review.reviewedBy)
      .query(`
        UPDATE submission_images
        SET
          is_verified = 1,
          verified_by = @reviewedBy,
          verified_date = GETDATE(),
          verification_remarks = 'Approved by NEA officer'
        WHERE submission_id = @submissionId
      `);
  }

  return getCleaningSubmissionById(submissionId);
}

async function getCleaningSubmissionById(submissionId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("submissionId", sql.Int, submissionId)
    .query(`
      SELECT
        vcs.submission_id AS submissionId,
        vcs.stall_id AS stallId,
        CONVERT(varchar(10), vcs.cleaning_date, 23) AS cleaningDate,
        vcs.status,
        vcs.review_remarks AS reviewRemarks,
        vcs.reviewed_by AS reviewedBy,
        CONVERT(varchar(19), vcs.review_date, 120) AS reviewDate,
        COALESCE(vcs.cleaning_type, ccr.cleaning_type, 'Cleaning') AS cleaningType,
        COALESCE(ccr.frequency_days, ccr.max_days_between_cleaning, 7) AS frequencyDays,
        CONVERT(varchar(10), COALESCE(lcd.next_scheduled_cleaning, vcs.cleaning_date), 23) AS nextScheduledCleaning,
        s.stall_name AS stallName,
        s.location AS stallLocation,
        v.vendor_id AS vendorId,
        CONCAT(v.first_name, ' ', v.last_name) AS vendorName,
        v.email AS vendorEmail,
        img.image_path AS photoUrl,
        img.image_filename AS photoFilename
      FROM vendor_cleaning_submissions vcs
      INNER JOIN Stalls s ON s.stall_id = vcs.stall_id
      INNER JOIN Vendors v ON v.vendor_id = s.vendor_id
      OUTER APPLY (
        SELECT TOP 1 image_path
        FROM submission_images
        WHERE submission_images.submission_id = vcs.submission_id
        ORDER BY is_primary DESC, upload_order ASC, submission_image_id ASC
      ) img
      OUTER APPLY (
        SELECT TOP 1 cleaning_type, frequency_days, max_days_between_cleaning
        FROM Cleaning_compliance_rules
        WHERE (Cleaning_compliance_rules.stall_id = vcs.stall_id OR Cleaning_compliance_rules.stall_id IS NULL)
          AND is_active = 1
        ORDER BY CASE WHEN Cleaning_compliance_rules.stall_id = vcs.stall_id THEN 0 ELSE 1 END, rule_id
      ) ccr
      OUTER APPLY (
        SELECT TOP 1 next_scheduled_cleaning
        FROM Latest_cleaning_dates
        WHERE Latest_cleaning_dates.stall_id = vcs.stall_id
        ORDER BY updated_at DESC, cleaning_id DESC
      ) lcd
      WHERE vcs.submission_id = @submissionId
    `);

  return result.recordset[0] ? mapSubmission(result.recordset[0]) : null;
}

module.exports = {
  getCleaningSubmissions,
  reviewCleaningSubmission,
  getCleaningSubmissionById
};
