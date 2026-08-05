// Import MSSQL database library
const sql = require("mssql");

// Import database configuration
const dbConfig = require("../dbConfig");

// Checkout
// Creates an order, inserts all order items and clears the patron's cart
// All database operations are executed within a single SQL transaction
async function checkout(

    patronId,
    orderMode,
    paymentMethod

) {

    let connection;
    let transaction;

    try {

        connection = await sql.connect(dbConfig);

        transaction = new sql.Transaction(connection);

        await transaction.begin();

        // Retrieve the patron's cart
        const cartItems = await getCartTransaction(

            transaction,
            patronId

        );

        if (cartItems.length === 0) {

            throw new Error(
                "Cart is empty."
            );

        }

        const cartId = cartItems[0].cart_id;

        const stallId = cartItems[0].stall_id;

        // Calculate subtotal and total quantity from the cart
        let subtotal = 0;

        let totalQuantity = 0;

        for (const item of cartItems) {

            subtotal += item.price * item.quantity;

            totalQuantity += item.quantity;

        }

        // Apply packaging fee only for self-pickup orders
        let packagingFee = 0;

        if (orderMode === "Self-Pickup") {

            packagingFee = totalQuantity * 0.30;

        }

        // Calculate final payable amount
        const totalPrice = subtotal + packagingFee;

        // Create the order
        const orderId = await createOrderTransaction(

            transaction,

            patronId,

            stallId,

            orderMode,

            paymentMethod,

            subtotal,

            packagingFee,

            totalPrice

        );

        // Insert every purchased item into the order
        for (const item of cartItems) {

            await insertOrderItemTransaction(

                transaction,

                orderId,

                item.item_id,

                item.quantity,

                item.price

            );

        }

        // Remove all items from the cart
        await clearCartItemsTransaction(

            transaction,

            cartId

        );

        // Delete the empty cart
        await deleteCartTransaction(

            transaction,

            cartId

        );

        // Save all database changes
        await transaction.commit();

        return {

            orderId,
            subtotal,
            packagingFee,
            totalPrice

        };

    }

    catch (error) {

        if (transaction) {

            try {

                // Roll back all database changes if checkout fails
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
            "Checkout failed:",
            error
        );

        throw error;

    }

    finally {

        if (connection) {

            // Always close the database connection
            await connection.close();

        }

    }

}

// Create order (Transaction)
// Creates a new order within an active SQL transaction and returns the generated order ID
async function createOrderTransaction(

    transaction,
    patronId,
    stallId,
    orderMode,
    paymentMethod,
    subtotal,
    packagingFee,
    totalPrice

) {

    const result = await new sql.Request(transaction)

        .input("patronId", sql.Int, patronId)

        .input("stallId", sql.Int, stallId)

        .input("orderMode", sql.VarChar, orderMode)

        .input("paymentMethod", sql.VarChar, paymentMethod)

        .input("subtotal", sql.Decimal(10,2), subtotal)

        .input("packagingFee", sql.Decimal(10,2), packagingFee)

        .input("totalPrice", sql.Decimal(10,2), totalPrice)

        .query(`

            INSERT INTO Orders
            (
                patron_id,
                stall_id,
                order_mode,
                payment_method,
                subtotal,
                packaging_fee,
                total_price
            )

            OUTPUT INSERTED.order_id

            VALUES
            (
                @patronId,
                @stallId,
                @orderMode,
                @paymentMethod,
                @subtotal,
                @packagingFee,
                @totalPrice
            )

        `);

    // Return the generated order ID
    return result.recordset[0].order_id;

}


// Insert order item (Transaction)
// Adds a purchased menu item to the specified order within an active SQL transaction
async function insertOrderItemTransaction(

    transaction,
    orderId,
    itemId,
    quantity,
    price

) {

    await new sql.Request(transaction)

        .input("orderId", sql.Int, orderId)

        .input("itemId", sql.Int, itemId)

        .input("quantity", sql.Int, quantity)

        .input("price", sql.Decimal(10,2), price)

        .query(`

            INSERT INTO OrderItems
            (
                order_id,
                item_id,
                quantity,
                price
            )

            VALUES
            (
                @orderId,
                @itemId,
                @quantity,
                @price
            )

        `);

}

// Get cart (Transaction)
// Retrieves all cart items belonging to the specified patron within an SQL transaction
async function getCartTransaction(

    transaction,
    patronId

) {

    const result = await new sql.Request(transaction)

        .input("patronId", sql.Int, patronId)

        .query(`

            SELECT

                c.cart_id,

                c.stall_id,

                ci.item_id,

                ci.quantity,

                m.price

            FROM Carts c

            INNER JOIN CartItems ci

                ON c.cart_id = ci.cart_id

            INNER JOIN MenuItem m

                ON ci.item_id = m.item_id

            WHERE c.patron_id = @patronId

        `);

    // Return all items currently in the patron's cart
    return result.recordset;

}

// Clear cart items (Transaction)
// Removes all items from the specified shopping cart within an active SQL transaction
async function clearCartItemsTransaction(

    transaction,
    cartId

) {

    await new sql.Request(transaction)

        .input("cartId", sql.Int, cartId)

        .query(`

            DELETE FROM CartItems

            WHERE cart_id = @cartId

        `);

}

// Delete cart (Transaction)
// Deletes the shopping cart after all items have been removed within an active SQL transaction
async function deleteCartTransaction(

    transaction,
    cartId

) {

    await new sql.Request(transaction)

        .input("cartId", sql.Int, cartId)

        .query(`

            DELETE FROM Carts

            WHERE cart_id = @cartId

        `);

}

async function getOrderStatus(patronId) {

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
                    o.order_id,
                    o.patron_id,
                    o.stall_id,
                    o.time_created,
                    o.order_mode,
                    o.payment_method,
                    o.subtotal,
                    o.packaging_fee,
                    o.total_price,
                    o.order_status,

                    s.stall_name,

                    oi.item_id,
                    oi.quantity,
                    oi.price,

                    m.item_name,
                    m.image_name

                FROM Orders o

                INNER JOIN Stalls s
                    ON o.stall_id = s.stall_id

                INNER JOIN OrderItems oi
                    ON o.order_id = oi.order_id

                INNER JOIN MenuItem m
                    ON oi.item_id = m.item_id

                WHERE o.patron_id = @patronId

                ORDER BY o.time_created DESC
            `);

    return result.recordset;

}

async function updateOrderStatus(
    orderId,
    patronId,
    status
) {

    const connection =
        await sql.connect(dbConfig);

    try {

        const result =
            await connection.request()

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
                    "status",
                    sql.VarChar(50),
                    status
                )

                .query(`
                    UPDATE Orders

                    SET order_status = @status

                    WHERE order_id = @orderId
                    AND patron_id = @patronId
                `);

        return result.rowsAffected[0] > 0;

    }
    finally {

        await connection.close();

    }

}

async function collectOrder(
    orderId,
    patronId
) {

    const connection =
        await sql.connect(dbConfig);

    const transaction =
        new sql.Transaction(connection);

    try {

        await transaction.begin();


        const getOrderRequest =
            new sql.Request(transaction);

        const orderResult =
            await getOrderRequest

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

                .query(`
            SELECT
                order_id,
                patron_id,
                time_created,
                total_price,
                order_status

            FROM Orders

            WHERE order_id = @orderId
            AND patron_id = @patronId
            AND order_status = 'Ready'
        `);


        if (orderResult.recordset.length === 0) {

            await transaction.rollback();

            return false;

        }


        const order =
            orderResult.recordset[0];


        const itemsRequest = new sql.Request(transaction);
            itemsRequest.input("orderId", sql.Int, orderId);

            const itemsResult = await itemsRequest.query(`
                SELECT oi.item_id, m.item_name, oi.quantity, oi.price, o.stall_id
                FROM OrderItems oi
                JOIN MenuItem m ON oi.item_id = m.item_id
                JOIN Orders o ON oi.order_id = o.order_id
                WHERE oi.order_id = @orderId
                `);

            for (const item of itemsResult.recordset) {
            const insertHistoryRequest = new sql.Request(transaction);
            await insertHistoryRequest
                .input("orderId", sql.Int, order.order_id)
                .input("patronId", sql.Int, order.patron_id)
                .input("orderDate", sql.DateTime, order.time_created)
                .input("orderStatus", sql.VarChar(50), "Completed")
                .input("stallId", sql.Int, item.stall_id)   // ✅ new
                .input("itemId", sql.Int, item.item_id)
                .input("itemName", sql.VarChar(100), item.item_name)
                .input("quantity", sql.Int, item.quantity)
                .input("price", sql.Decimal(10, 2), item.price)
                .input("totalAmt", sql.Decimal(10, 2), item.price * item.quantity)
                .query(`
                INSERT INTO OrderHistory (
                    order_id, patron_id, order_date, order_status,
                    stall_id, item_id, item_name, quantity, price, total_amt
                )
                VALUES (
                    @orderId, @patronId, @orderDate, @orderStatus,
                    @stallId, @itemId, @itemName, @quantity, @price, @totalAmt
                )
                `);
            }





        const deleteItemsRequest =
            new sql.Request(transaction);

        await deleteItemsRequest
            .input(
                "orderId",
                sql.Int,
                orderId
            )
            .query(`
                DELETE FROM OrderItems

                WHERE order_id = @orderId
            `);


        const deleteOrderRequest =
            new sql.Request(transaction);

        await deleteOrderRequest

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

            .query(`
        DELETE FROM Orders

        WHERE order_id = @orderId
        AND patron_id = @patronId
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
                "Rollback failed:",
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
    checkout,
    getOrderStatus,
    updateOrderStatus,
    collectOrder

};


// // Import MSSQL database library
// const sql = require("mssql");

// // Import database configuration
// const dbConfig = require("../dbConfig");

// // Checkout
// // Creates an order, inserts all order items and clears the patron's cart
// // All database operations are executed within a single SQL transaction
// async function checkout(

//     patronId,
//     orderMode,
//     paymentMethod,
//     subtotal,
//     packagingFee,
//     totalPrice

// ) {

//     let connection;
//     let transaction;

//     try {

//         connection = await sql.connect(dbConfig);

//         transaction = new sql.Transaction(connection);

//         await transaction.begin();

//         // Retrieve the patron's cart
//         const cartItems = await getCartTransaction(

//             transaction,
//             patronId

//         );

//         if (cartItems.length === 0) {

//             throw new Error(
//                 "Cart is empty."
//             );

//         }

//         const cartId = cartItems[0].cart_id;

//         const stallId = cartItems[0].stall_id;

//         // Calculate subtotal and total quantity from the cart
//         let subtotal = 0;

//         let totalQuantity = 0;

//         for (const item of cartItems) {

//             subtotal += item.price * item.quantity;

//             totalQuantity += item.quantity;

//         }

//         // Apply packaging fee only for self-pickup orders
//         let packagingFee = 0;

//         if (orderMode === "Self-Pickup") {

//             packagingFee = totalQuantity * 0.30;

//         }

//         // Calculate final payable amount
//         const totalPrice = subtotal + packagingFee;

//         // Create the order
//         const orderId = await createOrderTransaction(

//             transaction,

//             patronId,

//             stallId,

//             orderMode,

//             paymentMethod,

//             subtotal,

//             packagingFee,

//             totalPrice

//         );

//         // Insert every purchased item into the order
//         for (const item of cartItems) {

//             await insertOrderItemTransaction(

//                 transaction,

//                 orderId,

//                 item.item_id,

//                 item.quantity,

//                 item.price

//             );

//         }

//         // Remove all items from the cart
//         await clearCartItemsTransaction(

//             transaction,

//             cartId

//         );

//         // Delete the empty cart
//         await deleteCartTransaction(

//             transaction,

//             cartId

//         );

//         // Save all database changes
//         await transaction.commit();

//         return {

//             orderId,
//             subtotal,
//             packagingFee,
//             totalPrice

//         };

//     }

//     catch (error) {

//         if (transaction) {

//             try {

//                 // Roll back all database changes if checkout fails
//                 await transaction.rollback();

//             }
//             catch (rollbackError) {

//                 console.error(

//                     "Transaction rollback failed:",

//                     rollbackError

//                 );

//             }

//         }

//         console.error(
//             "Checkout failed:",
//             error
//         );

//         throw error;

//     }

//     finally {

//         if (connection) {

//             // Always close the database connection
//             await connection.close();

//         }

//     }

// }

// // Create order (Transaction)
// // Creates a new order within an active SQL transaction and returns the generated order ID
// async function createOrderTransaction(

//     transaction,
//     patronId,
//     stallId,
//     orderMode,
//     paymentMethod,
//     subtotal,
//     packagingFee,
//     totalPrice

// ) {

//     const result = await new sql.Request(transaction)

//         .input("patronId", sql.Int, patronId)

//         .input("stallId", sql.Int, stallId)

//         .input("orderMode", sql.VarChar, orderMode)

//         .input("paymentMethod", sql.VarChar, paymentMethod)

//         .input("subtotal", sql.Decimal(10,2), subtotal)

//         .input("packagingFee", sql.Decimal(10,2), packagingFee)

//         .input("totalPrice", sql.Decimal(10,2), totalPrice)

//         .query(`

//             INSERT INTO Orders
//             (
//                 patron_id,
//                 stall_id,
//                 order_mode,
//                 payment_method,
//                 subtotal,
//                 packaging_fee,
//                 total_price
//             )

//             OUTPUT INSERTED.order_id

//             VALUES
//             (
//                 @patronId,
//                 @stallId,
//                 @orderMode,
//                 @paymentMethod,
//                 @subtotal,
//                 @packagingFee,
//                 @totalPrice
//             )

//         `);

//     // Return the generated order ID
//     return result.recordset[0].order_id;

// }


// // Insert order item (Transaction)
// // Adds a purchased menu item to the specified order within an active SQL transaction
// async function insertOrderItemTransaction(

//     transaction,
//     orderId,
//     itemId,
//     quantity,
//     price

// ) {

//     await new sql.Request(transaction)

//         .input("orderId", sql.Int, orderId)

//         .input("itemId", sql.Int, itemId)

//         .input("quantity", sql.Int, quantity)

//         .input("price", sql.Decimal(10,2), price)

//         .query(`

//             INSERT INTO OrderItems
//             (
//                 order_id,
//                 item_id,
//                 quantity,
//                 price
//             )

//             VALUES
//             (
//                 @orderId,
//                 @itemId,
//                 @quantity,
//                 @price
//             )

//         `);

// }

// // Get cart (Transaction)
// // Retrieves all cart items belonging to the specified patron within an SQL transaction
// async function getCartTransaction(

//     transaction,
//     patronId

// ) {

//     const result = await new sql.Request(transaction)

//         .input("patronId", sql.Int, patronId)

//         .query(`

//             SELECT

//                 c.cart_id,

//                 c.stall_id,

//                 ci.item_id,

//                 ci.quantity,

//                 m.price

//             FROM Carts c

//             INNER JOIN CartItems ci

//                 ON c.cart_id = ci.cart_id

//             INNER JOIN MenuItem m

//                 ON ci.item_id = m.item_id

//             WHERE c.patron_id = @patronId

//         `);

//     // Return all items currently in the patron's cart
//     return result.recordset;

// }

// // Clear cart items (Transaction)
// // Removes all items from the specified shopping cart within an active SQL transaction
// async function clearCartItemsTransaction(

//     transaction,
//     cartId

// ) {

//     await new sql.Request(transaction)

//         .input("cartId", sql.Int, cartId)

//         .query(`

//             DELETE FROM CartItems

//             WHERE cart_id = @cartId

//         `);

// }

// // Delete cart (Transaction)
// // Deletes the shopping cart after all items have been removed within an active SQL transaction
// async function deleteCartTransaction(

//     transaction,
//     cartId

// ) {

//     await new sql.Request(transaction)

//         .input("cartId", sql.Int, cartId)

//         .query(`

//             DELETE FROM Carts

//             WHERE cart_id = @cartId

//         `);

// }

// async function getOrderStatus(patronId) {

//     const connection =
//         await sql.connect(dbConfig);

//     const result =
//         await connection.request()

//             .input(
//                 "patronId",
//                 sql.Int,
//                 patronId
//             )

//             .query(`
//                 SELECT
//                     o.order_id,
//                     o.patron_id,
//                     o.stall_id,
//                     o.time_created,
//                     o.order_mode,
//                     o.payment_method,
//                     o.subtotal,
//                     o.packaging_fee,
//                     o.total_price,
//                     o.order_status,

//                     s.stall_name,

//                     oi.item_id,
//                     oi.quantity,
//                     oi.price,

//                     m.item_name,
//                     m.image_name

//                 FROM Orders o

//                 INNER JOIN Stalls s
//                     ON o.stall_id = s.stall_id

//                 INNER JOIN OrderItems oi
//                     ON o.order_id = oi.order_id

//                 INNER JOIN MenuItem m
//                     ON oi.item_id = m.item_id

//                 WHERE o.patron_id = @patronId

//                 ORDER BY o.time_created DESC
//             `);

//     return result.recordset;

// }

// async function updateOrderStatus(
//     orderId,
//     patronId,
//     status
// ) {

//     const connection =
//         await sql.connect(dbConfig);

//     try {

//         const result =
//             await connection.request()

//                 .input(
//                     "orderId",
//                     sql.Int,
//                     orderId
//                 )

//                 .input(
//                     "patronId",
//                     sql.Int,
//                     patronId
//                 )

//                 .input(
//                     "status",
//                     sql.VarChar(50),
//                     status
//                 )

//                 .query(`
//                     UPDATE Orders

//                     SET order_status = @status

//                     WHERE order_id = @orderId
//                     AND patron_id = @patronId
//                 `);

//         return result.rowsAffected[0] > 0;

//     }
//     finally {

//         await connection.close();

//     }

// }

// async function collectOrder(
//     orderId,
//     patronId
// ) {

//     const connection =
//         await sql.connect(dbConfig);

//     const transaction =
//         new sql.Transaction(connection);

//     try {

//         await transaction.begin();


//         const getOrderRequest =
//             new sql.Request(transaction);

//         const orderResult =
//             await getOrderRequest

//                 .input(
//                     "orderId",
//                     sql.Int,
//                     orderId
//                 )

//                 .input(
//                     "patronId",
//                     sql.Int,
//                     patronId
//                 )

//                 .query(`
//             SELECT
//                 order_id,
//                 patron_id,
//                 time_created,
//                 total_price,
//                 order_status

//             FROM Orders

//             WHERE order_id = @orderId
//             AND patron_id = @patronId
//             AND order_status = 'Ready'
//         `);


//         if (orderResult.recordset.length === 0) {

//             await transaction.rollback();

//             return false;

//         }


//         const order =
//             orderResult.recordset[0];


//         const itemsRequest = new sql.Request(transaction);
//             itemsRequest.input("orderId", sql.Int, orderId);

//             const itemsResult = await itemsRequest.query(`
//             SELECT oi.item_id, m.item_name, oi.quantity, oi.price
//             FROM OrderItems oi
//             JOIN MenuItem m ON oi.item_id = m.item_id
//             WHERE oi.order_id = @orderId
//             `);

//             for (const item of itemsResult.recordset) {
//             const insertHistoryRequest = new sql.Request(transaction);
//             await insertHistoryRequest
//                 .input("orderId", sql.Int, order.order_id)
//                 .input("patronId", sql.Int, order.patron_id)
//                 .input("orderDate", sql.DateTime, order.time_created)
//                 .input("orderStatus", sql.VarChar(50), "Completed")
//                 .input("itemId", sql.Int, item.item_id)
//                 .input("itemName", sql.VarChar(100), item.item_name)
//                 .input("quantity", sql.Int, item.quantity)
//                 .input("price", sql.Decimal(10, 2), item.price)
//                 .input("totalAmt", sql.Decimal(10, 2), item.price * item.quantity) // per-item subtotal
//                 .query(`
//                 INSERT INTO OrderHistory (
//                     order_id, patron_id, order_date, order_status,
//                     item_id, item_name, quantity, price, total_amt
//                 )
//                 VALUES (
//                     @orderId, @patronId, @orderDate, @orderStatus,
//                     @itemId, @itemName, @quantity, @price, @totalAmt
//                 )
//                 `);
//             }




//         const deleteItemsRequest =
//             new sql.Request(transaction);

//         await deleteItemsRequest
//             .input(
//                 "orderId",
//                 sql.Int,
//                 orderId
//             )
//             .query(`
//                 DELETE FROM OrderItems

//                 WHERE order_id = @orderId
//             `);


//         const deleteOrderRequest =
//             new sql.Request(transaction);

//         await deleteOrderRequest

//             .input(
//                 "orderId",
//                 sql.Int,
//                 orderId
//             )

//             .input(
//                 "patronId",
//                 sql.Int,
//                 patronId
//             )

//             .query(`
//         DELETE FROM Orders

//         WHERE order_id = @orderId
//         AND patron_id = @patronId
//     `);


//         await transaction.commit();

//         return true;

//     }
//     catch (error) {

//         try {

//             await transaction.rollback();

//         }
//         catch (rollbackError) {

//             console.error(
//                 "Rollback failed:",
//                 rollbackError
//             );

//         }

//         throw error;

//     }
//     finally {

//         await connection.close();
//     }

// }
// module.exports = {

//     checkout,
//     getOrderStatus,
//     updateOrderStatus,
//     collectOrder
// };