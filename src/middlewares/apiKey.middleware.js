function apiKeyAuth(req, res, next) {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey) {
    return res.status(500).json({ success: false, message: 'API key is not configured' });
  }

  const providedKey = req.header('x-api-key');
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }

  next();
}

module.exports = apiKeyAuth;
