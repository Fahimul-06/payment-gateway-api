const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  idempotencyKey: { type: String, index: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, uppercase: true, default: 'BDT' },
  gateway: { type: String, required: true, lowercase: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  gatewayTransactionId: { type: String, default: '' },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  successUrl: { type: String, required: true },
  failUrl: { type: String, required: true },
  cancelUrl: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

paymentSchema.index({ orderId: 1, gateway: 1 });
paymentSchema.index({ idempotencyKey: 1, orderId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
