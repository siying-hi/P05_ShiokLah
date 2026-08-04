const menuItem = require("../../models/menuItemModel");
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

jest.mock("mssql"); // Mock the mssql library

// Get All Menu Items By Stall Id
describe("menuItem.getAllMenuItemsByStallId", () => {

    // Reset all mocks before each test case
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully retrieve all menu items for a stall
    it("should retrieve all menu items for the specified stall", async () => {

        const stallId = 1;

        const mockMenuItems = [
            {
                item_id: 1,
                item_name: "Chicken Rice",
                price: 5.50,
                food_description: "Chicken rice",
                allergen_info: "None",
                estimated_waiting_time: 15,
                image_name: "chicken.png", // Unacceptable image_name
                visibility: true
            },
            {
                item_id: 2,
                item_name: "Laksa",
                price: 6.00,
                food_description: "Laksa",
                allergen_info: "Seafood",
                estimated_waiting_time: 10,
                image_name: "laksa.png",
                visibility: true
            }
        ];

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: mockMenuItems
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return the mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const menuItems = await menuItem.getAllMenuItemsByStallId(stallId);

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify request object was created
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        // Verify SQL parameter
        expect(mockRequest.input).toHaveBeenCalledWith("stallId",sql.Int,stallId);

        // Verify SQL query executed
        expect(mockRequest.query).toHaveBeenCalled();

        // Verify connection was closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify returned records
        expect(menuItems).toHaveLength(2);

        expect(menuItems[0].item_id).toBe(1);
        expect(menuItems[0].item_name).toBe("Chicken Rice");
        expect(menuItems[0].price).toBe(5.50);
        expect(menuItems[0].estimated_waiting_time).toBe(15);
        expect(menuItems[0].visibility).toBe(true);

        expect(menuItems[1].item_id).toBe(2);
        expect(menuItems[1].item_name).toBe("Laksa");
        expect(menuItems[1].price).toBe(6.00);
        expect(menuItems[1].estimated_waiting_time).toBe(10);
        expect(menuItems[1].visibility).toBe(true);

    });

    // Test Case 2: Stall has no menu items
    it("should return an empty array when the stall has no menu items", async () => {

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return the mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const menuItems = await menuItem.getAllMenuItemsByStallId(1);

        // Verify empty result
        expect(menuItems).toEqual([]);

        // Verify connection was closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should handle database errors when retrieving menu items", async () => {

        const errorMessage = "Database Error";

        // Mock database connection failure
        sql.connect.mockRejectedValue(new Error(errorMessage));

        // Verify error is thrown
        await expect(menuItem.getAllMenuItemsByStallId(1)).rejects.toThrow(errorMessage);
    });

    // Test Case 4: Invalid stall ID
    it("should throw an error when stall ID is invalid", async () => {

        // Verify invalid stall ID throws an error
        await expect(menuItem.getAllMenuItemsByStallId(null)).rejects.toThrow("Invalid stall ID.");

    });

});

//
// ==============================
// Get Menu Item By Id
// ==============================
//

describe("menuItem.getMenuItemById", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully retrieve menu item
    it("should retrieve the specified menu item", async () => {

        const mockMenuItem = {
            item_id: 1,
            item_name: "Chicken Rice",
            price: 5.50,
            food_description: "Steamed chicken with fragrant rice",
            allergen_info: "None",
            estimated_waiting_time: 15,
            image_name: "chickenrice.png",
            visibility: true
        };

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [mockMenuItem]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.getMenuItemById(1, 1);

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_id",
            sql.Int,
            1
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toEqual(mockMenuItem);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Menu item does not exist
    it("should return null when menu item is not found", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.getMenuItemById(999, 1);

        expect(result).toBeNull();

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw database error when retrieving menu item", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            menuItem.getMenuItemById(1, 1)
        ).rejects.toThrow("Database Error");

    });

});

//
// ==============================
// Get Menu Item By Name
// ==============================
//

