const Joi = require("joi");

// Validation Schema for POST
const createFoodCertSchema = Joi.object({
    certificate_name: Joi.string().min(1).max(100).required().messages({
        "string.base": "Certificate name must be a string",
        "string.empty": "Certificate name cannot be empty",
        "string.min": "Certificate name must be at least 1 character long",
        "string.max": "Certificate name cannot exceed 100 characters",
        "any.required": "Certificate name is required"
    }),

    issue_date: Joi.date().required().messages({
        "date.base": "Issue date must be a valid date",
        "any.required": "Issue date is required"
    }),

    expiry_date: Joi.date().greater(Joi.ref("issue_date")).required().messages({
        "date.base": "Expiry date must be a valid date",
        "date.greater": "Expiry date must be later than the issue date",
        "any.required": "Expiry date is required"
    }),

    issuing_authority: Joi.string().min(1).max(100).required().messages({
        "string.base": "Issuing authority must be a string",
        "string.empty": "Issuing authority cannot be empty",
        "string.max": "Issuing authority cannot exceed 100 characters",
        "any.required": "Issuing authority is required"
    }),

    certificate_image: Joi.string().pattern(
        /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=\s]+$/
    ).max(12 * 1024 * 1024).optional().messages({
        "string.pattern.base": "Certificate picture must be a JPG, PNG, or WEBP image.",
        "string.max": "Certificate picture must be 8 MB or smaller."
    }),

    certificate_image_name: Joi.string().max(255).optional()
});

function validateCreateFoodCert(req, res, next) {
     console.log(req.body);
    const { error } = createFoodCertSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        
        return res.status(400).json({
            error: error.details.map(detail => detail.message)
        });
    }

    next();
}

function validateFoodCertId(req, res, next) {
     console.log(req.body);
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid certificate ID. ID must be a positive number."
        });
    }

    next();
}

module.exports = {
    validateCreateFoodCert,
    validateFoodCertId
};
