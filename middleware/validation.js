// middleware/validation.js
const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

const todoValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500).allow(''),
    completed: Joi.boolean(),
    dueDate: Joi.date().iso().greater('now'),
    priority: Joi.string().valid('low', 'medium', 'high')
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  todoValidation
};