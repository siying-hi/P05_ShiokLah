const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Fetch all order history records for a given patron
// Returns full list of orders with item details, sorted by date
async function getOrdersByPatron(patronId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("patronId", sql.Int, patronId);

    const result = await request.query(`
      SELECT history_id, order_id, patron_id, stall_id, order_date, order_status,
             item_id, item_name, quantity, price, total_amt, created_at
      FROM OrderHistory
      WHERE patron_id = @patronId
      ORDER BY order_date DESC
    `);

    return result.recordset;
  } finally {
    if (connection) await connection.close();
  }
}

// Filter a patron’s orders by status and/or date range
// Returns only orders matching the filter criteria
async function filterOrders(patronId, status, startDate, endDate) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("patron_id", patronId);

    let query = `
      SELECT history_id, order_id, patron_id, stall_id, order_date, order_status,
            item_id, item_name, quantity, price, total_amt, created_at
      FROM OrderHistory
      WHERE patron_id = @patron_id
    `;


    if (status) {
      query += " AND order_status = @status";
      request.input("status", status);
    }

    if (startDate && endDate) {
      query += " AND CAST(order_date AS DATE) BETWEEN @startDate AND @endDate";
      request.input("startDate", startDate);
      request.input("endDate", endDate);
    } else if (startDate) {
      query += " AND CAST(order_date AS DATE) >= @startDate";
      request.input("startDate", startDate);
    } else if (endDate) {
      query += " AND CAST(order_date AS DATE) <= @endDate";
      request.input("endDate", endDate);
    }

    query += " ORDER BY order_date DESC";
    const result = await request.query(query);
    return result.recordset;
  } finally {
    if (connection) await connection.close();
  }
}


// Fetch a single order record by its order_id for a given patron
// Similar to getOrderByHistoryId but keyed by order_id instead
async function getOrderById(orderId, patronId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("orderId", sql.Int, orderId);
    request.input("patronId", sql.Int, patronId);

    const query = `
      SELECT history_id, order_id, patron_id, stall_id, order_date, order_status,
             item_id, item_name, quantity, price, total_amt, created_at
      FROM OrderHistory
      WHERE order_id = @orderId AND patron_id = @patronId
      ORDER BY order_date DESC
    `;

    const result = await request.query(query);
    // Return all rows if found, otherwise null
    return result.recordset.length > 0 ? result.recordset : null;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getOrdersByPatron,
  filterOrders,
  getOrderById
};


