// Import the MSSQL library
const sql = require("mssql");

// Import the database configuration
const dbConfig = require("../dbConfig");


// Login
// Retrieves a user's account details based on their role and username
async function login(role, username) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Store the SQL query for the selected role
        let query = "";

        // Retrieve a patron account
        if (role === "patron") {

            query = `

                SELECT

                    patron_id AS id,
                    username,
                    password

                FROM Patrons

                WHERE username = @username

            `;

        }

        // Retrieve a vendor account
        else if (role === "vendor") {

            query = `

                SELECT

                    vendor_id AS id,
                    username,
                    password

                FROM Vendors

                WHERE username = @username

            `;

        }

        // Retrieve an operator account
        else if (role === "operator") {

            query = `

                SELECT

                    operator_id AS id,
                    username,
                    password

                FROM Operators

                WHERE username = @username

            `;

        }

        // Retrieve an NEA officer account
        else if (role === "officer") {

            query = `

                SELECT

                    officer_id AS id,
                    username,
                    password

                FROM NEAOfficers

                WHERE username = @username

            `;

        }

        // Return null when the role is invalid
        else {

            return null;

        }

        // Create a new database request
        const request = connection.request();

        // Add the username as a parameterised input
        request.input(
            "username",
            sql.VarChar,
            username
        );

        // Execute the selected SQL query
        const result = await request.query(query);

        // Return the matching account
        // Returns null if no account is found
        return result.recordset[0] || null;

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

        // Close the database connection after the operation
        if (connection) {

            try {

                await connection.close();

            }

            catch (err) {

                console.error(
                    "Error closing connection:",
                    err
                );

            }

        }

    }

}


// Register
// Creates a new account in the table belonging to the selected role
async function register(

    role,
    username,
    password,
    email,
    firstName,
    lastName,
    fullName,
    phone,
    assignedArea,
    profileImage

) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Store the SQL query for the selected role
        let query = "";

        // Create a new database request
        const request = connection.request();

        // Register a patron account
        if (role === "patron") {

            query = `

                INSERT INTO Patrons
                (
                    username,
                    password,
                    email,
                    first_name,
                    last_name
                )

                VALUES
                (
                    @username,
                    @password,
                    @email,
                    @firstName,
                    @lastName
                )

            `;

            request.input(
                "username",
                sql.VarChar,
                username
            );

            request.input(
                "password",
                sql.VarChar,
                password
            );

            request.input(
                "email",
                sql.VarChar,
                email
            );

            request.input(
                "firstName",
                sql.VarChar,
                firstName
            );

            request.input(
                "lastName",
                sql.VarChar,
                lastName
            );

        }

        // Register a vendor account
        else if (role === "vendor") {

            query = `

                INSERT INTO Vendors
                (
                    username,
                    password,
                    email,
                    first_name,
                    last_name
                )

                VALUES
                (
                    @username,
                    @password,
                    @email,
                    @firstName,
                    @lastName
                )

            `;

            request.input(
                "username",
                sql.VarChar,
                username
            );

            request.input(
                "password",
                sql.VarChar,
                password
            );

            request.input(
                "email",
                sql.VarChar,
                email
            );

            request.input(
                "firstName",
                sql.VarChar,
                firstName
            );

            request.input(
                "lastName",
                sql.VarChar,
                lastName
            );

        }

        // Register an operator account
        else if (role === "operator") {

            query = `

                INSERT INTO Operators
                (
                    username,
                    password,
                    email,
                    first_name,
                    last_name
                )

                VALUES
                (
                    @username,
                    @password,
                    @email,
                    @firstName,
                    @lastName
                )

            `;

            request.input(
                "username",
                sql.VarChar,
                username
            );

            request.input(
                "password",
                sql.VarChar,
                password
            );

            request.input(
                "email",
                sql.VarChar,
                email
            );

            request.input(
                "firstName",
                sql.VarChar,
                firstName
            );

            request.input(
                "lastName",
                sql.VarChar,
                lastName
            );

        }

        // Register an NEA officer account
        else if (role === "officer") {

            query = `

                INSERT INTO NEAOfficers
                (
                    username,
                    full_name,
                    email,
                    password,
                    phone,
                    assigned_area,
                    profile_image
                )

                VALUES
                (
                    @username,
                    @full_name,
                    @email,
                    @password,
                    @phone,
                    @assigned_area,
                    @profile_image
                )

            `;

            request.input(
                "username",
                sql.VarChar,
                username
            );

            request.input(
                "full_name",
                sql.VarChar,
                fullName
            );

            request.input(
                "email",
                sql.VarChar,
                email
            );

            request.input(
                "password",
                sql.VarChar,
                password
            );

            request.input(
                "phone",
                sql.VarChar,
                phone || null
            );

            request.input(
                "assigned_area",
                sql.VarChar,
                assignedArea || null
            );

            request.input(
                "profile_image",
                sql.VarChar,
                profileImage || "default-officer.png"
            );

        }

        // Stop registration if the role is invalid
        else {

            throw new Error(
                "Invalid role."
            );

        }

        // Execute the registration query
        await request.query(query);

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


