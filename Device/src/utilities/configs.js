require("dotenv").config();
module.exports = {
  DEVICE_SERVER: process.env.DEVICE_SERVER,
  PORT: process.env.PORT,
  DB_CONNECTION: process.env.DB_CONNECTION,
  FRONTEND: process.env.FRONTEND,
};
