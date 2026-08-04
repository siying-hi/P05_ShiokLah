const Joi = require("joi");

const filterSchema = Joi.object({
  range: Joi.string().valid("month", "3months", "6months").optional(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional()
});


function validateFilter(req, res, next) {
  const { error } = filterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}

module.exports = {
  validateFilter
};