const mongoose = require('mongoose');

const schema = mongoose.Schema({
    streamCode : {
        type : String,
        required : true
    },
    streamTitle : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    thumbnail : {
        type : String,
        default : ""
    },
    isPrivate : {
        type : String,
        default : false
    },
    password : {
        type : String,
        default : ""
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users'
    },
    date : {
        type : Date,
        default : Date.now
    },
    isActive : {
        type : Boolean,
        default : true
    },
    streamFrom: {
        type:String,
        default: "Author's cam"
    }
})


module.exports = mongoose.model('Streamings', schema)