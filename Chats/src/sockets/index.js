const Room = require('../models/room')
const handleChat = require('./handleChats')
module.exports = (io) => {
    io.on('connection', async socket => {
        handleChat(io,socket,Room)
    })
}