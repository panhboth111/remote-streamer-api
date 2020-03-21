const loaders = require('./loaders')
const express = require('express')
const PORT = 4000
const socket = require('socket.io')
const sockets = require('./sockets/index')
const startServer = async () => {
    const app = express()
    await loaders(app)
    const server = app.listen(PORT, '0.0.0.0' ,()=> console.log(`server listening on port ${PORT}`))
    const io = socket(server)
    sockets(io)
}
startServer()
