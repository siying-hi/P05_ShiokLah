const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Get the logged-in patron's orders for the stall dropdown
async function getPatronOrders(patronId) {

    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("patronId", sql.Int, patronId)
        .query(`
            SELECT
                o.order_id,
                o.stall_id,
                s.stall_name,
                o.time_created
            FROM Orders o
            INNER JOIN Stalls s
                ON o.stall_id = s.stall_id
            WHERE o.patron_id = @patronId
            ORDER BY o.time_created DESC
        `);

    return result.recordset;

}


// Get all feedback submitted by the logged-in patron
async function getFeedbacksByPatron(patronId) {

    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("patronId", sql.Int, patronId)
        .query(`
            SELECT
                f.feedback_id,
                f.order_id,
                f.stall_id,
                f.patron_id,
                s.stall_name,
                f.food_rating,
                f.service_rating,
                f.atmosphere_rating,
                f.feedback_description,
                f.date_submitted
            FROM Feedbacks f
            INNER JOIN Stalls s
                ON f.stall_id = s.stall_id
            WHERE f.patron_id = @patronId
            ORDER BY f.date_submitted DESC
        `);

    return result.recordset;

}


// Get one feedback belonging to the logged-in patron
async function getFeedbackById(feedbackId, patronId) {

    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("feedbackId", sql.Int, feedbackId)
        .input("patronId", sql.Int, patronId)
        .query(`
            SELECT
                f.feedback_id,
                f.order_id,
                f.stall_id,
                f.patron_id,
                s.stall_name,
                f.food_rating,
                f.service_rating,
                f.atmosphere_rating,
                f.feedback_description,
                f.date_submitted
            FROM Feedbacks f
            INNER JOIN Stalls s
                ON f.stall_id = s.stall_id
            WHERE f.feedback_id = @feedbackId
              AND f.patron_id = @patronId
        `);

    return result.recordset[0];

}


// Create feedback
async function createFeedback(
    orderId,
    patronId,
    stallId,
    foodRating,
    serviceRating,
    atmosphereRating,
    feedbackDescription
) {
    const connection =
        await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input(
    "orderId",
    sql.Int,
    orderId
)
        .input(
            "patronId",
            sql.Int,
            patronId
        )
        .input(
            "stallId",
            sql.Int,
            stallId
        )
        .input(
            "foodRating",
            sql.Int,
            foodRating
        )
        .input(
            "serviceRating",
            sql.Int,
            serviceRating
        )
        .input(
            "atmosphereRating",
            sql.Int,
            atmosphereRating
        )
        .input(
            "feedbackDescription",
            sql.VarChar(500),
            feedbackDescription || null
        )
        .query(`
            INSERT INTO Feedbacks (
                order_id,
                stall_id,
                patron_id,
                food_rating,
                service_rating,
                atmosphere_rating,
                feedback_description
            )
            OUTPUT INSERTED.*
            VALUES (
                @orderId,
                @stallId,
                @patronId,
                @foodRating,
                @serviceRating,
                @atmosphereRating,
                @feedbackDescription
            )
        `);

    return result.recordset[0];
}
// Update feedback
async function updateFeedback(
    feedbackId,
    patronId,
    stallId,
    foodRating,
    serviceRating,
    atmosphereRating,
    feedbackDescription
) {

    const connection =
        await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input(
            "feedbackId",
            sql.Int,
            feedbackId
        )
        .input(
            "patronId",
            sql.Int,
            patronId
        )
        .input(
            "stallId",
            sql.Int,
            stallId
        )
        .input(
            "foodRating",
            sql.Int,
            foodRating
        )
        .input(
            "serviceRating",
            sql.Int,
            serviceRating
        )
        .input(
            "atmosphereRating",
            sql.Int,
            atmosphereRating
        )
        .input(
            "feedbackDescription",
            sql.VarChar(500),
            feedbackDescription || null
        )
        .query(`
            UPDATE Feedbacks
            SET
                stall_id = @stallId,
                food_rating = @foodRating,
                service_rating = @serviceRating,
                atmosphere_rating = @atmosphereRating,
                feedback_description = @feedbackDescription
            OUTPUT INSERTED.*
            WHERE feedback_id = @feedbackId
              AND patron_id = @patronId
        `);

    return result.recordset[0];

}

// Delete feedback
async function deleteFeedback(feedbackId, patronId) {

    const connection = await sql.connect(dbConfig);

    const result = await connection
        .request()
        .input("feedbackId", sql.Int, feedbackId)
        .input("patronId", sql.Int, patronId)
        .query(`
            DELETE FROM Feedbacks
            OUTPUT DELETED.feedback_id
            WHERE feedback_id = @feedbackId
              AND patron_id = @patronId
        `);

    return result.recordset[0];

}

async function getAllStalls() {
    const connection = await sql.connect(dbConfig);

    const result = await connection.request().query(`
        SELECT
            MIN(stall_id) AS stall_id,
            stall_name
        FROM Stalls
        GROUP BY stall_name
        ORDER BY stall_name ASC
    `);

    return result.recordset;
}

module.exports = {
    getAllStalls,
    getPatronOrders,
    getFeedbacksByPatron,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback
};