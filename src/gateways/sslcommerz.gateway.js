const axios = require('axios');

exports.createPayment = async ({ payment }) => {
  const data = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: payment.amount,
    currency: payment.currency,
    tran_id: payment.paymentId,
    success_url: payment.successUrl,
    fail_url: payment.failUrl,
    cancel_url: payment.cancelUrl,
    ipn_url: `${process.env.BASE_URL}/api/payments/webhook/sslcommerz`,
    cus_name: payment.customerName,
    cus_email: payment.customerEmail || 'customer@example.com',
    cus_phone: payment.customerPhone,
    cus_add1: 'Bangladesh',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: payment.metadata?.productName || 'Order Payment',
    product_category: payment.metadata?.productCategory || 'General',
    product_profile: 'general'
  };

  const response = await axios.post(process.env.SSLCOMMERZ_INIT_URL, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!response.data?.GatewayPageURL) {
    throw new Error('SSLCommerz payment URL was not returned');
  }

  return { paymentUrl: response.data.GatewayPageURL, raw: response.data };
};

exports.verifyWebhook = async (payload) => {
  const validationUrl = process.env.SSLCOMMERZ_VALIDATE_URL;
  const valId = payload.val_id;

  if (!valId) {
    return {
      valid: false,
      paymentId: payload.tran_id,
      status: 'failed',
      gatewayTransactionId: payload.bank_tran_id || '',
      raw: payload
    };
  }

  const response = await axios.get(validationUrl, {
    params: {
      val_id: valId,
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      format: 'json'
    }
  });

  const verified = ['VALID', 'VALIDATED'].includes(response.data?.status);

  return {
    valid: verified,
    paymentId: payload.tran_id,
    status: verified ? 'paid' : 'failed',
    gatewayTransactionId: payload.bank_tran_id || response.data?.bank_tran_id || '',
    raw: { webhook: payload, validation: response.data }
  };
};
