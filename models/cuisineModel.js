const sql = require("mssql");
const dbConfig = require("../dbConfig");

//Get all cuisine types registered by vendors
exports.getVendorCuisines = async (vendorId) => {
    let connection;

    try {
        if (!vendorId) {
            throw new Error("Invalid vendor ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("vendor_id", sql.Int, vendorId)
            .query(`
                SELECT
                    cuisine_id,
                    cuisine_type,
                    default_status
                FROM Cuisine
                WHERE
                    default_status = 1
                    OR vendor_id = @vendor_id
                ORDER BY cuisine_type
            `);

        return result.recordset;

    } catch (error) {
        console.error("Error retrieving cuisines:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Get cuisine type selected for this stall
exports.getCuisineByVendorId = async (vendorId) => {
    let connection;

    try {
        if (!vendorId) {
            throw new Error("Invalid vendor ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("vendor_id", sql.Int, vendorId)
            .query(`
                SELECT
                    c.cuisine_id,
                    c.cuisine_type,
                    c.default_status
                FROM Stalls s
                INNER JOIN Cuisine c
                    ON s.cuisine_id = c.cuisine_id
                WHERE s.vendor_id = @vendor_id
            `);

        return result.recordset[0] || null;

    } catch (error) {
        console.error("Error retrieving current cuisine:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Create cuisine
exports.createCuisine = async (cuisine) => {
    let connection;

    try {
        if (!cuisine) {
            throw new Error("Invalid cuisine data.");
        }
        // Capitalises the cuisine type
        const cuisineName = cuisine.cuisine_type
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("cuisine_type", sql.VarChar(20), cuisineName)
            .input("vendor_id", sql.Int, cuisine.vendor_id)
            .query(`
                INSERT INTO Cuisine
                (
                    cuisine_type,
                    vendor_id,
                    default_status
                )
                VALUES
                (
                    @cuisine_type,
                    @vendor_id,
                    0
                )
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error creating cuisine:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Update cuisine
exports.updateCuisine = async (vendorId, cuisineId) => {
    let connection;

    try {
        if (!vendorId || !cuisineId) {
            throw new Error("Invalid vendor ID or cuisine ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("vendor_id", sql.Int, vendorId)
            .input("cuisine_id", sql.Int, cuisineId)
            .query(`
                UPDATE Stalls
                SET cuisine_id = @cuisine_id
                WHERE vendor_id = @vendor_id
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error updating cuisine:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Delete cuisine
exports.deleteCuisine = async (id, vendorId) => {
    let connection;

    try {
        if (!id || !vendorId) {
            throw new Error("Invalid cuisine ID or vendor ID.");
        }

        connection = await sql.connect(dbConfig);

        // Check whether the vendor's stall is currently using this cuisine
        const check = await connection.request()
            .input("id", sql.Int, id)
            .input("vendorId", sql.Int, vendorId)
            .query(`
                SELECT cuisine_id
                FROM Stalls
                WHERE vendor_id = @vendorId
                  AND cuisine_id = @id
            `);

        if (check.recordset.length > 0) {
            return false;
        }

        const result = await connection.request()
            .input("id", sql.Int, id)
            .input("vendorId", sql.Int, vendorId)
            .query(`
                DELETE FROM Cuisine
                WHERE cuisine_id = @id
                  AND vendor_id = @vendorId
                  AND default_status = 0
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error deleting cuisine:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Helper function used internally by createCuisine() to check if the cuisine alreayd exists.
exports.cuisineExists = async (name) => {
    let connection;

    try {
        // Capitalises the cuisine type
        const cuisineName = name
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("name", sql.VarChar(20), cuisineName)
            .query(`
                SELECT cuisine_id
                FROM Cuisine
                WHERE cuisine_type = @name
            `);

        return result.recordset.length > 0;

    } catch (error) {
        console.error("Error checking cuisine:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};