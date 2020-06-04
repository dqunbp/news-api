const express = require('express');

const { errors, isCelebrate } = require('celebrate');
const { errorLogger } = require('./middlewares/logger');

const app = express();

app.use(errorLogger);
app.use(errors()); // обработчик ошибок celebrate

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'Произошла ошибка на сервере' : message,
  });
});

if (isCelebrate(errors)) {
  const errorString = errors.joi.details[0].context.key;
  errors.message = `Некорректные данные в поле ${errorString}`;
  errors.status = 400;
}

// if (errors.message.includes('email') && errors.message.includes('unique')) {
//   errors.message = 'Такой email уже существует ';
//   errors.status = 409;
// }

