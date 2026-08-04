const menuItemModel = require("../models/menuItemModel");
const vendorController = require("./vendorController");

//Get all menu items from stall
exports.getAllMenuItems = async (req, res) => {
    try {
        const stallId = await vendorController.getVendorStallId(req);
        const menuItems = await menuItemModel.getAllMenuItemsByStallId(stallId);
        res.json(menuItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Get menu by id
exports.getMenuItemById = async (req, res) => {
    try {
        const stallId = await vendorController.getVendorStallId(req);
        const item = await menuItemModel.getMenuItemById(
            parseInt(req.params.id),
            stallId
        );

        if (!item) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        res.json(item);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Failed to retrieve menu item."
        });

    }
};

//Create menu
exports.createMenuItem = async (req, res) => {
    try {
        const stallId = await vendorController.getVendorStallId(req);

        const {
            item_name,
            price,
            food_description,
            allergen_info,
            estimated_waiting_time,
            image_name
        } = req.body;

        const menuItem = {
            item_name,
            price,
            food_description,
            allergen_info,
            estimated_waiting_time,
            image_name,
            stall_id: stallId
        };

        // Check whether a menu item name already exists within
        const duplicate = await menuItemModel.getMenuItemByName(item_name, stallId);

        if (duplicate) {
            return res.status(409).json({
                message: "A menu item with this name already exists."
            });
        }

        await menuItemModel.createMenuItem(menuItem);

        res.status(201).json({
            message: "Menu item created successfully."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to create menu item."
        });
    }
};

//Update menu
exports.updateMenuItem = async (req, res) => {
    try {
        const stallId = await vendorController.getVendorStallId(req);
        const itemId = parseInt(req.params.id);

        //Checks for duplicate names while excluding the current menu item during updates.
        const duplicate = await menuItemModel.getMenuItemByNameExcludingId(
            req.body.item_name,
            stallId,
            itemId
        );

        if (duplicate) {
            return res.status(409).json({
                message: "A menu item with this name already exists."
            });
        }

        const updatedMenuItem = await menuItemModel.updateMenuItem(
            {
                item_id: itemId,
                item_name: req.body.item_name,
                price: req.body.price,
                food_description: req.body.food_description,
                allergen_info: req.body.allergen_info,
                estimated_waiting_time: req.body.estimated_waiting_time,
                image_name: req.body.image_name
            },
            stallId
        );

        if (!updatedMenuItem) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        res.status(200).json({
            message: "Menu item updated successfully.",
            menuItem: updatedMenuItem
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update menu item."
        });
    }
};

//Delete menu
exports.deleteMenuItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const stallId = await vendorController.getVendorStallId(req);
        const deleted = await menuItemModel.deleteMenuItem(itemId, stallId);
        if (!deleted) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }
        res.json({
            message: "Menu item deleted successfully."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to delete menu item."
        });
    }
};

//Menu Item Visibility
exports.updateMenuItemVisibility = async (req, res) => {

    try {
        const itemId = parseInt(req.params.id);
        const { visibility } = req.body;
        const stallId = await vendorController.getVendorStallId(req);
        const updated = await menuItemModel.updateMenuItemVisibility(
            itemId,
            visibility,
            stallId
        );

        if (!updated) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        res.json({
            message: "Visibility updated successfully."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update visibility."
        });

    }
};