// Import Joi for validation
const Joi = require("joi");

// Validation schema for checkout
// Requires a valid order mode and payment method
const checkoutSchema = Joi.object({

    orderMode: Joi.string()
        .valid("Dine-In", "Self-Pickup")
        .required()
        .messages({

            "string.base":
                "Order mode must be a string.",

            "any.only":
                "Order mode must be either Dine-In or Self-Pickup.",

            "any.required":
                "Order mode is required.",

            "string.base": "Order mode must be a string.",
            "any.only": "Order mode must be either Dine-In or Self-Pickup.",
            "any.required": "Order mode is required."
        }),

    paymentMethod: Joi.string()
        .valid("Cash", "Visa", "Mastercard")
        .required()
        .messages({

            "string.base":
                "Payment method must be a string.",

            "any.only":
                "Invalid payment method.",

            "any.required":
                "Payment method is required."

        }),


    rewardId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({

            "number.base":
                "Reward ID must be a number.",

            "number.integer":
                "Reward ID must be a whole number.",

            "number.positive":
                "Invalid reward ID."

        })

});


// Validate Checkout
/* Legacy incomplete validation block retained for reference.
function validateCheckout(
    req,
    res,
    next
) {

    const {
        error,
        value
    } = checkoutSchema.validate(

            "string.base": "Payment method must be a string.",
            "any.only": "Invalid payment method.",
            "any.required": "Payment method is required."
        })

});
*/

// Middleware: validateCheckout
// Validates the checkout request before payment processing
// Ensures only supported order modes and payment methods are accepted
function validateCheckout(req, res, next) {
    const { error } = checkoutSchema.validate(
        req.body,
        {
            abortEarly: false
        }
    );

    // Preserve the validated request payload for the existing assignment below.
    const value = req.body;


    if (error) {

        return res.status(400).json({

            error: error.details.map(detail => detail.message)

        });

    }

    next();

}

module.exports = {

    validateCheckout
};
