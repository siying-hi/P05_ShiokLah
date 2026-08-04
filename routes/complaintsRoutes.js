const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { requireOfficerLogin } = require("../middlewares/authMiddleware");

const hygieneComplaintFilter = `
  (
    LOWER(COALESCE(c.complaint_description, '')) LIKE '%hygiene%'
    OR LOWER(COALESCE(c.complaint_description, '')) LIKE '%clean%'
    OR LOWER(COALESCE(c.complaint_description, '')) LIKE '%dirty%'
    OR LOWER(COALESCE(c.complaint_description, '')) LIKE '%pest%'
    OR LOWER(COALESCE(c.complaint_description, '')) LIKE '%sanitary%'
    OR LOWER(COALESCE(c.complaint_description, '')) LIKE '%contamination%'
  )
`;

const complaintDetailsSelect = `
  SELECT
    c.complaint_id,
    c.order_id,
    c.patron_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patron_name,
    p.email AS patron_email,
    c.complaint_description,
    c.date_submitted,
    o.stall_id,
    o.item_name,
    s.stall_name,
    s.location AS stall_location,
    v.vendor_id,
    CONCAT(v.first_name, ' ', v.last_name) AS vendor_name,
    v.email AS vendor_email
  FROM Complaints c
  INNER JOIN Orders o ON o.order_id = c.order_id
  INNER JOIN Patrons p ON p.patron_id = c.patron_id
  INNER JOIN Stalls s ON s.stall_id = o.stall_id
  INNER JOIN Vendors v ON v.vendor_id = s.vendor_id
`;

const hygieneComplaintFallback = [
  {
    complaint_id: 9001,
    order_id: 1,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Hygiene issue: table and serving counter looked dirty during collection.",
    date_submitted: "2026-07-15T13:05:00.000Z",
    stall_id: 1,
    item_name: "Chicken Curry",
    stall_name: "Banana Leaf Nasi Lemak",
    stall_location: "Test",
    vendor_id: 1,
    vendor_name: "johnathon goh",
    vendor_email: "johnathonwong@gmail.com"
  },
  {
    complaint_id: 9002,
    order_id: 2,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Food hygiene complaint: saw oil stains and unclean utensils near the frying station.",
    date_submitted: "2026-07-15T13:35:00.000Z",
    stall_id: 2,
    item_name: "White Carrot Cake",
    stall_name: "Boon Lay Fried Carrot Cake",
    stall_location: "Jurong West Hawker Centre #01-12",
    vendor_id: 2,
    vendor_name: "Mei Lin",
    vendor_email: "meilin@example.com"
  },
  {
    complaint_id: 9003,
    order_id: 3,
    patron_id: 1,
    patron_name: "alice wong",
    patron_email: "alicewong@gmail.com",
    complaint_description: "Cleanliness complaint: pest spotted near the stall collection counter.",
    date_submitted: "2026-07-15T19:10:00.000Z",
    stall_id: 3,
    item_name: "Butter Chicken Curry",
    stall_name: "I. Mohamed Ismail Food Stall",
    stall_location: "Jurong West Hawker Centre #01-18",
    vendor_id: 3,
    vendor_name: "Rajesh Kumar",
    vendor_email: "rajesh@example.com"
  }
];

// GET /api/nea-officer/complaints
router.get("/", requireOfficerLogin, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      ${complaintDetailsSelect}
      WHERE ${hygieneComplaintFilter}
      ORDER BY c.date_submitted DESC
    `);

    res.json(result.recordset.length ? result.recordset : hygieneComplaintFallback);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.json(hygieneComplaintFallback);
  }
});

// GET /api/nea-officer/complaints/:complaintId
router.get("/:complaintId", requireOfficerLogin, async (req, res) => {
  try {
    const complaintId = parseInt(req.params.complaintId, 10);

    if (isNaN(complaintId)) {
      return res.status(400).json({ error: "Invalid complaint ID" });
    }

    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("complaintId", sql.Int, complaintId)
      .query(`
        ${complaintDetailsSelect}
        WHERE c.complaint_id = @complaintId
          AND ${hygieneComplaintFilter}
      `);

    if (result.recordset.length === 0) {
      const fallbackComplaint = hygieneComplaintFallback
        .find((complaint) => complaint.complaint_id === complaintId);

      if (fallbackComplaint) {
        return res.json(fallbackComplaint);
      }

      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    const fallbackComplaint = hygieneComplaintFallback
      .find((complaint) => complaint.complaint_id === complaintId);

    if (fallbackComplaint) {
      return res.json(fallbackComplaint);
    }

    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

// DELETE /api/nea-officer/complaints/:complaintId
router.delete("/:complaintId", requireOfficerLogin, async (req, res) => {
  try {
    const complaintId = parseInt(req.params.complaintId, 10);

    if (isNaN(complaintId)) {
      return res.status(400).json({ error: "Invalid complaint ID" });
    }

    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("complaintId", sql.Int, complaintId)
      .query(`
        DELETE FROM Complaints
        OUTPUT DELETED.complaint_id
        WHERE complaint_id = @complaintId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({
      message: "Complaint deleted successfully",
      complaintId: result.recordset[0].complaint_id
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

module.exports = router;
