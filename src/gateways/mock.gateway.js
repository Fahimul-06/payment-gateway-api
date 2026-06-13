exports.createPayment = async ({ payment }) => {
  return {
    paymentUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/mock-pay/${payment.paymentId}`,
    raw: { message: 'Mock payment initialized' }
  };
};

exports.verifyWebhook = async (payload) => ({
  valid: true,
  paymentId: payload.paymentId,
  status: payload.status || 'paid',
  gatewayTransactionId: payload.gatewayTransactionId || `MOCK-${Date.now()}`,
  raw: payload
});
