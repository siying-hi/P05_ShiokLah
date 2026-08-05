const reviewModel = require("../models/vendorReviewsModel");
const vendorModel = require("../models/vendorModel");

// Get feedback for logged-in vendor's stall
exports.getFeedbackByStallId = async (req, res) => {
    try {
        const vendorId = req.user?.id;

        if (!vendorId) {
            return res.status(401).json({
                message: "Vendor not authenticated."
            });
        }

        const stallId = await vendorModel.getStallIdByVendorId(vendorId);

        if (!stallId) {
            return res.status(404).json({
                message: "Stall not found."
            });
        }

        const feedback = await reviewModel.getFeedbackByStallId(stallId);

        return res.status(200).json(feedback);

    } catch (error) {
        console.error("Error retrieving feedback:", error);

        return res.status(500).json({
            message: "Failed to retrieve feedback."
        });
    }
};

// Get complaints for logged-in vendor's stall
exports.getComplaintByStallId = async (req, res) => {
    try {
        const vendorId = req.user?.id;

        if (!vendorId) {
            return res.status(401).json({
                message: "Vendor not authenticated."
            });
        }

        const stallId = await vendorModel.getStallIdByVendorId(vendorId);

        if (!stallId) {
            return res.status(404).json({
                message: "Stall not found."
            });
        }

        const complaints = await reviewModel.getComplaintByStallId(stallId);

        return res.status(200).json(complaints);

    } catch (error) {
        console.error("Error retrieving complaints:", error);

        return res.status(500).json({
            message: "Failed to retrieve complaints."
        });
    }
};