describe("menuItem.getMenuItemByName", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Menu item exists
    it("should return the menu item when it exists", async () => {

        const mockItem = {
            item_id: 1
        };

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [mockItem]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByName(
                "Chicken Rice",
                1
            );

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_name",
            sql.VarChar(50),
            "Chicken Rice"
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toEqual(mockItem);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Menu item does not exist
    it("should return null when menu item does not exist", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByName(
                "Chicken Rice",
                1
            );

        expect(result).toBeNull();

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Invalid stall id
    it("should return null when stall id does not exist", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByName(
                "Chicken Rice",
                999
            );

        expect(result).toBeNull();

    });

    // Test Case 4: Database error
    it("should throw database error", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            menuItem.getMenuItemByName(
                "Chicken Rice",
                1
            )
        ).rejects.toThrow("Database Error");

    });

});

//
// =======================================
// Get Menu Item By Name Excluding Id
// =======================================
//

describe("menuItem.getMenuItemByNameExcludingId", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Duplicate menu item exists
    it("should return duplicate menu item", async () => {

        const mockDuplicate = {
            item_id: 2
        };

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [mockDuplicate]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByNameExcludingId(
                "Chicken Rice",
                1,
                5
            );

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_name",
            sql.VarChar(50),
            "Chicken Rice"
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            3,
            "item_id",
            sql.Int,
            5
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toEqual(mockDuplicate);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: No duplicate exists
    it("should return null when no duplicate exists", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByNameExcludingId(
                "Chicken Rice",
                1,
                5
            );

        expect(result).toBeNull();

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Invalid stall id
    it("should return null when stall id is invalid", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result =
            await menuItem.getMenuItemByNameExcludingId(
                "Chicken Rice",
                999,
                1
            );

        expect(result).toBeNull();

    });

    // Test Case 4: Database error
    it("should throw database error", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            menuItem.getMenuItemByNameExcludingId(
                "Chicken Rice",
                1,
                5
            )
        ).rejects.toThrow("Database Error");

    });

});

//
// ==============================
// Create Menu Item
// ==============================
//

describe("menuItem.createMenuItem", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const newMenuItem = {
        item_name: "Chicken Rice",
        price: 5.50,
        food_description: "Steamed chicken with fragrant rice",
        allergen_info: "None",
        estimated_waiting_time: 15,
        image_name: "placeholder.png",
        stall_id: 1
    };

    // Test Case 1: Successfully create a menu item
    it("should create a menu item successfully", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.createMenuItem(newMenuItem);

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_name",
            sql.VarChar(50),
            newMenuItem.item_name
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "price",
            sql.Decimal(10, 2),
            newMenuItem.price
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            3,
            "food_description",
            sql.VarChar(255),
            newMenuItem.food_description
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            4,
            "allergen_info",
            sql.VarChar(255),
            newMenuItem.allergen_info
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            5,
            "estimated_waiting_time",
            sql.Int,
            newMenuItem.estimated_waiting_time
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            6,
            "image_name",
            sql.VarChar(50),
            newMenuItem.image_name
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            7,
            "stall_id",
            sql.Int,
            newMenuItem.stall_id
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toBe(true);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Insert affects no rows
    it("should return false when menu item is not created", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.createMenuItem(newMenuItem);

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Menu item object is null
    it("should throw an error when menu item data is null", async () => {

        await expect(menuItem.createMenuItem(null))
            .rejects.toThrow("Menu item data is required.");

    });

    // Test Case 4: Menu item object is undefined
    it("should throw an error when menu item data is undefined", async () => {

        await expect(menuItem.createMenuItem(undefined))
            .rejects.toThrow("Menu item data is required.");

    });

    // Test Case 5: Stall ID is missing
    it("should throw a database error when stall ID is missing", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        const invalidMenuItem = {
            ...newMenuItem,
            stall_id: null
        };

        await expect(menuItem.createMenuItem(invalidMenuItem))
            .rejects.toThrow("Database Error");

    });

    // Test Case 6: Database error
    it("should throw database error when creating menu item", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(menuItem.createMenuItem(newMenuItem))
            .rejects.toThrow("Database Error");

    });

});

// ==============================
// Update Menu Item
// ==============================