// Save refresh token
// Stores the user's refresh token in the table belonging to their role
async function saveRefreshToken(role, userId, refreshToken) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Select the database table based on the user's role
        const table =
            role === "patron"
                ? "Patrons"
                : role === "vendor"
                ? "Vendors"
                : role === "operator"
                ? "Operators"
                : "NEAOfficers";

        // Select the ID column based on the user's role
        const idColumn =
            role === "patron"
                ? "patron_id"
                : role === "vendor"
                ? "vendor_id"
                : role === "operator"
                ? "operator_id"
                : "officer_id";

        // Save the refresh token for the selected user
        await connection.request()

            .input(
                "refreshToken",
                sql.VarChar,
                refreshToken
            )

            .input(
                "id",
                sql.Int,
                userId
            )

            .query(`

                UPDATE ${table}

                SET refresh_token = @refreshToken

                WHERE ${idColumn} = @id

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


// Get refresh token
// Retrieves the stored refresh token for the selected user
async function getRefreshToken(role, userId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Select the database table based on the user's role
        const table =
            role === "patron"
                ? "Patrons"
                : role === "vendor"
                ? "Vendors"
                : role === "operator"
                ? "Operators"
                : "NEAOfficers";

        // Select the ID column based on the user's role
        const idColumn =
            role === "patron"
                ? "patron_id"
                : role === "vendor"
                ? "vendor_id"
                : role === "operator"
                ? "operator_id"
                : "officer_id";

        // Retrieve the stored refresh token
        const result = await connection.request()

            .input(
                "id",
                sql.Int,
                userId
            )

            .query(`

                SELECT
                    refresh_token

                FROM ${table}

                WHERE ${idColumn} = @id

            `);

        // Return the refresh token
        // Returns undefined if the account or token does not exist
        return result.recordset[0]?.refresh_token;

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


// Remove refresh token
// Clears the stored refresh token when the user logs out
async function removeRefreshToken(role, userId) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Select the database table based on the user's role
        const table =
            role === "patron"
                ? "Patrons"
                : role === "vendor"
                ? "Vendors"
                : role === "operator"
                ? "Operators"
                : "NEAOfficers";

        // Select the ID column based on the user's role
        const idColumn =
            role === "patron"
                ? "patron_id"
                : role === "vendor"
                ? "vendor_id"
                : role === "operator"
                ? "operator_id"
                : "officer_id";

        // Remove the stored refresh token
        await connection.request()

            .input(
                "id",
                sql.Int,
                userId
            )

            .query(`

                UPDATE ${table}

                SET refresh_token = NULL

                WHERE ${idColumn} = @id

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


// Find account
// Retrieves the complete account record using the role and username
async function findAccount(role, username) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Store the table name belonging to the selected role
        let tableName;

        if (role === "patron") {

            tableName = "Patrons";

        }

        else if (role === "vendor") {

            tableName = "Vendors";

        }

        else if (role === "operator") {

            tableName = "Operators";

        }

        else if (role === "officer") {

            tableName = "NEAOfficers";

        }

        else {

            throw new Error(
                "Invalid role."
            );

        }

        // Retrieve the matching account
        const result = await connection.request()

            .input(
                "username",
                sql.VarChar,
                username
            )

            .query(`

                SELECT *

                FROM ${tableName}

                WHERE username = @username

            `);

        // Return the matching account
        // Returns undefined if no account is found
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


// Reset password
// Updates the password belonging to the selected role and username
async function resetPassword(role, username, password) {

    let connection;

    try {

        // Open a connection to the database
        connection = await sql.connect(dbConfig);

        // Store the table name belonging to the selected role
        let tableName;

        if (role === "patron") {

            tableName = "Patrons";

        }

        else if (role === "vendor") {

            tableName = "Vendors";

        }

        else if (role === "operator") {

            tableName = "Operators";

        }

        else if (role === "officer") {

            tableName = "NEAOfficers";

        }

        else {

            throw new Error(
                "Invalid role."
            );

        }

        // Update the account password and modification date
        const result = await connection.request()

            .input(
                "username",
                sql.VarChar,
                username
            )

            .input(
                "password",
                sql.VarChar,
                password
            )

            .query(`

                UPDATE ${tableName}

                SET

                    password = @password,
                    updated_at = GETDATE()

                WHERE username = @username

            `);

        // Stop the process if no account was updated
        if (result.rowsAffected[0] === 0) {

            throw new Error(
                "Account not found."
            );

        }

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

    login,
    register,
    saveRefreshToken,
    getRefreshToken,
    removeRefreshToken,
    findAccount,
    resetPassword

};