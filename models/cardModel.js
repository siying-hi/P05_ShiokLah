const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { encrypt, decrypt } = require("../utils/encryption");

// Add card
// Encrypts and stores a new payment card for the patron
async function addCard(

    patronId,
    cardholderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv

) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        // Retrieve all cards belonging to the patron
        const existingCards = await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

                SELECT
                    card_number

                FROM Cards

                WHERE patron_id = @patronId

            `);

        // Check whether the same card has already been added
        for (const card of existingCards.recordset) {

            const decryptedCardNumber =
                decrypt(card.card_number);

            if (decryptedCardNumber === cardNumber) {

                throw new Error(
                    "Card already exists."
                );

            }

        }

        // Encrypt sensitive card details before storing them
        const encryptedCardNumber = encrypt(cardNumber);

        const encryptedCVV = encrypt(cvv);

        await connection.request()

            .input("patronId", sql.Int, patronId)

            .input("cardholderName", sql.VarChar(100), cardholderName)

            .input("cardNumber", sql.VarChar(255), encryptedCardNumber)

            .input("expiryMonth", sql.Char(2), expiryMonth)

            .input("expiryYear", sql.Char(4), expiryYear)

            .input("cvv", sql.VarChar(255), encryptedCVV)

            .query(`

                INSERT INTO Cards (

                    patron_id,
                    cardholder_name,
                    card_number,
                    expiry_month,
                    expiry_year,
                    cvv

                )

                VALUES (

                    @patronId,
                    @cardholderName,
                    @cardNumber,
                    @expiryMonth,
                    @expiryYear,
                    @cvv

                )

            `);

    } 
    
    catch(error) {

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

// Get patron cards
// Retrieves all saved payment cards for the patron
async function getCardsByPatronId(patronId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("patronId", sql.Int, patronId)

            .query(`

                SELECT
                    card_id,
                    cardholder_name,
                    card_number,
                    expiry_month,
                    expiry_year,
                    is_default

                FROM Cards

                WHERE patron_id = @patronId

                ORDER BY created_at DESC

            `);

        // Decrypt each card number before masking the first 12 digits
        return result.recordset.map(card => {

            const decryptedNumber = decrypt(card.card_number);

            return {

                cardId: card.card_id,

                cardholderName: card.cardholder_name,

                cardNumber:
                    "•••• •••• •••• " +
                    decryptedNumber.slice(-4),

                expiry:
                    `${card.expiry_month}/${card.expiry_year}`,

                isDefault: card.is_default

            };

        });

    }

    catch(error) {

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

// Get card by ID
// Retrieves a specific payment card belonging to the patron
async function getCardById(patronId, cardId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("patronId", sql.Int, patronId)

            .input("cardId", sql.Int, cardId)

            .query(`

                SELECT

                card_id,
                cardholder_name,
                card_number,
                expiry_month,
                expiry_year,
                cvv,
                is_default

                FROM Cards

                WHERE card_id = @cardId

                AND patron_id = @patronId

            `);

        const card = result.recordset[0];

        // Return null if the requested card does not exist
        if (!card) {

            return null;

        }

        // Decrypt the stored card number before masking it
        const decryptedNumber = decrypt(card.card_number);

        return {

            cardId: card.card_id,

            cardholderName: card.cardholder_name,

            cardNumber:
                "**** **** **** " + decryptedNumber.slice(-4),

            expiryMonth:
                card.expiry_month,

            expiryYear:
                card.expiry_year,

            expiry:
                `${card.expiry_month}/${card.expiry_year}`,

            // Never expose the real CVV to the frontend
            cvv:
                "***",

            isDefault:
                card.is_default

        };

    }

    catch(error) {

        console.error(
            "Database error:",
            error
        );
        throw error;
    } 

    finally {

        // Always close the database connection
        if(connection){

            await connection.close();

        }

    }

}
// Update card
// Updates an existing payment card for the patron
async function updateCard(

    patronId,
    cardId,
    cardholderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv

){

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const request = connection.request();

        request
            .input("patronId", sql.Int, patronId)
            .input("cardId", sql.Int, cardId)
            .input("cardholderName", sql.VarChar(100), cardholderName)
            .input("expiryMonth", sql.Char(2), expiryMonth)
            .input("expiryYear", sql.Char(4), expiryYear);

        let query = `

            UPDATE Cards

            SET

                cardholder_name = @cardholderName,

                expiry_month = @expiryMonth,

                expiry_year = @expiryYear,

                updated_at = GETDATE()

        `;

        // Only update the card number if the patron entered a new value
        if(cardNumber){

            const encryptedCardNumber = encrypt(cardNumber);

            request.input(
                "cardNumber",
                sql.VarChar(255),
                encryptedCardNumber
            );

            query += `,

                card_number = @cardNumber

            `;

        }

        // Only update the CVV if the patron entered a new value
        if(cvv){

            const encryptedCVV = encrypt(cvv);

            request.input(
                "cvv",
                sql.VarChar(255),
                encryptedCVV
            );

            query += `,

                cvv = @cvv

            `;

        }

        query += `

            WHERE card_id = @cardId

            AND patron_id = @patronId

        `;

        const result = await request.query(query);

        // Ensure the requested card belongs to the logged-in patron
        if(result.rowsAffected[0] === 0){

            throw new Error(
                "Card not found."
            );

        }

    }

    catch(error) {

        console.error(
            "Database error:",
            error
        );
        throw error;
    } 

    finally {

        // Always close the database connection
        if(connection){

            await connection.close();

        }

    }

}

// Set default card
// Marks the selected payment card as the patron's default card
async function setDefaultCard(
    patronId,
    cardId
){

    let connection;
    let transaction;

    try{

        connection = await sql.connect(dbConfig);

        transaction = new sql.Transaction(connection);

        await transaction.begin();

        // Remove the current default card
        await new sql.Request(transaction)

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`

                UPDATE Cards

                SET is_default = 0

                WHERE patron_id = @patronId

            `);

        // Set the selected card as the new default card
        const result = await new sql.Request(transaction)

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "cardId",
                sql.Int,
                cardId
            )

            .query(`

                UPDATE Cards

                SET
                    is_default = 1,
                    updated_at = GETDATE()

                WHERE card_id = @cardId

                AND patron_id = @patronId

            `);

        // Ensure the selected card belongs to the logged-in patron
        if (result.rowsAffected[0] === 0) {

            throw new Error(
                "Card not found."
            );

        }

        await transaction.commit();

    }

    catch (error) {

        if (transaction) {

            try {

                // Roll back all changes if any query in the transaction fails
                await transaction.rollback();

            }
            catch (rollbackError) {

                console.error(
                    "Transaction rollback failed:",
                    rollbackError
                );

            }

        }

        console.error(
            "Database error:",
            error
        );

        throw error;

    }

    finally{

        if(connection){

            await connection.close();

        }

    }

}

// Delete card
// Removes a saved payment card belonging to the patron
async function deleteCard(
    patronId,
    cardId
){

    let connection;

    try{

        connection = await sql.connect(dbConfig);

        const result =
            await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "cardId",
                sql.Int,
                cardId
            )

            .query(`

                DELETE FROM Cards

                WHERE card_id = @cardId

                AND patron_id = @patronId

            `);

        // Return whether a card was successfully deleted
        return result.rowsAffected[0] > 0;

    }

    catch(error) {

        console.error(
            "Database error:",
            error
        );
        throw error;
    } 

    finally{

        // Always close the database connection
        if(connection){

            await connection.close();

        }

    }

}

// Get default card
// Retrieves the patron's default payment card
async function getDefaultCard(patronId){

    let connection;

    try{

        connection = await sql.connect(dbConfig);

        const result =
        await connection.request()

        .input(
            "patronId",
            sql.Int,
            patronId
        )

        .query(`

            SELECT

                card_id,
                card_number,
                expiry_month,
                expiry_year

            FROM Cards

            WHERE patron_id = @patronId

            AND is_default = 1

        `);

        const card = result.recordset[0];

        // Return null if the patron has no default card
        if(!card){

            return null;

        }

        // Decrypt the stored card number before masking it
        const decryptedNumber =
            decrypt(card.card_number);

        return {

            cardId: card.card_id,

            cardNumber:
                "•••• •••• •••• " +
                decryptedNumber.slice(-4),

            expiry:
                `${card.expiry_month}/${card.expiry_year}`

        };

    }

    catch(error) {

        console.error(
            "Database error:",
            error
        );
        throw error;
    } 

    finally{

        // Always close the database connection
        if(connection){

            await connection.close();

        }

    }

}

module.exports = {

    addCard,
    getCardsByPatronId,
    getCardById,
    updateCard,
    setDefaultCard,
    deleteCard,
    getDefaultCard

};