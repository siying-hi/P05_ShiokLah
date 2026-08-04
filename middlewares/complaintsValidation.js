const Joi = require("joi");


const complaintSchema = Joi.object({

    orderId: Joi.number()
        .integer()
        .allow(null)
        .messages({
            "number.base": "Order ID must be a number.",
            "number.integer": "Order ID must be a whole number."
        }),

stallId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "Stall is required.",
        "number.integer": "Invalid stall.",
        "any.required": "Stall is required."
    }),
itemId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "Dish is required.",
        "number.integer": "Invalid dish.",
        "any.required": "Dish is required."
    }),

    purchaseDate: Joi.date()
        .max("now")
        .required()
        .messages({
            "date.base": "Please enter a valid purchase date.",
            "date.max": "Purchase date cannot be in the future.",
            "any.required": "Purchase date is required."
        }),

    foodIssue: Joi.string()
        .trim()
        .max(1000)
        .required()
        .messages({
            "string.empty": "Food issue is required.",
            "string.max": "Food issue cannot exceed 1000 characters.",
            "any.required": "Food issue is required."
        }),

    serviceIssue: Joi.string()
        .trim()
        .max(1000)
        .required()
        .messages({
            "string.empty": "Service issue is required.",
            "string.max": "Service issue cannot exceed 1000 characters.",
            "any.required": "Service issue is required."
        }),

    additionalComments: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .allow(null)
        .messages({
            "string.max": "Additional comments cannot exceed 1000 characters."
        })

});


function validateComplaint(req, res, next) {

const { error, value } = complaintSchema.validate(
    req.body,
    {
        abortEarly: false
    }
);
    if (error) {

        return res.status(400).json({

            errors: error.details.map(
                detail => detail.message
            )

        });

    }
req.body = value;
    next();

}


module.exports = {
    validateComplaint
};