# Universal Payment Gateway API

A reusable Node.js + Express API that gives your apps one common payment API while supporting different payment gateway adapters such as SSLCommerz, bKash, Nagad, Stripe and mock payments.

## Features

- Universal payment creation endpoint
- SSLCommerz adapter structure
- bKash, Nagad, Stripe adapter placeholders
- Mock gateway for local testing
- Webhook/IPN endpoint
- Payment status API
- Refund endpoint structure
- API key authentication
- Request validation with Joi
- Rate limiting, Helmet security and CORS
- MongoDB payment storage
- Idempotency key support

## Install

```bash
npm install
cp .env.example .env
npm run dev
```

## Required Setup

Update `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/universal_payment_api
API_KEY=your_secret_key
BASE_URL=http://localhost:5000
```

For production, use HTTPS and your real domain in `BASE_URL`.

## Create Payment

```http
POST /api/payments/create
x-api-key: your_secret_key
Content-Type: application/json
```

```json
{
  "amount": 500,
  "currency": "BDT",
  "customerName": "Fahim",
  "customerEmail": "fahim@example.com",
  "customerPhone": "01700000000",
  "orderId": "ORD-10001",
  "gateway": "mock",
  "successUrl": "https://yourapp.com/payment/success",
  "failUrl": "https://yourapp.com/payment/fail",
  "cancelUrl": "https://yourapp.com/payment/cancel",
  "idempotencyKey": "ORD-10001-PAYMENT-1",
  "metadata": {
    "productName": "Order Payment"
  }
}
```

Response:

```json
{
  "success": true,
  "paymentId": "PAY-20260613-ABCD1234",
  "orderId": "ORD-10001",
  "gateway": "mock",
  "status": "pending",
  "paymentUrl": "http://localhost:5000/api/payments/mock-pay/PAY-20260613-ABCD1234"
}
```

## Check Payment Status

```http
GET /api/payments/status/:paymentId
x-api-key: your_secret_key
```

## Webhook/IPN

Gateways call:

```http
POST /api/payments/webhook/:gateway
```

Examples:

```txt
/api/payments/webhook/sslcommerz
/api/payments/webhook/bkash
/api/payments/webhook/nagad
/api/payments/webhook/stripe
/api/payments/webhook/mock
```

## Refund Payment

```http
POST /api/payments/refund
x-api-key: your_secret_key
Content-Type: application/json
```

```json
{
  "paymentId": "PAY-20260613-ABCD1234",
  "reason": "Customer requested refund"
}
```

## Supported Gateway Names

```txt
mock
sslcommerz
bkash
nagad
stripe
```

## Important Production Notes

Before live payment use:

1. Add official bKash/Nagad/Stripe API calls inside their adapter files.
2. Verify webhook signatures for every gateway.
3. Use HTTPS only.
4. Keep gateway secrets in environment variables only.
5. Use separate sandbox and live environment files.
6. Never mark payment as paid without gateway-side validation.
7. Add gateway refund APIs before issuing real refunds.
8. Add admin roles before exposing `/admin/all` publicly.

## Project Structure

```txt
src/
├── config/
├── controllers/
├── gateways/
├── middlewares/
├── models/
├── routes/
├── utils/
└── validators/
```

## Local Test With Mock Gateway

1. Start MongoDB.
2. Run:

```bash
npm run dev
```

3. Create payment using gateway `mock`.
4. Open returned `paymentUrl` in browser.
5. The API will mark the payment as paid and redirect to your success URL.

