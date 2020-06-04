// const validator = require('validator');
const article = require('../models/article');
const { BadRequestError } = require('../constructorError/error');
const { IdNotFoundError } = require('../constructorError/error');


module.exports.getArticles = (req, res, next) => {
  article
    .find({})
    .then((articles) => res.send({ data: articles }))
    // .catch(next);
    .catch(() => {
      const err = new BadRequestError('Статьи не существуют');
      return next(err);
    });
};

module.exports.createArticles = (req, res, next) => {
  const owner = req.user._id;

  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  article
    .create({
      keyword, title, text, date, source, link, image, owner,
    })
    .then((articles) => res.send({ data: articles }))
    // .catch(next);
    .catch(() => {
      const err = new BadRequestError('Не возможно создать статью');
      return next(err);
    });
};

module.exports.deleteArticle = (req, res, next) => {
  article
    .findByIdAndRemove(req.params.articleId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      }
    })
    .catch(() => {
      const err = new IdNotFoundError('Не возможно удалить статью');
      return next(err);
    });
  // .catch(next);
};
