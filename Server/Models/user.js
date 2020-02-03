const mongoose = require('mongoose');

const schema = mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        require : true
    },
    isStreaming : {
        type : Boolean,
        default : false
    },
    currentStream :{
        type:String,
        default:""
    }
})


module.exports = mongoose.model('Users', schema)