const Joi = require("joi");

// Validation schema for adding a new card
// Requires all card details to be provided
const cardSchema = Joi.object({

    cardholderName: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.base": "Cardholder name must be text",
            "string.empty": "Cardholder name is required",
            "string.max": "Cardholder name cannot exceed 100 characters",
            "any.required": "Cardholder name is required"
        }),

    cardNumber: Joi.string()
        .pattern(/^[0-9]{16}$/)
        .required()
        .messages({
            "string.base": "Card number must be text",
            "string.empty": "Card number is required",
            "string.pattern.base": "Card number must contain exactly 16 digits",
            "any.required": "Card number is required"
        }),

    expiryMonth: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])$/)
        .required()
        .messages({
            "string.base": "Expiry month must be text",
            "string.empty": "Expiry month is required",
            "string.pattern.base": "Expiry month must be between 01 and 12",
            "any.required": "Expiry month is required"
        }),

    expiryYear: Joi.string()
        .pattern(/^[0-9]{4}$/)
        .required()
        .messages({
            "string.base": "Expiry year must be text",
            "string.empty": "Expiry year is required",
            "string.pattern.base": "Expiry year must be a 4-digit year",
            "any.required": "Expiry year is required"
        }),

    cvv: Joi.string()
        .pattern(/^[0-9]{3}$/)
        .required()
        .messages({
            "string.base": "CVV must be text",
            "string.empty": "CVV is required",
            "string.pattern.base": "CVV must contain exactly 3 digits",
            "any.required": "CVV is required"
        })

});


// Validation schema for updating an existing card
// Allows unchanged card number and CVV while validating edited fields
const updateCardSchema = Joi.object({

    cardholderName: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.empty": "Cardholder name is required",
            "string.max": "Cardholder name cannot exceed 100 characters"
        }),

    cardNumber: Joi.string()
        .allow("")
        .pattern(/^[0-9]{16}$/)
        .messages({
            "string.pattern.base":
                "Card number must contain exactly 16 digits"
        }),

    expiryMonth: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])$/)
        .required()
        .messages({
            "string.empty": "Expiry month is required",
            "string.pattern.base":
                "Expiry month must be between 01 and 12"
        }),

    expiryYear: Joi.string()
        .pattern(/^[0-9]{4}$/)
        .required()
        .messages({
            "string.empty": "Expiry year is required",
            "string.pattern.base":
                "Expiry year must be a 4-digit year"
        }),

    cvv: Joi.string()
        .allow("")
        .pattern(/^[0-9]{3}$/)
        .messages({
            "string.pattern.base":
                "CVV must contain exactly 3 digits"
        })

});


// Middleware: validateCard
// Validates all fields when adding a new card
// Also ensures the card has not expired
function validateCard(req, res, next) {

    const { error } = cardSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            error: error.details.map(detail => detail.message)

        });

    }

    // Validate that the expiry date has not passed
    if (!validateExpiryDate(

        req.body.expiryMonth,
        req.body.expiryYear

    )) {

        return res.status(400).json({

            error: [

                "Expiry date must be after the current month."
                
            ]

        });

    }

    next();

}


// Middleware: validateUpdateCard
// Validates updated card details
// Ensures required fields are present and the card has not expired
function validateUpdateCard(req, res, next) {

    const { error } = updateCardSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            error:

                error.details.map(detail => detail.message)

        });

    }

    // Validate that the expiry date has not passed
    if (!validateExpiryDate(

        req.body.expiryMonth,
        req.body.expiryYear

    )) {

        return res.status(400).json({

            error: [

                "Expiry date must be after the current month."

            ]

        });

    }

    next();

}

// Validate card ID
// Ensures the card ID route parameter is a positive integer
function validateCardId(req, res, next) {

    const cardId =
        Number(req.params.cardId);

    if (
        !Number.isInteger(cardId) ||
        cardId <= 0
    ) {

        return res.status(400).json({

            message: "Card ID must be a positive integer."

        });

    }

    next();

}


// Helper: validateExpiryDate
// Checks whether the card expiry date is after the current month
// Returns true if the card is still valid, otherwise false
function validateExpiryDate(expiryMonth, expiryYear) {

    const today = new Date();

    const currentYear = today.getFullYear();

    const currentMonth = today.getMonth() + 1;

    const selectedYear = Number(expiryYear);

    const selectedMonth = Number(expiryMonth);

    if (

        selectedYear < currentYear ||

        (

            selectedYear === currentYear &&
            selectedMonth <= currentMonth

        )

    ) {

        return false;

    }

    return true;

}

module.exports = {

    validateCard,
    validateUpdateCard,
    validateCardId

};