const Payment = require('../models/payment.model');
const { generatePaymentId } = require('../utils/idGenerator');
const { getGateway } = require('../gateways/gateway.factory');

exports.createPayment = async (req, res, next) => {
  try {
    const payload = req.body;

    if (payload.idempotencyKey) {
      const existing = await Payment.findOne({
        orderId: payload.orderId,
        idempotencyKey: payload.idempotencyKey
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Existing idempotent payment returned',
          paymentId: existing.paymentId,
          gateway: existing.gateway,
          status: existing.status
        });
      }
    }

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      orderId: payload.orderId,
      idempotencyKey: payload.idempotencyKey,
      amount: payload.amount,
      currency: payload.currency,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      gateway: payload.gateway,
      successUrl: payload.successUrl,
      failUrl: payload.failUrl,
      cancelUrl: payload.cancelUrl,
      metadata: payload.metadata || {},
      status: 'pending'
    });

    const gatewayService = getGateway(payment.gateway);
    const gatewayResult = await gatewayService.createPayment({ payment });

    payment.gatewayResponse = gatewayResult.raw || {};
    await payment.save();

    res.status(201).json({
      success: true,
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      gateway: payment.gateway,
      status: payment.status,
      paymentUrl: gatewayResult.paymentUrl
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId }).lean();
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        status: payment.status,
        gatewayTransactionId: payment.gatewayTransactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const gatewayName = req.params.gateway;
    const gatewayService = getGateway(gatewayName);
    const result = await gatewayService.verifyWebhook(req.body);

    if (!result.paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID missing from webhook' });
    }

    const payment = await Payment.findOne({ paymentId: result.paymentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.json({ success: true, message: 'Payment already marked as paid' });
    }

    payment.status = result.status;
    payment.gatewayTransactionId = result.gatewayTransactionId || payment.gatewayTransactionId;
    payment.gatewayResponse = result.raw || req.body;
    await payment.save();

    res.json({ success: true, message: 'Webhook processed', status: payment.status });
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'paid') return res.status(400).json({ success: false, message: 'Only paid payments can be refunded' });

    // Real gateway refund API call should be added in each adapter.
    payment.status = 'refunded';
    payment.gatewayResponse = { ...payment.gatewayResponse, refundReason: reason || 'No reason provided' };
    await payment.save();

    res.json({ success: true, message: 'Payment marked as refunded', paymentId });
  } catch (error) {
    next(error);
  }
};

exports.listPayments = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const status = req.query.status;
    const query = status ? { status } : {};

    const [items, total] = await Promise.all([
      Payment.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Payment.countDocuments(query)
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (error) {
    next(error);
  }
};

exports.mockPay = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) return res.status(404).send('Payment not found');

    payment.status = 'paid';
    payment.gatewayTransactionId = `MOCK-${Date.now()}`;
    payment.gatewayResponse = { message: 'Mock payment completed' };
    await payment.save();

    res.redirect(payment.successUrl);
  } catch (error) {
    next(error);
  }
};
