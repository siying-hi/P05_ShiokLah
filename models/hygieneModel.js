const sql = require("mssql");
const dbConfig = require("../dbConfig");

const HygieneGrade = {
  // One row per stall, joined with that stall's most recent hygiene grade (if any)
  getAllWithLatestGrade: async () => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT
        s.stall_id,
        s.stall_name,
        s.location,
        c.cuisine_type,
        COALESCE(visible_items.visible_menu_items, 0) AS visible_menu_items,
        v.vendor_id,
        v.first_name,
        v.last_name,
        v.email AS vendor_email,
        latest.hygiene_id,
        latest.hygiene_grade,
        latest.score,
        latest.inspection_date,
        latest.inspection_time,
        latest.inspection_by,
        latest.remarks,
        latest.updated_at
      FROM Stalls s
      LEFT JOIN Vendors v ON v.vendor_id = s.vendor_id
      LEFT JOIN Cuisine c ON c.cuisine_id = s.cuisine_id
      OUTER APPLY (
        SELECT COUNT(*) AS visible_menu_items
        FROM MenuItem mi
        WHERE mi.stall_id = s.stall_id
          AND mi.visibility = 1
      ) visible_items
      OUTER APPLY (
        SELECT TOP 1 hg.*
        FROM hygiene_grades hg
        WHERE hg.stall_id = s.stall_id
        ORDER BY hg.inspection_date DESC, hg.inspection_time DESC, hg.created_at DESC
      ) latest
      ORDER BY s.stall_name ASC
    `);
    return result.recordset;
  },

  getLatestByStallId: async (stallId) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("stallId", sql.Int, stallId)
      .query(`
        SELECT TOP 1 *
        FROM hygiene_grades
        WHERE stall_id = @stallId
        ORDER BY inspection_date DESC, inspection_time DESC, created_at DESC
      `);
    return result.recordset[0] || null;
  },

  getHistoryByStallId: async (stallId) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("stallId", sql.Int, stallId)
      .query(`
        SELECT *
        FROM hygiene_grades
        WHERE stall_id = @stallId
        ORDER BY inspection_date DESC, inspection_time DESC, created_at DESC
      `);
    return result.recordset;
  },

  // Records a brand new inspection entry (keeps full history per stall)
  create: async ({ stallId, hygieneGrade, score, inspectionDate, inspectionTime, inspectionBy, remarks }) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("stallId", sql.Int, stallId)
      .input("hygieneGrade", sql.VarChar, hygieneGrade)
      .input("score", sql.Decimal(5, 2), score || null)
      .input("inspectionDate", sql.Date, inspectionDate)
      .input("inspectionTime", sql.VarChar, inspectionTime || null)
      .input("inspectionBy", sql.VarChar, inspectionBy || null)
      .input("remarks", sql.VarChar, remarks || null)
      .query(`
        INSERT INTO hygiene_grades
          (stall_id, hygiene_grade, score, inspection_date, inspection_time, inspection_by, remarks)
        OUTPUT INSERTED.hygiene_id
        VALUES
          (@stallId, @hygieneGrade, @score, @inspectionDate, @inspectionTime, @inspectionBy, @remarks)
      `);
    return result.recordset[0].hygiene_id;
  },

  // Corrects an existing hygiene grade entry in place
  update: async (hygieneId, { hygieneGrade, score, inspectionDate, inspectionTime, inspectionBy, remarks }) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("hygieneId", sql.Int, hygieneId)
      .input("hygieneGrade", sql.VarChar, hygieneGrade)
      .input("score", sql.Decimal(5, 2), score || null)
      .input("inspectionDate", sql.Date, inspectionDate)
      .input("inspectionTime", sql.VarChar, inspectionTime || null)
      .input("inspectionBy", sql.VarChar, inspectionBy || null)
      .input("remarks", sql.VarChar, remarks || null)
      .query(`
        UPDATE hygiene_grades
        SET hygiene_grade = @hygieneGrade,
            score = @score,
            inspection_date = @inspectionDate,
            inspection_time = @inspectionTime,
            inspection_by = @inspectionBy,
            remarks = @remarks,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE hygiene_id = @hygieneId
      `);
    return result.recordset[0] || null;
  },

  getById: async (hygieneId) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("hygieneId", sql.Int, hygieneId)
      .query("SELECT * FROM hygiene_grades WHERE hygiene_id = @hygieneId");
    return result.recordset[0] || null;
  },

  getStallNotificationContext: async (stallId) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("stallId", sql.Int, stallId)
      .query(`
        SELECT s.stall_id, s.stall_name, v.vendor_id
        FROM Stalls s
        INNER JOIN Vendors v ON v.vendor_id = s.vendor_id
        WHERE s.stall_id = @stallId
      `);
    return result.recordset[0] || null;
  },

  // Permanently deletes a single hygiene grade entry
  deleteEntry: async (hygieneId) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("hygieneId", sql.Int, hygieneId)
      .query(`
        DELETE FROM hygiene_grades
        OUTPUT DELETED.hygiene_id
        WHERE hygiene_id = @hygieneId
      `);
    return result.recordset[0] || null;
  }
};

module.exports = HygieneGrade;
