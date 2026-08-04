const Joi = require("joi");


// Schema for filtering orders
// - startDate and endDate: optional ISO date strings
// - status: optional string, must be either "completed" or "cancelled"

const filterSchema = Joi.object({

    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .message("Start date must be in YYYY-MM-DD format")
        .optional(),

    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .message("End date must be in YYYY-MM-DD format")
        .optional(),

    status: Joi.string()
        .lowercase()
        .valid("completed", "cancelled")
        .optional(),

});

// Middleware to validate query parameters for order filtering
// - Validates req.query against filterSchema
function validateFilter(req, res, next) {
    const { error } = filterSchema.validate(req.query);

    if (error) {
        return res.status(400).json({
        message: error.details[0].message
        });
    }

    next();
}

module.exports = { validateFilter };
