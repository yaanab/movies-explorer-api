const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const AuthorizationError = require('../errors/authorisation-error');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new AuthorizationError('Необходима авторизация');
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    throw new AuthorizationError('Необходима авторизация');
  }

  req.user = payload;

  return next();
};
