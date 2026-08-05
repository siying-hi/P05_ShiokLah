const Joi = require("joi");

const createCuisineSchema = Joi.object({
    cuisine_type: Joi.string().trim().max(20).required().messages({
        "string.empty": "Cuisine name is required.",
        "string.max": "Cuisine name cannot exceed 20 characters."
    })
});

function validateCreateCuisine(req, res, next) {
    const { error } = createCuisineSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}

function validateCuisineId(req, res, next) {
    const cuisineId = parseInt(req.params.id);
    if (isNaN(cuisineId) || cuisineId <= 0) {
        return res.status(400).json({
            message: "Invalid cuisine id."
        });
    }
    next();
}

module.exports = {
    validateCreateCuisine,
    validateCuisineId
};