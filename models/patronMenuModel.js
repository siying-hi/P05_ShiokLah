// Import the MSSQL library
const sql = require("mssql");

// Import the database configuration
const dbConfig = require("../dbConfig");


// Get stall
// Retrieves one stall together with its cuisine and latest hygiene inspection details
async function getStall(stallId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Retrieve the selected stall
        const result = await connection.request()

            .input(
                "stallId",
                sql.Int,
                stallId
            )

            .query(`

                SELECT

                    s.stall_id,
                    s.stall_name,
                    s.image_name,
                    s.rating,

                    c.cuisine_type,

                    hg.hygiene_grade,
                    hg.score AS hygiene_score,
                    hg.inspection_date AS hygiene_inspection_date

                FROM Stalls s

                INNER JOIN Cuisine c

                    ON s.cuisine_id = c.cuisine_id

                OUTER APPLY
                (
                    SELECT TOP 1

                        hygiene_grade,
                        score,
                        inspection_date

                    FROM hygiene_grades

                    WHERE stall_id = s.stall_id

                    ORDER BY
                        inspection_date DESC,
                        inspection_time DESC,
                        created_at DESC

                ) hg

                WHERE s.stall_id = @stallId

            `);

        // Return the matching stall record
        // Returns undefined if the stall does not exist
        return result.recordset[0];

    }

    catch (error) {

        // Log the database error before passing it to the controller
        console.error(
            "Database error:",
            error
        );

        throw error;

    }

    finally {

        // Always close the database connection
        if (connection) {

            await connection.close();

        }

    }

}


// Get menu items
// Retrieves all menu items belonging to the selected stall
async function getMenuItems(stallId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        console.log("Fetching menu for stall:", stallId);
        // Retrieve the stall's menu items
        const result = await connection.request()

            .input(
                "stallId",
                sql.Int,
                stallId
            )

            .query(`

                SELECT

                    item_id,
                    item_name,
                    price,
                    food_description,
                    allergen_info,
                    estimated_waiting_time,
                    image_name,
                    visibility

                FROM MenuItem

                WHERE stall_id = @stallId  AND visibility = 1

                ORDER BY item_name

            `);

        // Return all menu items belonging to the stall
        console.log("Rows found:", result.recordset.length);
        return result.recordset;

    }

    catch (error) {

        // Log the database error before passing it to the controller
        console.error(
            "Database error:",
            error
        );

        throw error;

    }

    finally {

        // Always close the database connection
        if (connection) {

            await connection.close();

        }

    }

}


// Export the model functions
module.exports = {

    getStall,
    getMenuItems

};