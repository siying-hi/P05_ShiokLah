const rentalAgreementModel = require("../models/rentalAgreementModel");
const vendorModel = require("../models/vendorModel");


// Get all rental agreements for logged-in vendor's stall
async function getRentalAgreements(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Vendor not authenticated."
            });
        }

        const vendorId = req.user.vendor_id || req.user.id;

        if (!vendorId) {
            return res.status(401).json({
                success: false,
                message: "Invalid vendor information."
            });
        }

        const stallId =
            await vendorModel.getStallIdByVendorId(vendorId);

        if (!stallId) {
            return res.status(404).json({
                success: false,
                message: "No stall found for this vendor."
            });
        }

        const agreements =
            await rentalAgreementModel.getRentalAgreements(
                stallId
            );

        res.status(200).json({
            success: true,
            data: agreements
        });

    } catch (error) {
        console.error(
            "Error retrieving rental agreements:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to retrieve rental agreements"
        });
    }
}


// Get rental agreement by ID
async function getRentalAgreementById(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Vendor not authenticated."
            });
        }

        const vendorId =
            req.user.vendor_id || req.user.id;

        if (!vendorId) {
            return res.status(401).json({
                success: false,
                message: "Invalid vendor information."
            });
        }

        const stallId =
            await vendorModel.getStallIdByVendorId(vendorId);

        if (!stallId) {
            return res.status(404).json({
                success: false,
                message: "No stall found for this vendor."
            });
        }

        const id = req.params.id;

        const agreement =
            await rentalAgreementModel.getRentalAgreementById(
                id
            );

        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Rental agreement not found"
            });
        }

        if (agreement.stall_id !== stallId) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorised to access this rental agreement."
            });
        }

        res.status(200).json({
            success: true,
            data: agreement
        });

    } catch (error) {
        console.error(
            "Error retrieving rental agreement:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to retrieve rental agreement"
        });
    }
}


// Renew rental agreement
async function createRentalAgreement(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Vendor not authenticated."
            });
        }

        const vendorId =
            req.user.vendor_id || req.user.id;

        if (!vendorId) {
            return res.status(401).json({
                success: false,
                message: "Invalid vendor information."
            });
        }

        const stallId =
            await vendorModel.getStallIdByVendorId(vendorId);

        if (!stallId) {
            return res.status(404).json({
                success: false,
                message: "No stall found for this vendor."
            });
        }

        const {
            aid,
            startDate,
            endDate
        } = req.body;

        if (!aid || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Agreement ID, start date and end date are required."
            });
        }

        // Get existing agreement
        const oldAgreement =
            await rentalAgreementModel.getRentalAgreementById(
                aid
            );

        if (!oldAgreement) {
            return res.status(404).json({
                success: false,
                message: "Rental agreement not found."
            });
        }

        // Make sure agreement belongs to vendor's stall
        if (oldAgreement.stall_id !== stallId) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorised to renew this rental agreement."
            });
        }

        // Only expired agreements can be renewed
        if (oldAgreement.agr_status !== "expired") {
            return res.status(400).json({
                success: false,
                message:
                    "Only expired rental agreements can be renewed."
            });
        }

        // Validate dates
        const newStartDate =
            new Date(startDate);

        const newEndDate =
            new Date(endDate);

        if (
            isNaN(newStartDate.getTime()) ||
            isNaN(newEndDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid rental agreement dates."
            });
        }

        if (newEndDate < newStartDate) {
            return res.status(400).json({
                success: false,
                message:
                    "End date cannot be before start date."
            });
        }

        // Use the existing agreement's
        // approved values.
        const rentalPrice =
            oldAgreement.rental_price;

        const tradeType =
            oldAgreement.trade_type;

        const termCondition =
            oldAgreement.agr_term_condition;

        const officerId =
            oldAgreement.officer_id;

        const status = "active";

        const newAgreement =
            await rentalAgreementModel.createRentalAgreement(
                stallId,
                startDate,
                endDate,
                rentalPrice,
                tradeType,
                termCondition,
                officerId,
                status
            );

        res.status(201).json({
            success: true,
            message:
                "Rental agreement renewed successfully.",
            data: newAgreement
        });

    } catch (error) {
        console.error(
            "Error renewing rental agreement:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to renew rental agreement."
        });
    }
}


// Edit rental agreement
async function updateRentalAgreement(req, res) {
    try {
        const agreementId = parseInt(req.params.id);
        const { tradeType } = req.body;

        if (!agreementId) {
            return res.status(400).json({
                message: "Invalid rental agreement ID."
            });
        }

        if (!tradeType) {
            return res.status(400).json({
                message: "Trade type is required."
            });
        }

        if (
            tradeType !== "cooked food" &&
            tradeType !== "uncooked food"
        ) {
            return res.status(400).json({
                message: "Invalid trade type."
            });
        }

        const result =
            await rentalAgreementModel.updateRentalAgreement(
                agreementId,
                tradeType
            );

        return res.status(200).json({
            message: "Rental agreement updated successfully.",
            data: result
        });

    } catch (error) {
        console.error(
            "Error updating rental agreement:",
            error
        );

        return res.status(500).json({
            message: "Unable to update rental agreement."
        });
    }
}

module.exports = {
    getRentalAgreements,
    getRentalAgreementById,
    createRentalAgreement,
    updateRentalAgreement
};