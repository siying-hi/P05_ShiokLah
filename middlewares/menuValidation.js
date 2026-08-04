// Import Joi for validation
const Joi = require("joi");

// List of valid image names
const validImages = [
  "placeholder.png",
  "Set Meal A Picture.jpg",
  "Set Meal B Picture.jpg",
  "Set Meal C Picture.png",
  "Set Meal D Picture.jpg",
  "Otah Picture.webp",
  "malaysiacurry.jpg",
  "meebakso.jpg",
  "nasi-sambal-goreng-daging.jpg",
  "nasilemak.jpg",
  "rendangayam.webp",
  "White Carrot Cake Picture.jpg",
  "Black Carrot Cake Picture.jpg",
  "Other Cuisines Picture.webp",
  "Char Kway Teow Picture.webp",
  "Chinese Cuisine Picture.jpg",
  "Indian Cuisine Picture.webp"
];

//Validation Schema for POST
const createMenuItemSchema = Joi.object({
  item_name: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "Item name must be a string.",
    "string.empty": "Item name cannot be empty.",
    "string.min": "Item name must contain at least 1 character.",
    "string.max": "Item name cannot exceed 50 characters.",
    "any.required": "Item name is required."
  }),

  price: Joi.number().precision(2).positive().required().messages({
    "number.base": "Price must be a valid number.",
    "number.positive": "Price must be greater than 0.",
    "number.precision": "Price can have a maximum of 2 decimal places.",
    "any.required": "Price is required."
  }),

  food_description: Joi.string().trim().max(255).required().messages({
    "string.base": "Food description must be a string.",
    "string.empty": "Food description cannot be empty.",
    "string.max": "Food description cannot exceed 255 characters.",
    "any.required": "Food description is required."
  }),

  allergen_info: Joi.string().trim().max(255).required().messages({
    "string.base": "Allergen information must be a string.",
    "string.empty": "Allergen information cannot be empty.",
    "string.max": "Allergen information cannot exceed 255 characters.",
    "any.required": "Allergen information is required."
  }),

  estimated_waiting_time: Joi.number().integer().min(1).max(240).required().messages({
    "number.base": "Estimated waiting time must be a number.",
    "number.integer": "Estimated waiting time must be a whole number.",
    "number.min": "Estimated waiting time must be at least 1 minute.",
    "number.max": "Estimated waiting time cannot exceed 240 minutes.",
    "any.required": "Estimated waiting time is required."
  }),

  image_name: Joi.string().valid(...validImages).required().messages({
    "string.base": "Image name must be a string.",
    "any.only": "Please select a valid menu image.",
    "any.required": "Image name is required."
  }),
});

// Validation schema for menu items (PUT)
const menuItemSchema = Joi.object({
  item_name: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "Item name must be a string.",
    "string.empty": "Item name cannot be empty.",
    "string.min": "Item name must contain at least 1 character.",
    "string.max": "Item name cannot exceed 50 characters.",
    "any.required": "Item name is required."
  }),

  price: Joi.number().precision(2).positive().required().messages({
    "number.base": "Price must be a valid number.",
    "number.positive": "Price must be greater than 0.",
    "number.precision": "Price can have a maximum of 2 decimal places.",
    "any.required": "Price is required."
  }),

  food_description: Joi.string().trim().max(255).required().messages({
    "string.base": "Food description must be a string.",
    "string.empty": "Food description cannot be empty.",
    "string.max": "Food description cannot exceed 255 characters.",
    "any.required": "Food description is required."
  }),

  allergen_info: Joi.string().trim().max(255).required().messages({
    "string.base": "Allergen information must be a string.",
    "string.empty": "Allergen information cannot be empty.",
    "string.max": "Allergen information cannot exceed 255 characters.",
    "any.required": "Allergen information is required."
  }),

  estimated_waiting_time: Joi.number()
    .integer()
    .min(1)
    .max(240)
    .required()
    .messages({
      "number.base": "Estimated waiting time must be a number.",
      "number.integer": "Estimated waiting time must be a whole number.",
      "number.min": "Estimated waiting time must be at least 1 minute.",
      "number.max": "Estimated waiting time cannot exceed 240 minutes.",
      "any.required": "Estimated waiting time is required."
    }),

  image_name: Joi.string().valid(...validImages).required().messages({
    "string.base": "Image name must be a string.",
    "any.only": "Please select a valid menu image.",
    "any.required": "Image name is required."
  }),
});

//Validation for visibility
const updateVisibilitySchema = Joi.object({
  visibility: Joi.boolean().required().messages({
    "boolean.base": "Visibility must be true or false",
    "any.required": "Visibility is required"
  })
});

// Middleware to validate menu item data (for POST/PUT)
function validateMenuItem(req, res, next) {
  const { error } = menuItemSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate menu item ID from URL parameters (for GET by ID, PUT, DELETE)
function validateMenuItemId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid menu item ID. ID must be a positive number" });
  }

  next();
}

function validateCreateMenuItem(req, res, next) {
  const { error } = createMenuItemSchema.validate(req.body, {
    abortEarly: false
  });
  if (error) {
    return res.status(400).json({
      error: error.details.map(detail => detail.message)
    });
  }
  next();
}

//Checks that the visibility attribute exists and that it is a boolean value
function validateVisibility(req, res, next) {
  const { error } = updateVisibilitySchema.validate(req.body, {
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
  validateMenuItem,
  validateMenuItemId,
  validateCreateMenuItem,
  validateVisibility
};