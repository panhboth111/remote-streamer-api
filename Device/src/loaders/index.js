const mongooseLoader = require("./mongoose");
const socketIOLoader = require("./socket");
module.exports = async () => {
  await mongooseLoader();
  console.log("Database initialized");
  await socketIOLoader();
  console.log("Socket.io initialized");
};
