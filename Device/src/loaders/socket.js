const io = require("socket.io-client");
const usb = require("usb-detection");
const Device = require("../models/Device");
const { DEVICE_SERVER, PORT } = require("../utilities/configs");
const Service = require("../utilities/Service");
module.exports = () => {
  const service = new Service();
  usb.startMonitoring();
  const socket = io(DEVICE_SERVER + PORT);
  socket.on("connect", async () => {
    const device = await service.initSocket(usb, Device);
    socket.emit("device_info", device);
  });
  socket.on("update_info", async (device_info) => {
    await service.updateInfo(Device, device_info);
  });
  socket.on("start_streaming", async (streamInfo) => {
    await service.startStreaming(socket, streamInfo);
  });
};
