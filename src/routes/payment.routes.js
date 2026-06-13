const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const apiKeyAuth = require('../middlewares/apiKey.middleware');
const { validateCreatePayment } = require('../validators/payment.validator');

router.post('/create', apiKeyAuth, validateCreatePayment, paymentController.createPayment);
router.get('/status/:paymentId', apiKeyAuth, paymentController.getPaymentStatus);
router.post('/refund', apiKeyAuth, paymentController.refundPayment);
router.get('/admin/all', apiKeyAuth, paymentController.listPayments);
router.post('/webhook/:gateway', paymentController.handleWebhook);
router.get('/mock-pay/:paymentId', paymentController.mockPay);

module.exports = router;
