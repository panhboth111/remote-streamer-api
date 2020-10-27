const loaders = require("./loaders");
const express = require("express");

const startServer = () => {
  const app = express();
  loaders(app);
};
startServer();
