const sslcommerzGateway = require('./sslcommerz.gateway');
const bkashGateway = require('./bkash.gateway');
const nagadGateway = require('./nagad.gateway');
const stripeGateway = require('./stripe.gateway');
const mockGateway = require('./mock.gateway');

function getGateway(gatewayName) {
  const gateways = {
    sslcommerz: sslcommerzGateway,
    bkash: bkashGateway,
    nagad: nagadGateway,
    stripe: stripeGateway,
    mock: mockGateway
  };

  const gateway = gateways[String(gatewayName).toLowerCase()];
  if (!gateway) throw new Error(`Unsupported payment gateway: ${gatewayName}`);
  return gateway;
}

module.exports = { getGateway };
