// Import the MSSQL library
const sql = require("mssql");

// Import the database configuration
const dbConfig = require("../dbConfig");


// Get patron
// Retrieves the patron's first name using the patron ID
async function getPatron(patronId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Retrieve the patron's first name
        const result = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

                SELECT
                    first_name

                FROM Patrons

                WHERE patron_id = @patronId

            `);

        // Return the patron record
        // Returns undefined if no matching patron is found
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


// Get stalls
// Retrieves all stalls together with their cuisine and latest hygiene grade
async function getStalls() {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Retrieve all stalls and their related information
        const result = await connection.request()

            .query(`

                SELECT

                    s.stall_id,
                    s.stall_name,
                    s.image_name,
                    s.rating,

                    c.cuisine_type,

                    hg.hygiene_grade

                FROM Stalls s

                INNER JOIN Cuisine c

                    ON s.cuisine_id = c.cuisine_id

                OUTER APPLY
                (
                    SELECT TOP 1

                        hygiene_grade

                    FROM hygiene_grades

                    WHERE stall_id = s.stall_id

                    ORDER BY inspection_date DESC

                ) hg

                ORDER BY s.stall_name

            `);

        // Return all retrieved stall records
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

    getPatron,
    getStalls

};