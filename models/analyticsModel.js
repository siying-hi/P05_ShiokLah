const sql = require("mssql");
const dbConfig = require("../dbConfig");


// async function getTopOrderedItems() {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().query(`
//       WITH RankedItems AS (
//         SELECT 
//           item_id,
//           item_name AS item,
//           SUM(quantity) AS total_qty,
//           RANK() OVER (ORDER BY SUM(quantity) DESC) AS rnk
//         FROM OrderHistory
//         GROUP BY item_id, item_name
//       )
//       SELECT item_id, item, total_qty
//       FROM RankedItems
//       WHERE rnk <= 3
//       ORDER BY total_qty DESC;
//     `);

//     return result.recordset; // returns top 3 ranks, including ties
//   } catch (err) {
//     console.error("DB error in getTopOrderedItems:", err);
//     throw err;
//   }
// }

async function getTotalOrders() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT COUNT(DISTINCT order_id) AS total_orders
      FROM OrderHistory;
    `);
    return result.recordset[0].total_orders || 0;
  } catch (err) {
    console.error("DB error in getTotalOrders:", err);
    throw err;
  }
}

async function getTop3ForPatron(months) {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
        .input("months", sql.Int, months)
        .query(`
            DECLARE @CurrentDate DATE =
                (SELECT MAX(order_date) FROM OrderHistory);

            SELECT TOP 3
                item_id,
                item_name AS item,
                SUM(quantity) AS total_qty
            FROM OrderHistory
            WHERE order_date >= DATEFROMPARTS(
                    YEAR(DATEADD(MONTH,-(@months-1),@CurrentDate)),
                    MONTH(DATEADD(MONTH,-(@months-1),@CurrentDate)),
                    1
                  )
            GROUP BY item_id,item_name
            ORDER BY total_qty DESC;
        `);

    return result.recordset;
}


async function getFeedbackDistribution() {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT 
                feedback_id,
                order_id,
                stall_id,
                patron_id,
                food_rating,
                service_rating,
                atmosphere_rating,
                feedback_description,
                date_submitted
            FROM Feedbacks
            ORDER BY date_submitted DESC
        `);
        return result.recordset;
    } catch (err) {
        console.error("DB error in getFeedbackDistribution:", err);
        throw err;
    }
}

async function getHygieneGrade() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          hg.stall_id,
          s.stall_name,
          hg.hygiene_grade
      FROM hygiene_grades hg
      JOIN Stalls s ON hg.stall_id = s.stall_id
      ORDER BY hg.stall_id;
    `);
    return result.recordset;
  } catch (err) {
    console.error("DB error in getHygieneGrade:", err);
    throw err;
  }
}


module.exports = {
    getTotalOrders,
    getTop3ForPatron,
    getFeedbackDistribution,
    getHygieneGrade
};
