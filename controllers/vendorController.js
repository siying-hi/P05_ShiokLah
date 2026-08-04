const vendorModel = require("../models/vendorModel");

exports.getVendorStallId = async (req) => {

    if (!req.user) {
        throw new Error("Vendor not authenticated.");
    }

    //Retrieves vendor_id from access token
    const vendorId = req.user.id;
    const stallId = await vendorModel.getStallIdByVendorId(vendorId);
    return stallId;
};

exports.getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const vendor = await vendorModel.getVendorById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        res.status(200).json(vendor);

    } catch (err) {
        console.error("Error retrieving vendor profile:", err);

        res.status(500).json({
            message: err.message
        });

    }
};