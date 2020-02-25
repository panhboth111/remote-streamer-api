const app = require('express')()
const server = app.listen(3002)
const io = require('socket.io')(server)

module.exports = io




