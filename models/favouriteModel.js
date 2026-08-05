const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Get favourite item IDs
async function getFavouriteItemIds(patronId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`
                SELECT item_id

                FROM FavouriteMenuItems

                WHERE patron_id = @patronId
            `);

        return result.recordset;

    }
    catch (error) {

        console.error(
            "Error retrieving favourite item IDs:",
            error
        );

        throw error;

    }
    finally {

        if (connection) {
            await connection.close();
        }

    }

}


// Get all favourite menu items
async function getAllFavourites(patronId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`
                SELECT
                    f.favourite_id,
                    f.item_id,
                    f.date_added,

                    m.item_name,
                    m.price,
                    m.food_description,
                    m.allergen_info,
                    m.estimated_waiting_time,
                    m.image_name,
                    m.visibility,
                    m.stall_id,

                    s.stall_name

                FROM FavouriteMenuItems f

                INNER JOIN MenuItem m
                    ON f.item_id = m.item_id

                INNER JOIN Stalls s
                    ON m.stall_id = s.stall_id

                WHERE f.patron_id = @patronId

                ORDER BY f.date_added DESC
            `);

        return result.recordset;

    }
    catch (error) {

        console.error(
            "Error retrieving favourites:",
            error
        );

        throw error;

    }
    finally {

        if (connection) {
            await connection.close();
        }

    }

}


// Add favourite
async function addFavourite(patronId, itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const existingResult = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "itemId",
                sql.Int,
                itemId
            )

            .query(`
                SELECT favourite_id

                FROM FavouriteMenuItems

                WHERE patron_id = @patronId
                AND item_id = @itemId
            `);

        if (existingResult.recordset.length > 0) {
            return false;
        }


        const result = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "itemId",
                sql.Int,
                itemId
            )

            .query(`
                INSERT INTO FavouriteMenuItems
                (
                    patron_id,
                    item_id
                )

                VALUES
                (
                    @patronId,
                    @itemId
                )
            `);

        return result.rowsAffected[0] > 0;

    }
    catch (error) {

        console.error(
            "Error adding favourite:",
            error
        );

        throw error;

    }
    finally {

        if (connection) {
            await connection.close();
        }

    }

}


// Delete favourite
async function deleteFavourite(patronId, itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "itemId",
                sql.Int,
                itemId
            )

            .query(`
                DELETE FROM FavouriteMenuItems

                WHERE patron_id = @patronId
                AND item_id = @itemId
            `);

        return result.rowsAffected[0] > 0;

    }
    catch (error) {

        console.error(
            "Error deleting favourite:",
            error
        );

        throw error;

    }
    finally {

        if (connection) {
            await connection.close();
        }

    }

}


module.exports = {
    getFavouriteItemIds,
    getAllFavourites,
    addFavourite,
    deleteFavourite
};