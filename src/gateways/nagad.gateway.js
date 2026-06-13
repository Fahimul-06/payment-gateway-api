exports.createPayment = async ({ payment }) => {
  // Production integration needs Nagad initialize + confirm payment flow with signing/encryption.
  // Keep this adapter boundary unchanged and add official Nagad API calls here.
  return {
    paymentUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/nagad/checkout/${payment.paymentId}`,
    raw: { message: 'Nagad adapter placeholder. Add official Nagad payment initialization calls.' }
  };
};

exports.verifyWebhook = async (payload) => ({
  valid: true,
  paymentId: payload.paymentRefId || payload.paymentId,
  status: payload.status === 'Success' ? 'paid' : 'failed',
  gatewayTransactionId: payload.issuerPaymentRefNo || '',
  raw: payload
});
