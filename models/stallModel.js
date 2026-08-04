const sql = require("mssql");
const dbConfig = require("../dbConfig");

exports.getStallsById = async (stallId) => {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request()
        .input("stallId", sql.Int, stallId)
        .query(`
            SELECT
                s.stall_id,
                s.stall_name,
                s.vendor_id,
                s.cuisine_id,
                c.cuisine,
                s.location,
                s.contact_number,
                s.email,
                s.created_at,
                s.updated_at
            FROM Stalls s
            LEFT JOIN Cuisine c ON c.cuisine_id = s.cuisine_id
            WHERE s.stall_id = @stallId
        `);

    return result.recordset[0] || null;
};
