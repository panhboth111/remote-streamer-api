module.exports = async(app,PORT,loaders) => {
    await loaders(app)
    const server = app.listen(PORT,() =>  console.log(`Server running on PORT ${PORT}..`))
    const io = require("socket.io")(server);
    io.on("connection", c => {
        c.on("streamStop", streamCode => {
            console.log("hmmmmm");
            io.emit("stopStream", streamCode);
        });
    });
}