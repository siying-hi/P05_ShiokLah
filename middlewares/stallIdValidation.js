// Import Joi for validation
const Joi = require("joi");

// Validation schema for retrieving a stall
// Requires a valid stall ID in the route parameters
const stallIdSchema = Joi.object({

    stallId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "Stall ID is required.",
            "number.base": "Stall ID must be a number.",
            "number.integer": "Stall ID must be an integer.",
            "number.positive": "Stall ID must be a positive integer."
        })

});

// Middleware: validateStallId
// Validates the route parameters before retrieving a stall
// Ensures a valid stall ID is provided
function validateStallId(req, res, next) {

    const { error } = stallIdSchema.validate(req.params);

    if (error) {

        return res.status(400).json({

            message: error.details[0].message

        });

    }

    next();

}

module.exports = {

    validateStallId

};