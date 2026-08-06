const feedbackModel = require("../models/feedbacksModel"); //imported feedback model
const rewardsModel =
    require("../models/rewardsModel");


// Check that a rating is from 1 to 5
function isValidRating(rating) {   //helper function checks if the rating is a valid integer between 1 and 5
    return (
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5
    );
}


// Get all existing stalls
async function getAllStalls(req, res) {
    try {
        const stalls =
            await feedbackModel.getAllStalls();

        return res.status(200).json(stalls);

    } catch (error) {
        console.error(
            "Error retrieving stalls:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve stalls."
        });
    }
}


// Get the logged-in patron's orders
async function getPatronOrders(req, res) {
    try {
        if (!req.user || !req.user.id) { // Check if the user is logged in
            return res.status(401).json({
                message: "You must be logged in."
            });
        }

        const patronId = req.user.id;

        const orders =
            await feedbackModel.getPatronOrders(
                patronId
            );

        return res.status(200).json(orders);

    } catch (error) {
        console.error(
            "Error retrieving orders:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve orders."
        });
    }
}


// Get all feedback submitted by the logged-in patron
async function getFeedbacksByPatron(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "You must be logged in."
            });
        }

        const patronId = req.user.id;

        const feedbacks =
            await feedbackModel.getFeedbacksByPatron(
                patronId
            );

        return res.status(200).json(feedbacks);

    } catch (error) {
        console.error(
            "Error retrieving feedback:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve feedback."
        });
    }
}


// Get one feedback
async function getFeedbackById(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            message: "You must be logged in."
        });
    }

    const feedbackId = Number(req.params.id);
    const patronId = req.user.id;

    if (
        !Number.isInteger(feedbackId) ||
        feedbackId <= 0
    ) {
        return res.status(400).json({
            message: "Invalid feedback ID."
        });
    }

    try {
        const feedback =
            await feedbackModel.getFeedbackById(
                feedbackId,
                patronId
            );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found."
            });
        }

        return res.status(200).json(feedback);

    } catch (error) {
        console.error(
            "Error retrieving feedback:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve feedback."
        });
    }
}


// Create feedback
async function createFeedback(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "You must be logged in."
            });
        }

        const patronId = req.user.id;

        const {
            order_id,
            stall_id,
            food_rating,
            service_rating,
            atmosphere_rating,
            feedback_description
        } = req.body;
        const stallId = Number(stall_id);
        const foodRating = Number(food_rating);
        const serviceRating = Number(service_rating);
        const atmosphereRating =
            Number(atmosphere_rating);

        if (
            !Number.isInteger(stallId) ||
            stallId <= 0
        ) {
            return res.status(400).json({
                message: "Please select a valid stall."
            });
        }

        if (
            !isValidRating(foodRating) ||
            !isValidRating(serviceRating) ||
            !isValidRating(atmosphereRating)
        ) {
            return res.status(400).json({
                message:
                    "All ratings must be between 1 and 5."
            });
        }

        if (
            feedback_description &&
            feedback_description.length > 500
        ) {
            return res.status(400).json({
                message:
                    "Feedback description cannot exceed 500 characters."
            });
        }

        const newFeedback =
            await feedbackModel.createFeedback(
                order_id,
                patronId,
                stallId,
                foodRating,
                serviceRating,
                atmosphereRating,
                feedback_description
            );
return res.status(201).json({
    message:
        "Feedback submitted successfully.",
    feedback: newFeedback
});
    } catch (error) {
        console.error(
            "Error creating feedback:",
            error
        );

return res.status(500).json({
    message: error.message
});
    }
}


// Update feedback
async function updateFeedback(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            message: "You must be logged in."
        });
    }

    const feedbackId = Number(req.params.id);
    const patronId = req.user.id;

    const {
        order_id,
        stall_id,
        food_rating,
        service_rating,
        atmosphere_rating,
        feedback_description
    } = req.body;
const stallId =
    Number(stall_id);
    const foodRating = Number(food_rating);
    const serviceRating = Number(service_rating);
    const atmosphereRating =
        Number(atmosphere_rating);

    if (
        !Number.isInteger(feedbackId) ||
        feedbackId <= 0
    ) {
        return res.status(400).json({
            message: "Invalid feedback ID."
        });
    }

    if (
        !isValidRating(foodRating) ||
        !isValidRating(serviceRating) ||
        !isValidRating(atmosphereRating)
    ) {
        return res.status(400).json({
            message:
                "All ratings must be between 1 and 5."
        });
    }

    if (
        feedback_description &&
        feedback_description.length > 500
    ) {
        return res.status(400).json({
            message:
                "Feedback description cannot exceed 500 characters."
        });
    }


    try {
const feedback =
    await feedbackModel.updateFeedback(
        feedbackId,
        patronId,
        stallId,
        foodRating,
        serviceRating,
        atmosphereRating,
        feedback_description
    );

        if (!feedback) {
            return res.status(404).json({
                message:
                    "Feedback not found or does not belong to you."
            });
        }

        return res.status(200).json({
            message:
                "Feedback updated successfully.",
            feedback
        });

    } catch (error) {
        console.error(
            "Error updating feedback:",
            error
        );

        return res.status(500).json({
            message: "Unable to update feedback."
        });
    }
}


// Delete feedback
async function deleteFeedback(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            message: "You must be logged in."
        });
    }

    const feedbackId = Number(req.params.id);
    const patronId = req.user.id;

    if (
        !Number.isInteger(feedbackId) ||
        feedbackId <= 0
    ) {
        return res.status(400).json({
            message: "Invalid feedback ID."
        });
    }

    try {
        const deletedFeedback =
            await feedbackModel.deleteFeedback(
                feedbackId,
                patronId
            );

        if (!deletedFeedback) {
            return res.status(404).json({
                message:
                    "Feedback not found or does not belong to you."
            });
        }

        return res.status(200).json({
            message:
                "Feedback deleted successfully."
        });

    } catch (error) {
        console.error(
            "Error deleting feedback:",
            error
        );

        return res.status(500).json({
            message: "Unable to delete feedback."
        });
    }
}


module.exports = {
    getAllStalls,
    getPatronOrders,
    getFeedbacksByPatron,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback
};