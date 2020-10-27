module.exports = async (io, streamInfo, Device) => {
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
  });
};
