// models/orderhistoryModel.js

const sql = require("mssql");
const dbConfig = require("../dbConfig");

// ==========================
// Get all favourites for a patron
// ==========================
async function getAllFavourites(patronId) {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const query = `
      SELECT
        f.favourite_id,
        f.custom_name,
        oh.order_id,
        MIN(oh.order_date) AS order_date,
        MAX(oh.order_status) AS order_status  
    FROM FavouriteOrderHistory f
    JOIN OrderHistory oh
        ON f.order_id = oh.order_id
    WHERE f.patron_id = @patronId
    GROUP BY
        f.favourite_id,
        f.custom_name,
        oh.order_id;

    `;

    const request = connection.request();
    request.input("patronId", patronId);

    const result = await request.query(query);

    return result.recordset;

  } finally {
    if (connection) await connection.close();
  }
}

// ==========================
// Get favourite by ID
// ==========================
// Retrieves a single favourite order by its unique ID.
// Returns null if no record is found.
async function getFavouriteById(id) {

  let connection;

  try {

    connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("id", id);

    const result = await request.query(`
      SELECT *
      FROM FavouriteOrderHistory
      WHERE favourite_id = @id
    `);

    return result.recordset[0] || null;

  } finally {

    if (connection) await connection.close();

  }

}


// favOrderHistoryModel.js
// check to see if a favourite order exists for a given patron
async function findByPatronAndOrder(patronId, orderId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("patronId", sql.Int, patronId);
    request.input("orderId", sql.Int, orderId);

    const result = await request.query(`
      SELECT * 
      FROM FavouriteOrderHistory
      WHERE patron_id = @patronId AND order_id = @orderId
    `);

    return result.recordset[0] || null;
  } finally {
    if (connection) await connection.close();
  }
}



// ==========================
// Create favourite
// ==========================
// Inserts a new favourite order into the database.
// Uses orderId and patronId to create the record.
// Returns the newly created favourite by fetching it with its ID.
// Create a favourite
async function createFavourite(favourite) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("patron_id", sql.Int, favourite.patronId);
    request.input("order_id", sql.Int, favourite.orderId);
    request.input("custom_name", sql.VarChar, favourite.customName || null);

    const query = `
      INSERT INTO FavouriteOrderHistory (patron_id, order_id, custom_name)
      VALUES (@patron_id, @order_id, @custom_name);
      SELECT SCOPE_IDENTITY() AS favourite_id;
    `;
    const result = await request.query(query);
    return { favourite_id: result.recordset[0].favourite_id, ...favourite };
  } finally {
    if (connection) await connection.close();
  }
}

// ==========================
// Rename favourite
// ==========================
// Updates the custom name of a favourite order.
async function updateFavourite(data) {

  let connection;

  try {

    connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("id", data.id);
    request.input("customName", data.customName);

    const result = await request.query(`
      UPDATE FavouriteOrderHistory

      SET
          custom_name = @customName,
          updated_at = GETDATE()

      WHERE favourite_id = @id;

      SELECT *
      FROM FavouriteOrderHistory
      WHERE favourite_id = @id;
    `);

    return result.recordset[0] || null;

  } finally {

    if (connection) await connection.close();

  }

}

// ==========================
// Delete favourite
// ==========================
// Deletes a favourite order by ID.
// First checks if the record exists.
// If found, deletes it and returns the deleted record.
async function deleteFavourite(id) {

  let connection;

  try {

    connection = await sql.connect(dbConfig);

    const request = connection.request();

    request.input("id", id);

    const existing = await request.query(`
      SELECT *
      FROM FavouriteOrderHistory
      WHERE favourite_id = @id
    `);

    if (existing.recordset.length === 0)
      return null;

    await request.query(`
      DELETE
      FROM FavouriteOrderHistory
      WHERE favourite_id = @id
    `);

    return existing.recordset[0];

  } finally {

    if (connection) await connection.close();

  }

}

// Export functions for use in controllers
module.exports = {
  getAllFavourites,
  getFavouriteById,
  findByPatronAndOrder,
  createFavourite,
  updateFavourite,
  deleteFavourite

};