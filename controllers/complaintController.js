const complaintModel = require("../models/complaintModel");


async function getStalls(req, res) {

    try {

        const stalls =
            await complaintModel.getAllStalls();

        res.json(stalls);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve stalls."
        });

    }

}


async function getMenuItems(req, res) {

    try {

        const stallId =
            Number(req.params.stallId);

        if (!Number.isInteger(stallId)) {

            return res.status(400).json({
                message: "Invalid stall id."
            });

        }

        const menuItems =
            await complaintModel.getMenuItemsByStallId(
                stallId
            );

        res.json(menuItems);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve menu items."
        });

    }

}


async function getComplaintHistory(req, res) {

    try {

        const patronId =
            req.user.id;

        const complaints =
            await complaintModel.getComplaintsByPatronId(
                patronId
            );

        res.json(complaints);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve complaints."
        });

    }

}


async function createComplaint(req, res) {

    try {

        const patronId =
            req.user.id;

        const complaint = {

            orderId:
                req.body.orderId || null,

            patronId:
                patronId,

stallId:
    Number(req.body.stallId),

itemId:
    Number(req.body.itemId),

            purchaseDate:
                req.body.purchaseDate,

            foodIssue:
                req.body.foodIssue,

            serviceIssue:
                req.body.serviceIssue,

            additionalComments:
                req.body.additionalComments || null

        };


        const newComplaint =
            await complaintModel.createComplaint(
                complaint
            );


        res.status(201).json({

            message:
                "Complaint submitted successfully.",

            complaint:
                newComplaint

        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to submit complaint."
        });

    }

}


async function updateComplaint(req, res) {

    try {

        const complaintId =
            Number(req.params.complaintId);

        const patronId =
            req.user.id;


        if (!Number.isInteger(complaintId)) {

            return res.status(400).json({
                message: "Invalid complaint id."
            });

        }


        const complaint = {

stallId:
    Number(req.body.stallId),

itemId:
    Number(req.body.itemId),
            purchaseDate:
                req.body.purchaseDate,

            foodIssue:
                req.body.foodIssue,

            serviceIssue:
                req.body.serviceIssue,

            additionalComments:
                req.body.additionalComments || null

        };


        const updatedComplaint =
            await complaintModel.updateComplaint(

                complaintId,

                patronId,

                complaint

            );


        if (!updatedComplaint) {

            return res.status(404).json({
                message: "Complaint not found."
            });

        }


        res.json({

            message:
                "Complaint updated successfully.",

            complaint:
                updatedComplaint

        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update complaint."
        });

    }

}


async function deleteComplaint(req, res) {

    try {

        const complaintId =
            Number(req.params.complaintId);

        const patronId =
            req.user.id;


        if (!Number.isInteger(complaintId)) {

            return res.status(400).json({
                message: "Invalid complaint id."
            });

        }


        const deletedComplaint =
            await complaintModel.deleteComplaint(

                complaintId,

                patronId

            );


        if (!deletedComplaint) {

            return res.status(404).json({
                message: "Complaint not found."
            });

        }


        res.json({
            message:
                "Complaint deleted successfully."
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete complaint."
        });

    }

}


module.exports = {
    getStalls,
    getMenuItems,
    getComplaintHistory,
    createComplaint,
    updateComplaint,
    deleteComplaint
};