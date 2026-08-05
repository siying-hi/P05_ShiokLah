// Import Joi for validation
const Joi = require("joi");

// Validation schema for updating a patron profile
// Requires a valid username, first name, last name and email address
const updateProfileSchema = Joi.object({

    username: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Username is required.",
            "string.min": "Username must be at least 3 characters.",
            "string.max": "Username cannot exceed 50 characters.",
            "any.required": "Username is required."
        }),

    firstName: Joi.string()
        .trim()
        .max(50)
        .required()
        .messages({
            "string.empty": "First name is required.",
            "string.max": "First name cannot exceed 50 characters.",
            "any.required": "First name is required."
        }),

    lastName: Joi.string()
        .trim()
        .max(50)
        .required()
        .messages({
            "string.empty": "Last name is required.",
            "string.max": "Last name cannot exceed 50 characters.",
            "any.required": "Last name is required."
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(100)
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address.",
            "string.max": "Email cannot exceed 100 characters.",
            "any.required": "Email is required."
        })

});

// Middleware: validateUpdateProfile
// Validates the request body before updating a patron profile
// Ensures all required profile fields are valid
function validateUpdateProfile(req, res, next) {

    const { error } = updateProfileSchema.validate(
        req.body,
        {
            abortEarly: false
        }
    );

    if (error) {
        return res.status(400).json({
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
}

module.exports = {

    validateUpdateProfile
    
};