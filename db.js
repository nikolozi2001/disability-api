const sql = require("mssql");
require("dotenv-safe").config();
const logger = require("./logger");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: process.env.NODE_ENV === "production",
    enableArithAbort: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    logger.info("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    logger.error(`Database Connection Failed: ${err.stack}`);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
