// Import Joi for validation
const Joi = require("joi");

// Validation schema for adding an item to the cart
// Requires a valid item ID
const addToCartSchema = Joi.object({

    itemId: Joi.number()

        .integer()

        .positive()

        .required()

        .messages({

            "number.base": "Item ID must be a number",
            "number.integer": "Item ID must be an integer",
            "number.positive": "Item ID must be a positive integer",
            "any.required": "Item ID is required"

        })

});

// Validation schema for updating the quantity of a cart item
// Requires a valid item ID and quantity
const updateQuantitySchema = Joi.object({

    itemId: Joi.number()

        .integer()

        .positive()

        .required()

        .messages({

            "number.base": "Item ID must be a number",
            "number.integer": "Item ID must be an integer",
            "number.positive": "Item ID must be a positive integer",
            "any.required": "Item ID is required"

        }),

    quantity: Joi.number()

        .integer()

        .min(1)

        .required()

        .messages({

            "number.base": "Quantity must be a number",
            "number.integer": "Quantity must be an integer",
            "number.min": "Quantity must be at least 1",
            "any.required": "Quantity is required"

        })

});

// Validation schema for removing an item from the cart
// Requires a valid item ID
const removeItemSchema = Joi.object({

    itemId: Joi.number()

        .integer()

        .positive()

        .required()

        .messages({

            "number.base": "Item ID must be a number",
            "number.integer": "Item ID must be an integer",
            "number.positive": "Item ID must be a positive integer",
            "any.required": "Item ID is required"

        })

});

// Middleware: validateAddToCart
// Validates the request body before adding an item to the cart
// Ensures a valid item ID is provided
function validateAddToCart(req, res, next) {

    const { error } = addToCartSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            error: error.details.map(detail => detail.message)

        });

    }

    next();

}

// Middleware: validateUpdateQuantity
// Validates the request body before updating a cart item
// Ensures a valid item ID and quantity are provided
function validateUpdateQuantity(req, res, next) {

    const { error } = updateQuantitySchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            error: error.details.map(detail => detail.message)

        });

    }

    next();

}

// Middleware: validateRemoveItem
// Validates the route parameters before removing an item from the cart
// Ensures a valid item ID is provided
function validateRemoveItem(req, res, next) {

    const { error } = removeItemSchema.validate(req.params, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            error: error.details.map(detail => detail.message)

        });

    }

    next();

}

module.exports = {

    validateAddToCart,
    validateUpdateQuantity,
    validateRemoveItem

};