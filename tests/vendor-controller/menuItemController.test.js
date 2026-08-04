const menuItemController = require("../../controllers/menuItemController");
const menuItemModel = require("../../models/menuItemModel");
const vendorController = require("../../controllers/vendorController");

jest.mock("../../models/menuItemModel");
jest.mock("../../controllers/vendorController");

describe("menuItemController", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        req = {
            params: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    // ==========================
    // getAllMenuItems
    // ==========================

    describe("getAllMenuItems", () => {

        it("should return all menu items", async () => {

            const menuItems = [
                {
                    item_id: 1,
                    item_name: "Chicken Rice"
                }
            ];

            vendorController.getVendorStallId.mockResolvedValue(5);
            menuItemModel.getAllMenuItemsByStallId.mockResolvedValue(menuItems);

            await menuItemController.getAllMenuItems(req, res);

            expect(vendorController.getVendorStallId)
                .toHaveBeenCalledWith(req);

            expect(menuItemModel.getAllMenuItemsByStallId)
                .toHaveBeenCalledWith(5);

            expect(res.json)
                .toHaveBeenCalledWith(menuItems);

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId
                .mockRejectedValue(new Error("Database Error"));

            await menuItemController.getAllMenuItems(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Database Error"
                });

        });

    });

    // ==========================
    // getMenuItemById
    // ==========================

    describe("getMenuItemById", () => {

        it("should return menu item", async () => {

            req.params.id = "1";

            const menuItem = {
                item_id: 1,
                item_name: "Chicken Rice"
            };

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.getMenuItemById
                .mockResolvedValue(menuItem);

            await menuItemController.getMenuItemById(req, res);

            expect(menuItemModel.getMenuItemById)
                .toHaveBeenCalledWith(1, 5);

            expect(res.json)
                .toHaveBeenCalledWith(menuItem);

        });

        it("should return 404 if menu item not found", async () => {

            req.params.id = "1";

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.getMenuItemById
                .mockResolvedValue(null);

            await menuItemController.getMenuItemById(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(404);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item not found."
                });

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId
                .mockRejectedValue(new Error());

            await menuItemController.getMenuItemById(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to retrieve menu item."
                });

        });

    });

    // ==========================
    // createMenuItem
    // ==========================

    describe("createMenuItem", () => {

        it("should create menu item", async () => {

            req.body = {
                item_name: "Chicken Rice"
            };

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.createMenuItem
                .mockResolvedValue(true);

            await menuItemController.createMenuItem(req, res);

            expect(menuItemModel.createMenuItem)
                .toHaveBeenCalledWith({
                    item_name: "Chicken Rice",
                    stall_id: 5
                });

            expect(res.status)
                .toHaveBeenCalledWith(201);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item created successfully."
                });

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId
                .mockRejectedValue(new Error());

            await menuItemController.createMenuItem(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to create menu item."
                });

        });

    });

    // ==========================
    // updateMenuItem
    // ==========================

    describe("updateMenuItem", () => {

        beforeEach(() => {
            req.params.id = "1";
            req.body = {
                item_name: "Chicken Rice"
            };
        });

        it("should update menu item", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.getMenuItemByNameExcludingId
                .mockResolvedValue(null);

            menuItemModel.updateMenuItem
                .mockResolvedValue({
                    item_id: 1
                });

            await menuItemController.updateMenuItem(req, res);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item updated successfully.",
                    menuItem: {
                        item_id: 1
                    }
                });

        });

        it("should return duplicate name", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.getMenuItemByNameExcludingId
                .mockResolvedValue({
                    item_id: 99
                });

            await menuItemController.updateMenuItem(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(409);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "A menu item with this name already exists."
                });

        });

        it("should return 404", async () => {

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.getMenuItemByNameExcludingId.mockResolvedValue(null);

            menuItemModel.updateMenuItem.mockResolvedValue(null);

            await menuItemController.updateMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId.mockRejectedValue(new Error());

            await menuItemController.updateMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({ message: "Failed to update menu item." });

        });

    });

    // ==========================
    // deleteMenuItem
    // ==========================

    describe("deleteMenuItem", () => {

        beforeEach(() => {
            req.params.id = "1";
        });

        it("should delete menu item", async () => {

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.deleteMenuItem.mockResolvedValue(true);

            await menuItemController.deleteMenuItem(req, res);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item deleted successfully."
                });

        });

        it("should return 404", async () => {

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.deleteMenuItem.mockResolvedValue(false);

            await menuItemController.deleteMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId.mockRejectedValue(new Error());

            await menuItemController.deleteMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

        });

    });

    // ==========================
    // updateMenuItemVisibility
    // ==========================

    describe("updateMenuItemVisibility", () => {

        beforeEach(() => {
            req.params.id = "1";
            req.body = {
                visibility: true
            };
        });

        it("should update visibility", async () => {

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.updateMenuItemVisibility.mockResolvedValue(true);

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Visibility updated successfully."
                });

        });

        it("should return 404", async () => {

            vendorController.getVendorStallId.mockResolvedValue(5);

            menuItemModel.updateMenuItemVisibility.mockResolvedValue(false);

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

        });

        it("should handle server error", async () => {

            vendorController.getVendorStallId.mockRejectedValue(new Error());

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

        });

    });


    // ==========================
    // deleteMenuItem
    // ==========================

    describe("deleteMenuItem", () => {

        beforeEach(() => {
            req.params.id = "1";
        });

        // Test Case 1: Successfully delete menu item
        it("should delete menu item", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.deleteMenuItem
                .mockResolvedValue(true);

            await menuItemController.deleteMenuItem(req, res);

            expect(vendorController.getVendorStallId)
                .toHaveBeenCalledWith(req);

            expect(menuItemModel.deleteMenuItem)
                .toHaveBeenCalledWith(
                    1,
                    5
                );

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item deleted successfully."
                });

        });

        // Test Case 2: Menu item not found
        it("should return 404", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.deleteMenuItem
                .mockResolvedValue(false);

            await menuItemController.deleteMenuItem(req, res);

            expect(menuItemModel.deleteMenuItem)
                .toHaveBeenCalledWith(
                    1,
                    5
                );

            expect(res.status)
                .toHaveBeenCalledWith(404);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item not found."
                });

        });

        // Test Case 3: Server error
        it("should handle server error", async () => {

            vendorController.getVendorStallId
                .mockRejectedValue(new Error());

            await menuItemController.deleteMenuItem(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to delete menu item."
                });

        });

    });

    // ==========================
    // updateMenuItemVisibility
    // ==========================

    describe("updateMenuItemVisibility", () => {

        beforeEach(() => {
            req.params.id = "1";

            req.body = {
                visibility: true
            };
        });

        // Test Case 1: Successfully update menu item visibility
        it("should update visibility", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.updateMenuItemVisibility
                .mockResolvedValue(true);

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(vendorController.getVendorStallId)
                .toHaveBeenCalledWith(req);

            expect(menuItemModel.updateMenuItemVisibility)
                .toHaveBeenCalledWith(
                    1,
                    true,
                    5
                );

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Visibility updated successfully."
                });

        });

        // Test Case 2: Menu item not found
        it("should return 404", async () => {

            vendorController.getVendorStallId
                .mockResolvedValue(5);

            menuItemModel.updateMenuItemVisibility
                .mockResolvedValue(false);

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(menuItemModel.updateMenuItemVisibility)
                .toHaveBeenCalledWith(
                    1,
                    true,
                    5
                );

            expect(res.status)
                .toHaveBeenCalledWith(404);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Menu item not found."
                });

        });

        // Test Case 3: Server error
        it("should handle server error", async () => {

            vendorController.getVendorStallId
                .mockRejectedValue(new Error());

            await menuItemController.updateMenuItemVisibility(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to update visibility."
                });

        });

    });

});
