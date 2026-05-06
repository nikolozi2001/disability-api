const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  logger.error(err.stack);
  res.status(status).json({ error: err.message });
};

module.exports = errorHandler;
