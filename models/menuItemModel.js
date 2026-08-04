const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all menu items according to stall owner's stall id
exports.getAllMenuItemsByStallId = async (stallId) => {
    let connection;

    try {
        if (!stallId) {
            throw new Error("Invalid stall ID.");
        }

        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("stallId", sql.Int, stallId)
            .query(`
                SELECT
                    item_id,
                    item_name,
                    price,
                    food_description,
                    allergen_info,
                    estimated_waiting_time,
                    image_name,
                    visibility
                FROM MenuItem
                WHERE stall_id = @stallId
                ORDER BY item_name
            `);

        return result.recordset;

    } catch (error) {
        console.error("Error retrieving menu items:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Get menu item by id
exports.getMenuItemById = async (itemId, stallId) => {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("item_id", sql.Int, itemId)
            .input("stall_id", sql.Int, stallId)
            .query(`
                SELECT
                    item_id,
                    item_name,
                    price,
                    food_description,
                    allergen_info,
                    estimated_waiting_time,
                    image_name,
                    visibility
                FROM MenuItem
                WHERE item_id = @item_id
                AND stall_id = @stall_id
            `);
        return result.recordset[0] || null;

    } catch (error) {
        console.error(
            "Error retrieving menu item:",
            error
        );
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Helper Function for Create Menu Item: Check whether a menu item name already exists within
// the same stall, used for create menu itemss
exports.getMenuItemByName = async (itemName, stallId) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_name", sql.VarChar(50), itemName)
            .input("stall_id", sql.Int, stallId)
            .query(`
                SELECT item_id
                FROM MenuItem
                WHERE item_name = @item_name
                  AND stall_id = @stall_id
            `);

        return result.recordset[0] || null;

    } catch (error) {
        console.error("Error checking menu item name:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Helper Function for Update Menu Item:
//Checks for duplicate names while excluding the current menu item during updates.
// Prevents vendors from renaming a menu item to another existing menu item's name.
// Used for updating menu items
exports.getMenuItemByNameExcludingId = async (
    itemName,
    stallId,
    itemId
) => {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_name", sql.VarChar(50), itemName)
            .input("stall_id", sql.Int, stallId)
            .input("item_id", sql.Int, itemId)
            .query(`
                SELECT item_id
                FROM MenuItem
                WHERE item_name = @item_name
                  AND stall_id = @stall_id
                  AND item_id <> @item_id
            `);

        return result.recordset[0] || null;

    } catch (error) {
        console.error("Error checking duplicate menu item:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

exports.createMenuItem = async (menuItem) => {
    let connection;

    try {
        if (!menuItem) {
            throw new Error("Menu item data is required.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_name", sql.VarChar(50), menuItem.item_name)
            .input("price", sql.Decimal(10, 2), menuItem.price)
            .input("food_description", sql.VarChar(255), menuItem.food_description)
            .input("allergen_info", sql.VarChar(255), menuItem.allergen_info)
            .input("estimated_waiting_time", sql.Int, menuItem.estimated_waiting_time)
            .input("image_name", sql.VarChar(50), menuItem.image_name)
            .input("stall_id", sql.Int, menuItem.stall_id)
            .query(`
                INSERT INTO MenuItem
                (
                    item_name,
                    price,
                    food_description,
                    allergen_info,
                    estimated_waiting_time,
                    image_name,
                    stall_id
                )
                VALUES
                (
                    @item_name,
                    @price,
                    @food_description,
                    @allergen_info,
                    @estimated_waiting_time,
                    @image_name,
                    @stall_id
                )
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error creating menu item:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

exports.updateMenuItem = async (menuItem, stallId) => {
    let connection;

    try {
        if (!menuItem || !stallId) {
            throw new Error("Invalid menu item or stall ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_id", sql.Int, menuItem.item_id)
            .input("stall_id", sql.Int, stallId)
            .input("item_name", sql.VarChar(50), menuItem.item_name)
            .input("price", sql.Decimal(10, 2), menuItem.price)
            .input("food_description", sql.VarChar(255), menuItem.food_description)
            .input("allergen_info", sql.VarChar(255), menuItem.allergen_info)
            .input("estimated_waiting_time", sql.Int, menuItem.estimated_waiting_time)
            .input("image_name", sql.VarChar(50), menuItem.image_name)
            .query(`
                UPDATE MenuItem
                SET
                    item_name = @item_name,
                    price = @price,
                    food_description = @food_description,
                    allergen_info = @allergen_info,
                    estimated_waiting_time = @estimated_waiting_time,
                    image_name = @image_name
                WHERE item_id = @item_id
                  AND stall_id = @stall_id
            `);

        if (result.rowsAffected[0] === 0) {
            return null;
        }

        return await exports.getMenuItemById(
            menuItem.item_id,
            stallId
        );

    } catch (error) {
        console.error("Error updating menu item:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Delete menu
exports.deleteMenuItem = async (itemId, stallId) => {
    let connection;

    try {
        if (!itemId || !stallId) {
            throw new Error("Invalid item ID or stall ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_id", sql.Int, itemId)
            .input("stall_id", sql.Int, stallId)
            .query(`
                DELETE FROM MenuItem
                WHERE item_id = @item_id
                  AND stall_id = @stall_id
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error deleting menu item:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Toggle Visibility
exports.updateMenuItemVisibility = async (itemId, visibility, stallId) => {
    let connection;

    try {
        if (!itemId || !stallId) {
            throw new Error("Invalid item ID or stall ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input("item_id", sql.Int, itemId)
            .input("visibility", sql.Bit, visibility)
            .input("stall_id", sql.Int, stallId)
            .query(`
                UPDATE MenuItem
                SET visibility = @visibility
                WHERE item_id = @item_id
                  AND stall_id = @stall_id
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {
        console.error("Error updating menu visibility:", error);
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};
