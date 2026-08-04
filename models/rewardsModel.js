const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Make sure the patron has a points row
async function createPointsRow(patronId) {

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        await connection.request()

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .query(`
                IF NOT EXISTS
                (
                    SELECT 1
                    FROM RewardPoints
                    WHERE patron_id = @patronId
                )

                INSERT INTO RewardPoints
                (
                    patron_id,
                    points
                )

                VALUES
                (
                    @patronId,
                    0
                )
            `);

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Get logged-in patron's rewards
async function getRewardsByPatron(patronId) {

    await createPointsRow(patronId);

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const result =
            await connection.request()

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    SELECT
                        r.reward_id,
                        r.patron_id,
                        r.reward_name,
                        r.reward_description,
                        r.reward_type,
                        r.reward_value,
                        r.reward_code,
                        r.minimum_spend,
                        r.points_required,
                        r.is_used,
                        r.is_new,
                        r.reward_source,
                        r.expiry_date,
                        rp.points AS patron_points,

                        CASE
                            WHEN r.is_used = 1
                                THEN 0

                            WHEN r.expiry_date < CAST(GETDATE() AS DATE)
                                THEN 0

                            WHEN rp.points < r.points_required
                                THEN 0

                            ELSE 1
                        END AS can_use

                    FROM Rewards r

                    INNER JOIN RewardPoints rp
                        ON r.patron_id = rp.patron_id

                    WHERE r.patron_id = @patronId

                    ORDER BY r.reward_id DESC
                `);

        return result.recordset;

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Get patron's points
async function getPoints(patronId) {

    await createPointsRow(patronId);

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const result =
            await connection.request()

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    SELECT
                        points,
                        last_check_in

                    FROM RewardPoints

                    WHERE patron_id = @patronId
                `);

        return result.recordset[0];

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Daily check-in
async function dailyCheckIn(patronId) {

    await createPointsRow(patronId);

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const updateResult =
            await connection.request()

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    UPDATE RewardPoints

                    SET
                        points = points + 1,
                        last_check_in =
                            CAST(GETDATE() AS DATE)

                    OUTPUT
                        INSERTED.points,
                        INSERTED.last_check_in

                    WHERE patron_id = @patronId

                    AND
                    (
                        last_check_in IS NULL

                        OR last_check_in
                            < CAST(GETDATE() AS DATE)
                    )
                `);

        if (updateResult.recordset.length > 0) {

            return {
                checkedIn: true,
                points:
                    updateResult.recordset[0].points,
                lastCheckIn:
                    updateResult.recordset[0]
                        .last_check_in
            };

        }

const pointsResult =
    await connection.request()

        .input(
            "patronId",
            sql.Int,
            patronId
        )

        .query(`
            SELECT
                points,
                last_check_in

            FROM RewardPoints

            WHERE patron_id = @patronId
        `);

const points =
    pointsResult.recordset[0];

return {
    checkedIn: false,
    points: points.points,
    lastCheckIn: points.last_check_in
};
    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Give a reward after feedback
async function giveFeedbackReward(patronId) {

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const result =
            await connection.request()

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    INSERT INTO Rewards
                    (
                        patron_id,
                        reward_name,
                        reward_description,
                        reward_type,
                        reward_value,
                        reward_code,
                        minimum_spend,
                        points_required,
                        is_used,
                        is_new,
                        reward_source,
                        expiry_date
                    )

                    OUTPUT INSERTED.*

                    VALUES
                    (
                        @patronId,
                        '$5 Feedback Voucher',
                        'Get $5 off when you spend at least $15',
                        'Fixed',
                        5.00,
                        'FEEDBACK5',
                        15.00,
                        0,
                        0,
                        1,
                        'Feedback',
                        DATEADD(MONTH, 3, GETDATE())
                    )
                `);

        return result.recordset[0];

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Mark notification as seen
async function markRewardAsSeen(
    rewardId,
    patronId
) {

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const result =
            await connection.request()

                .input(
                    "rewardId",
                    sql.Int,
                    rewardId
                )

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    UPDATE Rewards

                    SET is_new = 0

                    WHERE reward_id = @rewardId
                    AND patron_id = @patronId
                `);

        return result.rowsAffected[0] > 0;

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Check voucher before checkout
async function getRewardForCheckout(
    rewardId,
    patronId
) {

    await createPointsRow(patronId);

    let connection;

    try {

        connection =
            await sql.connect(dbConfig);

        const result =
            await connection.request()

                .input(
                    "rewardId",
                    sql.Int,
                    rewardId
                )

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

                .query(`
                    SELECT
                        r.reward_id,
                        r.reward_name,
                        r.reward_type,
                        r.reward_value,
                        r.minimum_spend,
                        r.points_required,
                        rp.points

                    FROM Rewards r

                    INNER JOIN RewardPoints rp
                        ON r.patron_id = rp.patron_id

                    WHERE r.reward_id = @rewardId
                    AND r.patron_id = @patronId
                    AND r.is_used = 0

                    AND
                    (
                        r.expiry_date IS NULL
                        OR r.expiry_date
                            >= CAST(GETDATE() AS DATE)
                    )

                    AND rp.points
                        >= r.points_required
                `);

        return result.recordset[0];

    }
    finally {

        if (connection) {

            await connection.close();

        }

    }

}


// Mark voucher as used and remove required points
async function useReward(
    rewardId,
    patronId,
    pointsRequired
) {

    const connection =
        await sql.connect(dbConfig);

    const transaction =
        new sql.Transaction(connection);

    try {

        await transaction.begin();

        const rewardRequest =
            new sql.Request(transaction);

        const rewardResult =
            await rewardRequest

                .input(
                    "rewardId",
                    sql.Int,
                    rewardId
                )

                .input(
                    "patronId",
                    sql.Int,
                    patronId
                )

.query(`
    DELETE FROM Rewards

    WHERE reward_id = @rewardId
    AND patron_id = @patronId
    AND is_used = 0
`);
        if (rewardResult.rowsAffected[0] === 0) {

            await transaction.rollback();

            return false;

        }

        const pointsRequest =
            new sql.Request(transaction);

        await pointsRequest

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "pointsRequired",
                sql.Int,
                pointsRequired
            )

            .query(`
                UPDATE RewardPoints

                SET points =
                    points - @pointsRequired

                WHERE patron_id = @patronId
                AND points >= @pointsRequired
            `);

        await transaction.commit();

        return true;

    }
    catch (error) {

        try {

            await transaction.rollback();

        }
        catch (rollbackError) {

            console.error(
                "Reward rollback failed:",
                rollbackError
            );

        }

        throw error;

    }
    finally {

        await connection.close();

    }

}


module.exports = {
    getRewardsByPatron,
    getPoints,
    dailyCheckIn,
    giveFeedbackReward,
    markRewardAsSeen,
    getRewardForCheckout,
    useReward
};