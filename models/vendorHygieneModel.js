const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getVendorHygiene(vendorId) {
  const connection = await sql.connect(dbConfig);
  const stallResult = await connection.request()
    .input("vendorId", sql.Int, vendorId)
    .query(`
      SELECT TOP 1 stall_id, stall_name, location
      FROM Stalls
      WHERE vendor_id = @vendorId
      ORDER BY stall_id
    `);

  const stall = stallResult.recordset[0];
  if (!stall) return { stall: null, grades: [] };

  const gradeResult = await connection.request()
    .input("stallId", sql.Int, stall.stall_id)
    .query(`
      SELECT hygiene_id, hygiene_grade, score,
        CONVERT(varchar(10), inspection_date, 23) AS inspection_date,
        inspection_time, inspection_by, remarks, updated_at
      FROM hygiene_grades
      WHERE stall_id = @stallId
      ORDER BY inspection_date DESC, inspection_time DESC, created_at DESC
    `);

  return { stall, grades: gradeResult.recordset };
}

module.exports = { getVendorHygiene };
