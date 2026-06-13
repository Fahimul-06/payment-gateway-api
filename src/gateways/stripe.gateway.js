exports.createPayment = async ({ payment }) => {
  // Install stripe package and replace this placeholder with Stripe Checkout Session creation.
  return {
    paymentUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/stripe/checkout/${payment.paymentId}`,
    raw: { message: 'Stripe adapter placeholder. Add Stripe Checkout Session creation.' }
  };
};

exports.verifyWebhook = async (payload) => ({
  valid: true,
  paymentId: payload.client_reference_id || payload.paymentId,
  status: payload.payment_status === 'paid' ? 'paid' : 'failed',
  gatewayTransactionId: payload.id || '',
  raw: payload
});
