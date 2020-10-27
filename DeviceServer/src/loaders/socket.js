const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");
const express = require("express");
const { PORT } = require("../utilities/configs");
const Device = require("../models/Device");
const Service = require("../utilities/service");
module.exports = async (app) => {
  const service = new Service();
  const server = http.Server(app).listen(PORT);
  const io = socketIO(server);
  app.use(cors());
  app.use(express.json());
  io.on("connection", async (connection) => {
    connection.on("device_info", async (device_info) => {
      await service.deviceInfo(Device, device_info, connection, io);
    });
    connection.on("disconnect", async () => {
      await service.disconnect(connection, io, Device);
    });
    connection.on("startStreaming", async (streamInfo) => {
      await service.startStreaming(io, streamInfo, Device);
      app.post("/redirect", async (req, res) => {
        try {
          const { streamBy, streamCode } = req.body;
          io.emit("redirect", { streamBy, streamCode });
          await service.startCasting(
            io,
            Device,
            streamInfo.deviceIds,
            streamCode,
            streamBy
          );
          return res.json("done");
        } catch (error) {
          console.log(error.message);
          return res.json("error");
        }
      });
    });
    connection.on("stopStreaming", async (usedBy) => {
      await service.stopStreaming(io, Device, usedBy);
    });
    connection.emit("info", await Device.find());
  });
};
