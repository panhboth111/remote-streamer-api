const mongoose = require('mongoose')
const DB_CONNECTION = "mongodb+srv://admin:admin@cluster0-x6wlp.mongodb.net/LiveChats"

module.exports = async () => {
    const connection = await mongoose.connect(DB_CONNECTION,{useNewUrlParser:true,useUnifiedTopology:true},()=> console.log("database connection established"))
    return connection.connection.db
}