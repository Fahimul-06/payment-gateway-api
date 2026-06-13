const { v4: uuidv4 } = require('uuid');

function generatePaymentId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `PAY-${date}-${uuidv4().slice(0, 8).toUpperCase()}`;
}

module.exports = { generatePaymentId };
