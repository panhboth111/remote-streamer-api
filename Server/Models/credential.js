const mongoose = require('mongoose');

const schema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        max : 255,
        min : 6
    },
    pwd : {
        type : String,
        required : true,
        min : 6
    },
    role : {
        type : String,
        default : "Student"
    },
    date : {
        type : Date,
        default : Date.now
    },
    displayProfile : {
        type : String,
        default : ""
    }
})


module.exports = mongoose.model('Credentials', schema)