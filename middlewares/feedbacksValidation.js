// Check whether a value is a valid whole number
function isValidId(value) {
    const number = Number(value);

    return Number.isInteger(number) && number > 0;
}


// Check whether a rating is between 1 and 5
function isValidRating(value) {
    const number = Number(value);

    return (
        Number.isInteger(number) &&
        number >= 1 &&
        number <= 5
    );
}


// Validate feedback ID from the URL
function validateFeedbackId(req, res, next) {

    const feedbackId = req.params.id;

    if (!isValidId(feedbackId)) {

        return res.status(400).json({
            message: "Invalid feedback ID."
        });

    }

    next();

}


// Validate data when creating feedback
function validateCreateFeedback(req, res, next) {
    const {
        stall_id,
        food_rating,
        service_rating,
        atmosphere_rating,
        feedback_description
    } = req.body;

    const stallId = Number(stall_id);
    const foodRating = Number(food_rating);
    const serviceRating = Number(service_rating);
    const atmosphereRating = Number(
        atmosphere_rating
    );

    if (
        !Number.isInteger(stallId) ||
        stallId <= 0
    ) {
        return res.status(400).json({
            message: "A valid stall ID is required."
        });
    }

    if (
        !Number.isInteger(foodRating) ||
        foodRating < 1 ||
        foodRating > 5
    ) {
        return res.status(400).json({
            message:
                "Food rating must be between 1 and 5."
        });
    }

    if (
        !Number.isInteger(serviceRating) ||
        serviceRating < 1 ||
        serviceRating > 5
    ) {
        return res.status(400).json({
            message:
                "Service rating must be between 1 and 5."
        });
    }

    if (
        !Number.isInteger(atmosphereRating) ||
        atmosphereRating < 1 ||
        atmosphereRating > 5
    ) {
        return res.status(400).json({
            message:
                "Atmosphere rating must be between 1 and 5."
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

    next();
}


// Validate data when updating feedback
function validateUpdateFeedback(req, res, next) {

const {
    stall_id,
    food_rating,
    service_rating,
    atmosphere_rating,
    feedback_description
    } = req.body;
    if (!isValidId(stall_id)) {

    return res.status(400).json({
        message: "Please select a valid stall."
    });

}

    if (!isValidRating(food_rating)) {

        return res.status(400).json({
            message: "Food rating must be between 1 and 5."
        });

    }

    if (!isValidRating(service_rating)) {

        return res.status(400).json({
            message: "Service rating must be between 1 and 5."
        });

    }

    if (!isValidRating(atmosphere_rating)) {

        return res.status(400).json({
            message: "Atmosphere rating must be between 1 and 5."
        });

    }

    if (
        feedback_description !== undefined &&
        feedback_description !== null &&
        typeof feedback_description !== "string"
    ) {

        return res.status(400).json({
            message: "Feedback description must be text."
        });

    }

    if (
        feedback_description &&
        feedback_description.trim().length > 500
    ) {

        return res.status(400).json({
            message:
                "Feedback description cannot exceed 500 characters."
        });

    }

    next();

}


module.exports = {
    validateFeedbackId,
    validateCreateFeedback,
    validateUpdateFeedback
};