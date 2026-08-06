const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getRentalAgreements(stallId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input(
                "stallId",
                sql.Int,
                stallId
            )
            .query(`

                SELECT
                    ra.aid,
                    ra.agr_start_date,
                    ra.agr_end_date,
                    DATEDIFF(
                        DAY,
                        ra.agr_start_date,
                        ra.agr_end_date
                    ) + 1 AS validity_period,
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

            `);

        return result.recordset;

    } finally {

        if (connection) {
            await connection.close();
        }

    }

}



async function getRentalAgreementById(id) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input(
                "id",
                sql.Int,
                id
            )
            .query(`

                SELECT
                    aid,
                    agr_start_date,
                    agr_end_date,
                    DATEDIFF(
                        DAY,
                        agr_start_date,
                        agr_end_date
                    ) + 1 AS validity_period,
                    agr_term_condition,
                    agr_status,
                    rental_price,
                    trade_type,
                    officer_id,
                    stall_id

                FROM RentalAgreement

                WHERE aid = @id;

            `);

        return result.recordset[0];

    } finally {

        if (connection) {
            await connection.close();
        }

    }

}

async function renewRentalAgreement(
    stallId,
    startDate,
    endDate
) {

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);


        const result =
            await connection.request()

                .input(
                    "stallId",
                    sql.Int,
                    stallId
                )

                .input(
                    "startDate",
                    sql.Date,
                    startDate
                )

                .input(
                    "endDate",
                    sql.Date,
                    endDate
                )

                .query(`


IF EXISTS (

    SELECT 1
    FROM RentalAgreement

    WHERE stall_id = @stallId
    AND agr_status = 'active'

)

BEGIN

    THROW 50001,
    'You already have an active rental agreement.',
    1;

END



INSERT INTO RentalAgreement
(
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

    agr_term_condition,

    'pending',

    rental_price,

    trade_type,

    officer_id,

    stall_id


FROM RentalAgreement


WHERE stall_id = @stallId

AND agr_status = 'expired'


ORDER BY agr_end_date DESC

OFFSET 0 ROWS
FETCH NEXT 1 ROW ONLY;



SELECT SCOPE_IDENTITY() AS aid;


`);


        return result.recordsets[1][0];


    }

    finally {

        if (connection) {
            await connection.close();
        }

    }

}

async function updateRentalAgreement(
    id,
    tradeType
) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input(
                "id",
                sql.Int,
                id
            )
            .input(
                "tradeType",
                sql.VarChar(50),
                tradeType
            )
            .query(`

                UPDATE RentalAgreement

                SET trade_type = @tradeType

                WHERE aid = @id;


                SELECT
                    aid,
                    agr_start_date,
                    agr_end_date,
                    agr_term_condition,
                    agr_status,
                    rental_price,
                    trade_type,
                    officer_id,
                    stall_id

                FROM RentalAgreement

                WHERE aid = @id;

            `);

        return result.recordset[0];

    } finally {

        if (connection) {
            await connection.close();
        }

    }

}

async function getAllRentalAgreements() {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .query(`

                SELECT

                    ra.agreement_id,
                    ra.stall_id,
                    fs.stall_name,
                    hc.hawker_centre_name,

                    ra.agr_start_date,
                    ra.agr_end_date,

                    DATEDIFF(
                        DAY,
                        ra.agr_start_date,
                        ra.agr_end_date
                    ) + 1 AS validity_period,

                    ra.status

                FROM RentalAgreement ra

                INNER JOIN FoodStall fs
                    ON ra.stall_id = fs.stall_id

                INNER JOIN HawkerCentre hc
                    ON fs.hawker_centre_id = hc.hawker_centre_id

                ORDER BY
                    ra.agr_start_date DESC

            `);

        return result.recordset;

    } finally {

        if (connection) {

            await connection.close();

        }

    }

};

module.exports = {
    getRentalAgreements,
    getRentalAgreementById,
    renewRentalAgreement,
    updateRentalAgreement,
    getAllRentalAgreements

};