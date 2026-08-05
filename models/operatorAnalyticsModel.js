const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Top 3 ranked items (with ties)
// async function getTopRankedItems() {
//   const pool = await sql.connect(dbConfig);
//   const result = await pool.request().query(`
//     WITH RankedItems AS (
//       SELECT 
//         item_id,
//         item_name AS item,
//         SUM(quantity) AS total_qty,
//         RANK() OVER (ORDER BY SUM(quantity) DESC) AS rnk
//       FROM OrderHistory
//       GROUP BY item_id, item_name
//     )
//     SELECT item_id, item, total_qty
//     FROM RankedItems
//     WHERE rnk <= 3
//     ORDER BY total_qty DESC;
//   `);
//   return result.recordset;
// }
async function getTopRankedStalls(startDate, endDate) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("startDate", sql.DateTime, startDate)
    .input("endDate", sql.DateTime, endDate)
    .query(`
      WITH RankedStalls AS (
        SELECT 
          oh.stall_id,
          s.stall_name,
          SUM(oh.quantity) AS total_qty,
          RANK() OVER (ORDER BY SUM(oh.quantity) DESC) AS rnk
        FROM OrderHistory oh
        INNER JOIN Stalls s ON oh.stall_id = s.stall_id
        WHERE oh.order_date BETWEEN @startDate AND @endDate
        GROUP BY oh.stall_id, s.stall_name
      )
      SELECT stall_id, stall_name, total_qty
      FROM RankedStalls
      WHERE rnk <= 3
      ORDER BY total_qty DESC;
    `);
  return result.recordset;
}



// // Total orders
// async function getTotalOrders() {
//   const pool = await sql.connect(dbConfig);
//   const result = await pool.request().query(`
//     SELECT COUNT(*) AS total_orders
//     FROM OrderHistory;
//   `);
//   return result.recordset[0].total_orders;
// }

// Feedback distribution
async function getFeedbackDistribution(startDate, endDate) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("startDate", sql.DateTime, startDate)
    .input("endDate", sql.DateTime, endDate)
    .query(`
      SELECT food_rating
      FROM Feedbacks
      WHERE date_submitted BETWEEN @startDate AND @endDate;
    `);
  return result.recordset;
}


// Hygiene grades
async function getHygieneGrade() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          hg.stall_id,
          s.stall_name,
          hg.hygiene_grade,
          hg.inspection_date,
          hg.inspection_time,
          hg.inspection_by,
          hg.score,
          hg.remarks
      FROM hygiene_grades hg
      JOIN Stalls s ON hg.stall_id = s.stall_id
      ORDER BY hg.inspection_date ASC;
    `);
    return result.recordset;
  } catch (err) {
    console.error("DB error in getHygieneGrade:", err);
    throw err;
  }
}



module.exports = {
  // getTopRankedItems,
  getTopRankedStalls,
  // getTotalOrders,
  getFeedbackDistribution,
  getHygieneGrade
};
