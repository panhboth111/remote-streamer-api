const mongoose = require('mongoose');

const schema = mongoose.Schema({
    roomName:{
        type:String,
        required:true
    },
    roomId:{
        type:String,
        required:true
    },
    roomOwner:{
        type:String,
        required:true
    },
    chats:{
        type:Array,
        default:[]
    },
    questions:{
        type:Array,
        default:[]
    },
    announcement:{
        type:String,
        default:""
    }
})


module.exports = mongoose.model('Classes', schema)