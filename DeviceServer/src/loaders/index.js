const mongooseLoader = require("./mongoose");
const socketIOLoader = require("./socket");
module.exports = async (app) => {
  await mongooseLoader();
  console.log("Database initialized");
  await socketIOLoader(app);
  console.log("socket.io initialized");
};
