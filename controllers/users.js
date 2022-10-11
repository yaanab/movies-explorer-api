const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const ConflictError = require('../errors/conflict-error');
const BadRequestError = require('../errors/bad-request-error');

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.send({
      email: user.email,
      name: user.name,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Данный email уже зарегестрирован'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    // { name: req.body.name },
    req.body,
    { new: true, runValidators: true },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Данный email уже зарегестрирован'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
      res.send({ token });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
};
