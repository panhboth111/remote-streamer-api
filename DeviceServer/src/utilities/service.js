const axios = require("axios");
const { API_URL } = require("./configs");
class Service {
  // to get device information
  async deviceInfo(Device, device_info, connection, io) {
    try {
      const deviceExists = await Device.findOne({
        deviceId: device_info.deviceId,
      });
      if (deviceExists) {
        await Device.updateOne(
          { deviceId: device_info.deviceId },
          {
            socketId: connection.id,
            online: true,
            streaming: false,
            usedBy: "",
          }
        );
      } else {
        const newDevice = await new Device({
          ...device_info,
          socketId: connection.id,
        }).save();
        const updatedDevice = await Device.findOneAndUpdate(
          { _id: newDevice._id },
          { deviceId: newDevice._id }
        );
        const res = await axios.post(`${API_URL}/auth/signUp`, {
          name: "device" + updatedDevice.deviceId,
          email: updatedDevice.deviceId + "@device.com",
          pwd: "FLIBVC123",
        });
        connection.emit("update_info", { deviceId: updatedDevice._id });
      }
      io.emit("info", await Device.find());
    } catch (error) {
      console.log(error.message);
    }
  }
  // when device disconnects
  async disconnect(connection, io, Device) {
    await Device.updateOne({ socketId: connection.id }, { online: false });
    io.emit("info", await Device.find());
  }
  // handle start streaming
  async startStreaming(io, streamInfo, Device) {
    try {
      const {
        deviceIds,
        deviceId,
        userEmail,
        streamTitle,
        description,
      } = streamInfo;
      const streamDevice = await Device.findOne({ deviceId });
      await streamDevice.updateOne({ streaming: true, usedBy: userEmail });
      io.to(streamDevice.socketId).emit("start_streaming", {
        userEmail,
        streamTitle,
        description,
        deviceId,
      });
      io.to(streamDevice.socketId).emit("update_info", { streaming: true });
      io.emit("info", await Device.find());
    } catch (error) {
      console.log(error);
      io.emit("error", "failed to start stream");
    }
  }
  async startCasting(io, Device, deviceIds, streamCode, streamBy) {
    try {
      const devices = await Device.find({ deviceId: { $in: deviceIds } });
      devices.forEach((device) => {
        io.to(device.socketId).emit("start_casting", streamCode);
        io.to(device.socketId).emit("update_info", { streaming: true });
      });
      await Device.update(
        { deviceId: { $in: deviceIds } },
        { streaming: true, usedBy: streamBy }
      );
      io.emit("info", await Device.find());
    } catch (error) {}
  }
  async stopStreaming(io, Device, usedBy) {
    try {
      const devices = await Device.findAndUpdate(
        { usedBy },
        { usedBy: "", streaming: false }
      );
      devices.forEach((device) => {
        io.to(device.socketId).emit("stop_streaming", "");
        io.to(device.socketId).emit("update_info", { streaming: false });
      });
    } catch (error) {}
  }
}
module.exports = Service;
