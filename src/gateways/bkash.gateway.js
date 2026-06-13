exports.createPayment = async ({ payment }) => {
  // Production integration needs bKash token grant + create payment + execute payment flow.
  // Keep this adapter boundary unchanged and add official bKash API calls here.
  return {
    paymentUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/bkash/checkout/${payment.paymentId}`,
    raw: { message: 'bKash adapter placeholder. Add official bKash tokenized checkout calls.' }
  };
};

exports.verifyWebhook = async (payload) => ({
  valid: true,
  paymentId: payload.paymentId || payload.merchantInvoiceNumber,
  status: payload.status === 'Completed' ? 'paid' : 'failed',
  gatewayTransactionId: payload.trxID || '',
  raw: payload
});
