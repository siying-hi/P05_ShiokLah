const Joi = require("joi");

// Schema for creating a favourite
// - Requires an orderId (integer)
// - patronId is excluded because it should come from JWT/session
const createFavouriteSchema = Joi.object({
    orderId: Joi.number().integer().required(),
    customName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
        .messages({
            "string.max": "Custom name must not exceed 50 characters."
        })
});


// Schema for updating a favourite
// - Requires a customName string
// - Must be between 1 and 50 characters
const updateFavouriteSchema = Joi.object({

    customName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
          "string.empty": "Custom name cannot be empty.",
          "string.max": "Custom name must not exceed 50 characters.",
          "any.required": "Custom name is required."
      })

});


// Middleware to validate request body when creating a favourite
// - Checks against createFavouriteSchema
function validateCreateFavourite(req, res, next) {
  const { error } = createFavouriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}

// Middleware to validate request body when updating a favourite
// - Checks against updateFavouriteSchema
function validateUpdateFavourite(req, res, next) {
  const { error } = updateFavouriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}

// Export middleware functions so they can be used in routes
module.exports = {
    validateCreateFavourite,
    validateUpdateFavourite

};