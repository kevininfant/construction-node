
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { Unauthorized } = require('http-errors');
require("dotenv").config();
const verifyToken = (req, res, next) => {
  const tokens = req.header('Authorization');

  if (!tokens) {
    return next(new Unauthorized('Access denied. No token provided.'));
  }

  try {
const bearer = tokens.split(' ')
const token = bearer[1]
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new Unauthorized('Invalid token.'));
  }
};

module.exports = verifyToken;
