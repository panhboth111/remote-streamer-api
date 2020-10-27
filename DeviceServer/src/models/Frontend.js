const { Schema, model } = require("mongoose");

const Frontend = Schema({
  socketId: {
    type: String,
    default: "",
  },
});
module.exports = model("Frontend", Frontend);
