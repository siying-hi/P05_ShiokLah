const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all feedback for a stall
exports.getFeedbackByStallId = async (stallId) => {
    let connection;

    try {
        if (!stallId || isNaN(stallId)) {
            throw new Error("Invalid stall ID.");
        }

        connection = await sql.connect(dbConfig);

        let result = await connection.request()
            .input("stallId", sql.Int, stallId)
            .query(`
                SELECT
                    f.feedback_id,
                    f.order_id,
                    f.stall_id,
                    f.patron_id,
                    f.food_rating,
                    f.service_rating,
                    f.atmosphere_rating,
                    f.feedback_description,
                    f.date_submitted
                FROM Feedbacks f
                WHERE f.stall_id = @stallId
                ORDER BY f.date_submitted DESC
            `);

        return result.recordset;

    } catch (error) {
        console.error("Error retrieving feedback by stall ID:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Get all complaints for a stall
exports.getComplaintByStallId = async (stallId) => {
    let connection;

    try {
        if (!stallId || isNaN(stallId)) {
            throw new Error("Invalid stall ID.");
        }

        connection = await sql.connect(dbConfig);

        let result = await connection.request()
            .input("stallId", sql.Int, stallId)
            .query(`
                SELECT
                    c.complaint_id,
                    c.order_id,
                    c.patron_id,
                    c.stall_id,
                    c.item_id,
                    c.purchase_date,
                    c.food_issue,
                    c.service_issue,
                    c.additional_comments,
                    c.complaint_status,
                    c.date_submitted,
                    c.date_updated
                FROM Complaints c
                WHERE c.stall_id = @stallId
                ORDER BY c.date_submitted DESC
            `);

        return result.recordset;

    } catch (error) {
        console.error("Error retrieving complaints by stall ID:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};