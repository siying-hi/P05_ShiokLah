// Import MSSQL database library
const sql = require("mssql");

// Import database configuration
const dbConfig = require("../dbConfig");

// Get cart by patron
// Retrieves the shopping cart belonging to the specified patron
async function getCartByPatronId(patronId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("patronId", sql.Int, patronId)

            .query(`
                SELECT *
                FROM Carts
                WHERE patron_id = @patronId
            `);

        // Return the patron's cart if one exists
        return result.recordset[0];

    }

    catch(error) {

        console.error(
            "Database error:",
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

// Create cart
// Creates a new shopping cart for the specified patron
async function createCart(patronId, stallId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("patronId", sql.Int, patronId)

            .input("stallId", sql.Int, stallId)

            .query(`
                INSERT INTO Carts
                (
                    patron_id,
                    stall_id
                )

                OUTPUT INSERTED.cart_id

                VALUES
                (
                    @patronId,
                    @stallId
                )
            `);

        // Return the newly created cart ID
        return result.recordset[0].cart_id;

    }

    catch(error) {

        console.error(
            "Database error:",
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
// Get menu item
// Retrieves a menu item by its ID
async function getMenuItem(itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("itemId", sql.Int, itemId)

            .query(`
                SELECT
                    item_id,
                    stall_id,
                    item_name,
                    price

                FROM MenuItem

                WHERE item_id = @itemId
            `);

        // Return the requested menu item if it exists
        return result.recordset[0];

    }

    catch(error) {

        console.error(
            "Database error:",
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


// Get cart item
// Retrieves a specific item from the shopping cart
async function getCartItem(cartId, itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .input("itemId", sql.Int, itemId)

            .query(`
                SELECT *

                FROM CartItems

                WHERE cart_id = @cartId

                AND item_id = @itemId
            `);

        // Return the requested cart item if it exists
        return result.recordset[0];

    }

    catch(error) {

        console.error(
            "Database error:",
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


// Insert cart item
// Adds a menu item to the shopping cart with a default quantity of one
async function insertCartItem(cartId, itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        await connection.request()

            .input("cartId", sql.Int, cartId)

            .input("itemId", sql.Int, itemId)

            .query(`
                INSERT INTO CartItems
                (
                    cart_id,
                    item_id,
                    quantity
                )

                VALUES
                (
                    @cartId,
                    @itemId,
                    1
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

        if (connection) {

            // Always close the database connection
            await connection.close();

        }

    }

}
// Update quantity
// Updates the quantity of an existing item in the shopping cart
async function updateQuantity(cartId, itemId, quantity) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .input("itemId", sql.Int, itemId)

            .input("quantity", sql.Int, quantity)

            .query(`
                UPDATE CartItems

                SET quantity = @quantity

                WHERE cart_id = @cartId

                AND item_id = @itemId
            `);

        // Return whether a cart item was updated
        return result.rowsAffected[0] > 0;

    }

    catch(error) {

        console.error(
            "Database error:",
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


// Delete cart item
// Removes a specific item from the shopping cart
async function deleteCartItem(cartId, itemId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .input("itemId", sql.Int, itemId)

            .query(`
                DELETE FROM CartItems

                WHERE cart_id = @cartId

                AND item_id = @itemId
            `);

        // Return whether a cart item was deleted
        return result.rowsAffected[0] > 0;

    }

    catch(error) {

        console.error(
            "Database error:",
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


// Clear cart items
// Removes all items from the specified shopping cart
async function clearCartItems(cartId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .query(`
                DELETE FROM CartItems

                WHERE cart_id = @cartId
            `);

        // Return whether any cart items were removed
        return result.rowsAffected[0] > 0;

    }

    catch(error) {

        console.error(
            "Database error:",
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
// Delete cart
// Removes the shopping cart after all items have been cleared
async function deleteCart(cartId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .query(`
                DELETE FROM Carts

                WHERE cart_id = @cartId
            `);

        // Return whether the cart was deleted
        return result.rowsAffected[0] > 0;

    }

    catch(error) {

        console.error(
            "Database error:",
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


// Get cart items
// Retrieves all items currently stored in the shopping cart
async function getCartItems(cartId) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("cartId", sql.Int, cartId)

            .query(`
                SELECT

                c.cart_id,

                s.stall_name,

                m.item_id,

                m.item_name,

                m.image_name,

                m.price,

                ci.quantity,

                (m.price * ci.quantity) AS subtotal

                FROM Carts c

                INNER JOIN CartItems ci

                    ON c.cart_id = ci.cart_id

                INNER JOIN MenuItem m

                    ON ci.item_id = m.item_id

                INNER JOIN Stalls s

                    ON c.stall_id = s.stall_id

                WHERE c.cart_id = @cartId
            `);

        // Return all cart items with stall and pricing information
        return result.recordset;

    }

    catch(error) {

        console.error(
            "Database error:",
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

module.exports = {

    getCartByPatronId,
    createCart,
    getMenuItem,
    getCartItem,
    insertCartItem,
    updateQuantity,
    deleteCartItem,
    clearCartItems,
    deleteCart,
    getCartItems

};