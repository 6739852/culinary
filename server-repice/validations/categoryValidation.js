const Joi = require("joi");

exports.categorySchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(""),
});