describe("menuItem.updateMenuItem", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const updatedMenuItem = {
        item_id: 1,
        item_name: "Chicken Rice",
        price: 5.50,
        food_description: "Steamed chicken with fragrant rice",
        allergen_info: "None",
        estimated_waiting_time: 15,
        image_name: "placeholder.png"
    };

    // Test Case 1: Successfully update menu item
    it("should update the menu item successfully", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        jest.spyOn(menuItem, "getMenuItemById").mockResolvedValue(updatedMenuItem);

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.updateMenuItem(updatedMenuItem, 1);

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_id",
            sql.Int,
            updatedMenuItem.item_id
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            3,
            "item_name",
            sql.VarChar(50),
            updatedMenuItem.item_name
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            4,
            "price",
            sql.Decimal(10, 2),
            updatedMenuItem.price
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            5,
            "food_description",
            sql.VarChar(255),
            updatedMenuItem.food_description
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            6,
            "allergen_info",
            sql.VarChar(255),
            updatedMenuItem.allergen_info
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            7,
            "estimated_waiting_time",
            sql.Int,
            updatedMenuItem.estimated_waiting_time
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            8,
            "image_name",
            sql.VarChar(50),
            updatedMenuItem.image_name
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(menuItem.getMenuItemById).toHaveBeenCalledWith(1, 1);

        expect(result).toEqual(updatedMenuItem);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Menu item not found
    it("should return null when menu item does not exist", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.updateMenuItem(updatedMenuItem, 1);

        expect(result).toBeNull();

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Invalid menu item
    it("should throw an error when menu item is null", async () => {

        await expect(menuItem.updateMenuItem(null, 1))
            .rejects.toThrow("Invalid menu item or stall ID.");

    });

    // Test Case 4: Invalid stall ID
    it("should throw an error when stall ID is null", async () => {

        await expect(menuItem.updateMenuItem(updatedMenuItem, null))
            .rejects.toThrow("Invalid menu item or stall ID.");

    });

    // Test Case 5: Database error
    it("should throw database error", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(menuItem.updateMenuItem(updatedMenuItem, 1))
            .rejects.toThrow("Database Error");

    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

});

//
// ==============================
// Delete Menu Item
// ==============================
//

describe("menuItem.deleteMenuItem", () => {

    // Reset all mocks before each test case
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully delete a menu item
    it("should delete the specified menu item", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.deleteMenuItem(1, 1);

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_id",
            sql.Int,
            1
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toBe(true);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Menu item not found
    it("should return false when the menu item does not exist", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.deleteMenuItem(999, 1);

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw database error when deleting menu item", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            menuItem.deleteMenuItem(1, 1)
        ).rejects.toThrow("Database Error");

    });

    // Test Case 4: Invalid item ID or stall ID
    it("should throw an error when item ID or stall ID is invalid", async () => {

        await expect(
            menuItem.deleteMenuItem(null, 1)
        ).rejects.toThrow(
            "Invalid item ID or stall ID."
        );

    });

});

//
// ==============================
// Update Menu Item Visibility
// ==============================
//

describe("menuItem.updateMenuItemVisibility", () => {

    // Reset all mocks before each test case
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully update menu item visibility
    it("should update the visibility of the specified menu item", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.updateMenuItemVisibility(
            1,
            true,
            1
        );

        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "item_id",
            sql.Int,
            1
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "visibility",
            sql.Bit,
            true
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            3,
            "stall_id",
            sql.Int,
            1
        );

        expect(mockRequest.query).toHaveBeenCalled();

        expect(result).toBe(true);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 2: Menu item not found
    it("should return false when the menu item does not exist", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await menuItem.updateMenuItemVisibility(
            999,
            false,
            1
        );

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw database error when updating menu item visibility", async () => {

        sql.connect.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            menuItem.updateMenuItemVisibility(
                1,
                true,
                1
            )
        ).rejects.toThrow("Database Error");

    });

    // Test Case 4: Invalid item ID or stall ID
    it("should throw an error when item ID or stall ID is invalid", async () => {

        await expect(
            menuItem.updateMenuItemVisibility(
                null,
                true,
                1
            )
        ).rejects.toThrow(
            "Invalid item ID or stall ID."
        );

    });

});