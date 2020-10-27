const { Schema, model } = require("mongoose");

const Device = Schema({
  deviceName: {
    type: String,
  },
  socketId: {
    type: String,
  },
  deviceId: {
    type: String,
  },
  streaming: {
    type: Boolean,
  },
  cameraPlugged: {
    type: Boolean,
  },
  usedBy: {
    type: String,
    default: "",
  },
  online: {
    type: Boolean,
    default: true,
  },
});
module.exports = model("Device", Device);
