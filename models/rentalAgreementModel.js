const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Retrieves all rental agreements of that stall
async function getRentalAgreements(stallId) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const query = `
        SELECT
            ra.aid,
            ra.agr_start_date,
            ra.agr_end_date,
            DATEDIFF(DAY, ra.agr_start_date, ra.agr_end_date) + 1 AS validity_period,
            ra.agr_term_condition,
            ra.agr_status,
            ra.rental_price,
            ra.trade_type,
            ra.officer_id,
            ra.stall_id,
            s.location AS stall_location
        FROM RentalAgreement ra
        INNER JOIN Stalls s
            ON ra.stall_id = s.stall_id
        WHERE ra.stall_id = @stallId
        ORDER BY ra.agr_end_date ASC;
    `;

        const request = connection.request();

        request.input(
            "stallId",
            sql.Int,
            stallId
        );

        const result = await request.query(query);

        return result.recordset;

    } catch (error) {
        console.error(
            "Error retrieving rental agreements:",
            error
        );

        throw error;

    } finally {
        if (connection) {
            connection.close();
        }
    }
}


// Retrieves rental agreement by ID
async function getRentalAgreementById(id) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
        SELECT
            ra.aid,
            ra.agr_start_date,
            ra.agr_end_date,
            DATEDIFF(DAY, ra.agr_start_date, ra.agr_end_date) + 1 AS validity_period,
            ra.agr_term_condition,
            ra.agr_status,
            ra.rental_price,
            ra.trade_type,
            ra.officer_id,
            ra.stall_id,
            s.location AS stall_location
        FROM RentalAgreement ra
        INNER JOIN Stalls s
            ON ra.stall_id = s.stall_id
        WHERE ra.aid = @id;
    `;

        const request = connection.request();

        request.input(
            "id",
            sql.Int,
            id
        );

        const result = await request.query(query);

        return result.recordset[0];

    } catch (error) {
        console.error(
            "Error retrieving rental agreement:",
            error
        );

        throw error;

    } finally {
        if (connection) {
            connection.close();
        }
    }
}


// Creates a new rental agreement
async function createRentalAgreement(
    previousAid,
    stallId,
    startDate,
    endDate
) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
        INSERT INTO RentalAgreement (
            agr_start_date,
            agr_end_date,
            agr_term_condition,
            agr_status,
            rental_price,
            trade_type,
            officer_id,
            stall_id
        )
        SELECT
            @startDate,
            @endDate,
            ra.agr_term_condition,
            'active',
            ra.rental_price,
            ra.trade_type,
            ra.officer_id,
            ra.stall_id
        FROM RentalAgreement ra
        WHERE ra.aid = @previousAid
            AND ra.stall_id = @stallId
            AND ra.agr_status = 'expired';

        SELECT SCOPE_IDENTITY() AS aid;
    `;

        const request = connection.request();

        request.input(
            "previousAid",
            sql.Int,
            previousAid
        );

        request.input(
            "stallId",
            sql.Int,
            stallId
        );

        request.input(
            "startDate",
            sql.Date,
            startDate
        );

        request.input(
            "endDate",
            sql.Date,
            endDate
        );

        const result =
            await request.query(query);

        if (
            result.recordsets[0].length === 0 ||
            !result.recordsets[0][0].aid
        ) {
            throw new Error(
                "Rental agreement cannot be renewed."
            );
        }

        return result.recordsets[0][0];

    } catch (error) {
        console.error(
            "Error creating rental agreement:",
            error
        );

        throw error;

    } finally {
        if (connection) {
            connection.close();
        }
    }
}


// Updates an existing rental agreement
async function updateRentalAgreement(id, tradeType) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const query = `
            UPDATE RentalAgreement
            SET trade_type = @tradeType
            WHERE aid = @id;

            SELECT
                aid,
                agr_start_date,
                agr_end_date,
                DATEDIFF(DAY, agr_start_date, agr_end_date) + 1 AS validity_period,
                agr_term_condition,
                agr_status,
                rental_price,
                trade_type,
                officer_id,
                stall_id
            FROM RentalAgreement
            WHERE aid = @id;
        `;

        const request = connection.request();

        request.input(
            "id",
            sql.Int,
            id
        );

        request.input(
            "tradeType",
            sql.VarChar,
            tradeType
        );

        const result =
            await request.query(query);

        return result.recordset[0];

    } catch (error) {
        console.error(
            "Error updating rental agreement:",
            error
        );

        throw error;

    } finally {
        if (connection) {
            connection.close();
        }
    }
}

module.exports = {
    getRentalAgreements,
    getRentalAgreementById,
    createRentalAgreement,
    updateRentalAgreement
};