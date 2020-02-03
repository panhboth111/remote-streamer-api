const mongoose = require('mongoose')

const schema = mongoose.Schema({
    deviceName:String,
    deviceId:String,
    socketId:String,
    streaming:String,
    cameraPlugged:Boolean,
    online:Boolean
})

module.exports = mongoose.model('Device',schema)