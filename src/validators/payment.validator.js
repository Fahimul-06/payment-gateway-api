const Joi = require('joi');

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().uppercase().default('BDT'),
  customerName: Joi.string().min(2).max(100).required(),
  customerEmail: Joi.string().email().allow('').optional(),
  customerPhone: Joi.string().min(8).max(20).required(),
  orderId: Joi.string().min(2).max(100).required(),
  gateway: Joi.string().valid('sslcommerz', 'bkash', 'nagad', 'stripe', 'mock').required(),
  successUrl: Joi.string().uri().required(),
  failUrl: Joi.string().uri().required(),
  cancelUrl: Joi.string().uri().required(),
  idempotencyKey: Joi.string().max(150).optional(),
  metadata: Joi.object().optional()
});

function validateCreatePayment(req, res, next) {
  const { error, value } = createPaymentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(item => item.message)
    });
  }
  req.body = value;
  next();
}

module.exports = { validateCreatePayment };
