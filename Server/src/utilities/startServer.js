module.exports = async (app, PORT, loaders) => {
  await loaders(app);
  const server = app.listen(PORT, "0.0.0.0", () =>
    console.log(`Server running on PORT ${PORT}..`)
  );
  const io = require("socket.io")(server);
  io.on("connection", (c) => {
    c.on("streamStop", (streamCode) => {
      io.emit("stopStream", streamCode);
    });
  });
};
