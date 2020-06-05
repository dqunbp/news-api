const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/users');
const { BadAuthenticationError, AccessDenied, BadRequestError } = require('../constructorError/error');
const { JWT_SECRET } = require('../config');

const { NODE_ENV } = process.env;

module.exports.getUser = (req, res, next) => {
  user
    .findById(req.user._id)
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    user
      .create({
        name,
        email,
        password: hash,
      })
      .then((newUser) => user.findOne({ _id: newUser._id }))
      .then((newUser) => res.status(200).send(newUser))
      // .catch(next);
      .catch(() => {
        const err = new BadRequestError(
          'Не удалось создать пользователя.',
        );
        return next(err);
      });
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  user.findOne({ email })
    .select('+password')
    .then((newUser) => {
      if (!newUser) {
        throw new BadAuthenticationError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, newUser.password)
        .then((matched) => {
          if (!matched) {
            throw new AccessDenied('Неправильные почта или пароль');
          }
          const token = jwt.sign(
            { _id: newUser._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'JWT_SECRET',
            { expiresIn: '7d' },
          );
          return res.send({ token });
        });
    })
    .catch(next);
};
