const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  logger.error(err); // log the full error object
  res.status(500).json({ error: err.message });
};

module.exports = errorHandler;
