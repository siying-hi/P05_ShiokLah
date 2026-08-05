const stallModel = require("../models/stallModel");

exports.getStallsById = async (req, res) => {
    try {
        const stallId = parseInt(req.params.id, 10);

        if (Number.isNaN(stallId) || stallId <= 0) {
            return res.status(400).json({
                message: "Valid stall id is required."
            });
        }

        const stall = await stallModel.getStallsById(stallId);

        if (!stall) {
            return res.status(404).json({
                message: "Stall not found."
            });
        }

        return res.status(200).json(stall);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Failed to retrieve stall."
        });
    }
};
