// Import Joi for validation
const Joi = require("joi");

// Validation Schema for POST
const createRentalAgreementSchema = Joi.object({
  stall_id: Joi.number().integer().positive().required().messages({
    "number.base": "Stall ID must be a number",
    "number.integer": "Stall ID must be an integer",
    "number.positive": "Stall ID must be a positive number",
    "any.required": "Stall ID is required",
  }),

  agr_status: Joi.string()
    .valid("Active", "Expired", "Rejected")
    .required()
    .messages({
      "string.base": "Agreement status must be a string",
      "any.only": "Agreement status must be Active, Expired or Rejected",
      "any.required": "Agreement status is required",
    }),

  start_date: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),

  end_date: Joi.date()
    .greater(Joi.ref("start_date"))
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "date.greater": "End date must be after start date",
      "any.required": "End date is required",
    }),

});


// Validation Schema for PUT
const rentalAgreementSchema = Joi.object({

  agreement_id: Joi.number().integer().positive().required().messages({
    "number.base": "Agreement ID must be a number",
    "number.integer": "Agreement ID must be an integer",
    "number.positive": "Agreement ID must be a positive number",
    "any.required": "Agreement ID is required",
  }),

  agreement_no: Joi.string().min(1).max(10).required().messages({
    "string.base": "Agreement number must be a string",
    "string.empty": "Agreement number cannot be empty",
    "string.min": "Agreement number must be at least 1 character long",
    "string.max": "Agreement number cannot exceed 10 characters",
    "any.required": "Agreement number is required",
  }),

  stall_id: Joi.number().integer().positive().required().messages({
    "number.base": "Stall ID must be a number",
    "number.integer": "Stall ID must be an integer",
    "number.positive": "Stall ID must be a positive number",
    "any.required": "Stall ID is required",
  }),

  agr_status: Joi.string()
    .valid("Active", "Expired", "Rejected")
    .required()
    .messages({
      "string.base": "Agreement status must be a string",
      "any.only": "Agreement status must be Active, Expired or Rejected",
      "any.required": "Agreement status is required",
    }),

  start_date: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),

  end_date: Joi.date()
    .greater(Joi.ref("start_date"))
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "date.greater": "End date must be after start date",
      "any.required": "End date is required",
    }),

});


// Middleware to validate rental agreement data (POST/PUT)
function validateRentalAgreement(req, res, next) {

  const { error } =
    rentalAgreementSchema.validate(req.body, {
      abortEarly: false
    });

  if (error) {

    const errorMessage =
      error.details.map(detail => detail.message);

    return res.status(400).json({
      error: errorMessage
    });

  }

  next();

}


// Middleware to validate rental agreement ID from URL parameters
function validateRentalAgreementId(req, res, next) {

  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {

    return res.status(400).json({
      error:
      "Invalid rental agreement ID. ID must be a positive number"
    });

  }

  next();

}


function validateRenewRentalAgreement(req, res, next) {

    const {
        startDate,
        endDate,
        tradeType,
        termCondition
    } = req.body;


    const errors = [];


    if (!startDate) {

        errors.push(
            "Start date is required."
        );

    }


    if (!endDate) {

        errors.push(
            "End date is required."
        );

    }


    if (
        startDate &&
        endDate &&
        new Date(endDate) <= new Date(startDate)
    ) {

        errors.push(
            "End date must be after start date."
        );

    }


    if (!tradeType) {

        errors.push(
            "Trade type is required."
        );

    }


    if (!termCondition) {

        errors.push(
            "Terms and conditions are required."
        );

    }


    if (errors.length > 0) {

        return res.status(400).json({

            error: errors

        });

    }


    next();

}


module.exports = {
  validateRentalAgreement,
  validateRentalAgreementId,
  validateRenewRentalAgreement
};