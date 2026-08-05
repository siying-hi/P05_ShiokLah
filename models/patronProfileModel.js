// Import the MSSQL library
const sql = require("mssql");

// Import the database configuration
const dbConfig = require("../dbConfig");


// Get patron profile
// Retrieves the logged-in patron's profile details
async function getPatronProfile(patronId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // SQL query used to retrieve the patron's profile
        const query = `

            SELECT

                patron_id,
                username,
                email,
                first_name,
                last_name

            FROM Patrons

            WHERE patron_id = @patronId

        `;

        // Create a new database request
        const request = connection.request();

        // Add the patron ID as a parameterised input
        request.input(
            "patronId",
            sql.Int,
            patronId
        );

        // Execute the query
        const result = await request.query(query);

        // Return the matching patron record
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


// Update patron profile
// Checks whether the username and email are available before updating the profile
async function updatePatronProfile(

    patronId,
    username,
    firstName,
    lastName,
    email

) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Check whether another patron is already using the username
        const usernameCheck = await connection.request()

            .input(
                "username",
                sql.VarChar,
                username
            )

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

                SELECT
                    patron_id

                FROM Patrons

                WHERE username = @username

                AND patron_id <> @patronId

            `);

        // Stop the update if the username belongs to another patron
        if (usernameCheck.recordset.length > 0) {

            throw new Error(
                "Username already exists."
            );

        }

        // Check whether another patron is already using the email
        const emailCheck = await connection.request()

            .input(
                "email",
                sql.VarChar,
                email
            )

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

                SELECT
                    patron_id

                FROM Patrons

                WHERE email = @email

                AND patron_id <> @patronId

            `);

        // Stop the update if the email belongs to another patron
        if (emailCheck.recordset.length > 0) {

            throw new Error(
                "Email already exists."
            );

        }

        // Update the patron's profile details
        await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "username",
                sql.VarChar,
                username
            )

            .input(
                "firstName",
                sql.VarChar,
                firstName
            )

            .input(
                "lastName",
                sql.VarChar,
                lastName
            )

            .input(
                "email",
                sql.VarChar,
                email
            )

            .query(`

                UPDATE Patrons

                SET

                    username = @username,
                    first_name = @firstName,
                    last_name = @lastName,
                    email = @email,
                    updated_at = GETDATE()

                WHERE patron_id = @patronId

            `);

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


// Delete patron account
// Deletes the patron's related records before deleting the patron account
async function deletePatronAccount(patronId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Delete all records linked to the patron
        // The child records are deleted before the main patron record
        await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

            /* Favourite Orders */
            DELETE FROM FavouriteOrderHistory

            WHERE patron_id = @patronId;


            /* Feedback */
            DELETE FROM Feedbacks

            WHERE patron_id = @patronId;


            /* Complaints */
            DELETE FROM Complaints

            WHERE patron_id = @patronId;


            /* Order History */
            DELETE FROM OrderHistory

            WHERE patron_id = @patronId;


            /* Order Items */
            /* Must be deleted before Orders */
            DELETE FROM OrderItems

            WHERE order_id IN
            (
                SELECT
                    order_id

                FROM Orders

                WHERE patron_id = @patronId
            );


            /* Orders */
            DELETE FROM Orders

            WHERE patron_id = @patronId;


            /* Cart Items */
            DELETE FROM CartItems

            WHERE cart_id IN
            (
                SELECT
                    cart_id

                FROM Carts

                WHERE patron_id = @patronId
            );


            /* Cart */
            DELETE FROM Carts

            WHERE patron_id = @patronId;


            /* Saved Cards */
            DELETE FROM Cards

            WHERE patron_id = @patronId;


            /* Finally delete Patron */
            DELETE FROM Patrons

            WHERE patron_id = @patronId;

            `);

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

    getPatronProfile,
    updatePatronProfile,
    deletePatronAccount

};