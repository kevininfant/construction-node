
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { Unauthorized } = require('http-errors');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return next(new Unauthorized('Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new Unauthorized('Invalid token.'));
  }
};

module.exports = verifyToken;
