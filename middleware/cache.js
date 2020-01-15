const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 5 * 60 });

function getUrlFromRequest(req) {
  const url = req.protocol + '://' + req.headers.host + req.originalUrl;
  return url;
}

function set(req, res, next) {
  const url = getUrlFromRequest(req);
  cache.set(url, res.locals.data);
  return next();
}

function get(req, res, next) {
  const url = getUrlFromRequest(req);
  const content = cache.get(url);
  if (content) {
    return res.status(200).send(content);
  }
  next();
}

module.exports = { get, set };