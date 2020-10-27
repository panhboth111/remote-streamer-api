const loaders = require('./loaders')
const express = require('express')
const PORT = 4000
const socket = require('socket.io')
const sockets = require('./sockets/index')
const startServer = async () => {
    const app = express()
    await loaders(app)
<<<<<<< HEAD
    const server = app.listen(PORT,'0.0.0.0',()=> console.log(`server listening on port ${PORT}`))
=======
    const server = app.listen(PORT, '0.0.0.0' ,()=> console.log(`server listening on port ${PORT}`))
>>>>>>> 4b677b0f004e02d2867a7d18e0d25b87cde0a2e1
    const io = socket(server)
    sockets(io)
}
startServer()
