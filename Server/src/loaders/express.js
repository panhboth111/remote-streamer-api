const bodyParser = require('body-parser')
const cors = require('cors')
const Room = require('../models/room')
module.exports = async app => {
    app.use(bodyParser.json())
    app.use(cors())
    app.post('/createRoom',async (req,res)=> {
        try {
            const {roomName,roomOwner,roomId} = req.body
            await new Room({roomName,roomOwner,roomId}).save()
            console.log("room created")
            res.json({message:"hi"})
        } catch (error) {
            console.log(error)
        }
    })
    app.post('/getChat',async (req,res)=> {
        try {
            let roomId = req.body.roomId
            const Room_ = await Room.findOne({roomId})
            return res.json({chats:Room_.chats,questions:Room_.questions,announcement:Room_.announcement})
        } catch (error) {
            console.log(err)
        }
    })
    return app
}