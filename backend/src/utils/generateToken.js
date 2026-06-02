const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secretKey = process.env.JWT_SECRET || 'routepilot_local_fallback_secret_key_3002';

  return jwt.sign({ id }, secretKey, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;