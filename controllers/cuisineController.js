const cuisineModel = require("../models/cuisineModel");

//Get all cuisine types registered by vendors
exports.getVendorCuisines = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const cuisines = await cuisineModel.getVendorCuisines(vendorId);
        res.json(cuisines);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to load cuisines."
        });
    }
};

//Get current cuisine
exports.getCuisine = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const cuisine = await cuisineModel.getCuisineByVendorId(vendorId);

        if (!cuisine) {
            return res.status(404).json({
                message: "Cuisine not found."
            });
        }

        res.json(cuisine);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to retrieve cuisine."
        });
    }
};

//Create cuisine
exports.createCuisine = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const {
            cuisine_type
        } = req.body;

        const exists = await cuisineModel.cuisineExists(
            cuisine_type
        );

        if (exists) {
            return res.status(409).json({
                message: "Cuisine already exists."
            });
        }

        await cuisineModel.createCuisine({
            cuisine_type,
            vendor_id: vendorId
        });

        res.status(201).json({
            message: "Cuisine created successfully."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to create cuisine."
        });
    }
};

//Update cuisine
exports.updateCuisine = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const cuisineId = parseInt(req.params.id);

        const updated = await cuisineModel.updateCuisine(vendorId,cuisineId);

        if (!updated) {
            return res.status(404).json({
                message: "Cuisine not found."
            });
        }

        res.json({
            message: "Cuisine updated successfully."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to update cuisine."
        });
    }
};

//Delete cuisine
exports.deleteCuisine = async (req, res) => {
    try {

        const vendorId = req.user.id;
        const deleted = await cuisineModel.deleteCuisine(req.params.id,vendorId);

        if (!deleted) {
            return res.status(400).json({
                message: "Cuisine cannot be deleted because it is currently assigned to your stall or is not a custom cuisine."
            });
        }

        res.json({
            message: "Cuisine deleted successfully."
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to delete cuisine."
        });
    }
};