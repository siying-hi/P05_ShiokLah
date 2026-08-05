const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Get orders belonging to vendor stall
async function getOrdersByStallId(stallId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input(
                "stall_id",
                sql.Int,
                stallId
            )
            .query(`
                SELECT
                    o.order_id,
                    o.patron_id,
                    o.time_created,
                    o.order_mode,
                    o.payment_method,
                    o.subtotal,
                    o.packaging_fee,
                    o.total_price,
                    o.order_status,

                    oi.item_id,
                    mi.item_name,
                    oi.quantity,
                    oi.price
                FROM Orders o
                INNER JOIN OrderItems oi
                ON o.order_id = oi.order_id
                INNER JOIN MenuItem mi
                ON oi.item_id = mi.item_id

                WHERE o.stall_id = @stall_id

                ORDER BY 
                o.time_created DESC
            `);

        return result.recordset;
        
    } catch(error) {
        console.error(
            "Error getting vendor orders:",
            error
        );

        throw error;

    } finally {

        if(connection) {
            connection.close();
        }
    }
}

// Update order status by vendor
async function updateOrderStatusAsVendor(
    orderId,
    stallId,
    orderStatus
) {
    let connection;

    try {

        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("order_id",sql.Int,orderId)
            .input("stall_id",sql.Int,stallId)
            .input("order_status",sql.VarChar,orderStatus)
            .query(`

                UPDATE Orders
                SET order_status = @order_status
                WHERE order_id = @order_id
                AND stall_id = @stall_id
            `);

        return result.rowsAffected[0];

    } catch(error) {

        console.error(
            "Error updating order status:",
            error
        );
        throw error;

    } finally {

        if(connection) {
            connection.close();
        }
    }
}

module.exports = {
    getOrdersByStallId,
    updateOrderStatusAsVendor
};