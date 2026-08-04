const sql = require("mssql");
const dbConfig = require("../dbConfig");


async function getAllStalls() {

    const connection =
        await sql.connect(dbConfig);

    const result =
        await connection.request().query(`
            SELECT
                MIN(stall_id) AS stall_id,
                stall_name
            FROM Stalls
            GROUP BY stall_name
            ORDER BY stall_name
        `);

    return result.recordset;

}


async function getMenuItemsByStallId(stallId) {

    const connection =
        await sql.connect(dbConfig);

    const result =
        await connection.request()
            .input(
                "stallId",
                sql.Int,
                stallId
            )
            .query(`
                SELECT DISTINCT
                    item_id,
                    item_name
                FROM MenuItem
                WHERE stall_id = @stallId
                ORDER BY item_name
            `);

    return result.recordset;

}


async function getComplaintsByPatronId(patronId) {

    const connection =
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
                    c.complaint_id,
                    c.order_id,
                    c.patron_id,
                    c.stall_id,
                    c.item_id,

                    s.stall_name,
                    m.item_name,

                    c.purchase_date,
                    c.food_issue,
                    c.service_issue,
                    c.additional_comments,
                    c.complaint_status,
                    c.date_submitted,
                    c.date_updated

                FROM Complaints c

                INNER JOIN Stalls s
                    ON c.stall_id = s.stall_id

                INNER JOIN MenuItem m
                    ON c.item_id = m.item_id

                WHERE c.patron_id = @patronId

                ORDER BY c.date_submitted DESC
            `);

    return result.recordset;

}


async function createComplaint(complaint) {

    const connection =
        await sql.connect(dbConfig);

    const result =
        await connection.request()

            .input(
                "orderId",
                sql.Int,
                complaint.orderId
            )

            .input(
                "patronId",
                sql.Int,
                complaint.patronId
            )

            .input(
                "stallId",
                sql.Int,
                complaint.stallId
            )

            .input(
                "itemId",
                sql.Int,
                complaint.itemId
            )

            .input(
                "purchaseDate",
                sql.Date,
                complaint.purchaseDate
            )

            .input(
                "foodIssue",
                sql.VarChar(1000),
                complaint.foodIssue
            )

            .input(
                "serviceIssue",
                sql.VarChar(1000),
                complaint.serviceIssue
            )

            .input(
                "additionalComments",
                sql.VarChar(1000),
                complaint.additionalComments
            )

            .query(`
                INSERT INTO Complaints
                (
                    order_id,
                    patron_id,
                    stall_id,
                    item_id,
                    purchase_date,
                    food_issue,
                    service_issue,
                    additional_comments
                )

                OUTPUT
                    INSERTED.complaint_id,
                    INSERTED.order_id,
                    INSERTED.patron_id,
                    INSERTED.stall_id,
                    INSERTED.item_id,
                    INSERTED.purchase_date,
                    INSERTED.food_issue,
                    INSERTED.service_issue,
                    INSERTED.additional_comments,
                    INSERTED.complaint_status,
                    INSERTED.date_submitted,
                    INSERTED.date_updated

                VALUES
                (
                    @orderId,
                    @patronId,
                    @stallId,
                    @itemId,
                    @purchaseDate,
                    @foodIssue,
                    @serviceIssue,
                    @additionalComments
                )
            `);

    return result.recordset[0];

}


async function updateComplaint(
    complaintId,
    patronId,
    complaint
) {

    const connection =
        await sql.connect(dbConfig);

    const result =
        await connection.request()

            .input(
                "complaintId",
                sql.Int,
                complaintId
            )

            .input(
                "patronId",
                sql.Int,
                patronId
            )

            .input(
                "stallId",
                sql.Int,
                complaint.stallId
            )

            .input(
                "itemId",
                sql.Int,
                complaint.itemId
            )

            .input(
                "purchaseDate",
                sql.Date,
                complaint.purchaseDate
            )

            .input(
                "foodIssue",
                sql.VarChar(1000),
                complaint.foodIssue
            )

            .input(
                "serviceIssue",
                sql.VarChar(1000),
                complaint.serviceIssue
            )

            .input(
                "additionalComments",
                sql.VarChar(1000),
                complaint.additionalComments
            )

            .query(`
                UPDATE Complaints

                SET
                    stall_id = @stallId,
                    item_id = @itemId,
                    purchase_date = @purchaseDate,
                    food_issue = @foodIssue,
                    service_issue = @serviceIssue,
                    additional_comments = @additionalComments,
                    date_updated = GETDATE()

                OUTPUT
                    INSERTED.complaint_id,
                    INSERTED.order_id,
                    INSERTED.patron_id,
                    INSERTED.stall_id,
                    INSERTED.item_id,
                    INSERTED.purchase_date,
                    INSERTED.food_issue,
                    INSERTED.service_issue,
                    INSERTED.additional_comments,
                    INSERTED.complaint_status,
                    INSERTED.date_submitted,
                    INSERTED.date_updated

                WHERE complaint_id = @complaintId
                AND patron_id = @patronId
                AND complaint_status = 'Pending Review'
            `);

    if (result.recordset.length === 0) {
        return null;
    }

    return result.recordset[0];

}


async function deleteComplaint(
    complaintId,
    patronId
) {

    const connection =
        await sql.connect(dbConfig);

    const result =
        await connection.request()
            .input(
                "complaintId",
                sql.Int,
                complaintId
            )
            .input(
                "patronId",
                sql.Int,
                patronId
            )
            .query(`
                DELETE FROM Complaints
                OUTPUT
                    DELETED.complaint_id
                WHERE complaint_id = @complaintId
                AND patron_id = @patronId
                AND complaint_status = 'Pending Review'
            `);

    if (result.recordset.length === 0) {

        return null;

    }

    return result.recordset[0];

}


module.exports = {
    getAllStalls,
    getMenuItemsByStallId,
    getComplaintsByPatronId,
    createComplaint,
    updateComplaint,
    deleteComplaint
};