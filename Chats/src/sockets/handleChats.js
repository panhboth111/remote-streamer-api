module.exports = (io,socket,Room) => {
    socket.on("input",async (info) => {
        console.log(info)
        let {username,email,message,roomId} = info
        const room = await Room.findOne({roomId})
        if(!message) socket.emit('empty_message','message is empty')
        else{
            let content = {username,message}
            if(content.message.toLowerCase().slice(0,10).includes("question:")) {
                content['message'] = content.message.split('question:')[1]
                await Room.updateOne({roomId},{$push:{questions:content}})
                io.emit(roomId, {questions:{username : username,message : content.message}})
            }
            else if(content.message.toLowerCase().slice(0,14).includes("announcement:") && room.roomOwner == email) {
                message = message.split('announcement:')[1]
                await Room.updateOne({roomId},{announcement:message})
                io.emit(roomId, {announcement:message})
            }
            else {
                await Room.updateOne({roomId},{$push:{chats:content}})
                // const Room_ = await Room.findOne({roomId})
                io.emit(roomId, {chats:{username : username,message : message}})
            }
        }
    })
}