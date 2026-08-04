const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Assuming that a stall owner can only own 1 stall
exports.getStallIdByVendorId = async (vendorId) => {
    let connection;
    try {
        if (!vendorId || isNaN(vendorId)) {
            throw new Error("Invalid vendor ID.");
        }
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("vendorId", sql.Int, vendorId)
            .query(`
                SELECT stall_id
                FROM Stalls
                WHERE vendor_id = @vendorId
            `);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0].stall_id;
    } catch (error) {
        console.error("Error retrieving stall ID:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};;

// Get vendor profile by vendor ID
exports.getVendorById = async (vendorId) => {
    let connection;

    try {
        if (!vendorId) {
            throw new Error("Invalid vendor ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("vendorId", sql.Int, vendorId)
            .query(`
                SELECT
                    v.vendor_id,
                    v.username,
                    v.email,
                    v.first_name,
                    v.last_name,
                    s.stall_name,
                    s.contact_number
                FROM Vendors v
                LEFT JOIN Stalls s
                    ON v.vendor_id = s.vendor_id
                WHERE v.vendor_id = @vendorId
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];

    } catch (error) {
        console.error("Error retrieving vendor profile:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};