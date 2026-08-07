
const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllRentalAgreements() {

    let connection;


    try {

        connection = await sql.connect(dbConfig);


        const result =
            await connection.request()
            .query(`

                SELECT

                    ra.aid AS agreement_id,

                    s.stall_name,

                    s.location,

                    ra.agr_start_date,

                    DATEDIFF(
                        DAY,
                        ra.agr_start_date,
                        ra.agr_end_date
                    ) + 1 AS validity_period,

                    ra.agr_term_condition AS terms_conditions,

                    ra.agr_status AS status


                FROM RentalAgreement ra


                INNER JOIN Stalls s

                    ON ra.stall_id = s.stall_id


                ORDER BY
                    ra.agr_start_date DESC

            `);


        return result.recordset;


    } finally {

        if(connection) {

            await connection.close();

        }

    }

};

// Update rental agreement status
async function updateRentalStatus (agreementId, status) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);


        const result =
            await connection.request()

                .input(
                    "agreementId",
                    sql.Int,
                    agreementId
                )

                .input(
                    "status",
                    sql.VarChar,
                    status
                )

                .query(`

                    UPDATE RentalAgreement

                    SET agr_status = @status

                    WHERE aid = @agreementId;


                    SELECT
                        aid AS agreement_id,
                        agr_status AS status

                    FROM RentalAgreement

                    WHERE aid = @agreementId;

                `);



        return result.recordset[0];


    } finally {

        if (connection) {

            await connection.close();

        }

    }

};

module.exports = {
    getAllRentalAgreements,
    updateRentalStatus

};