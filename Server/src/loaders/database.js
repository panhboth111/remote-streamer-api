const mongoose = require('mongoose')
const DB_CONNECTION = "mongodb+srv://admin:admin@cluster0-x6wlp.mongodb.net/ServerTest" || process.env.DB_CONNECTION 

module.exports =  async () => {
    const connection = await mongoose.connect(DB_CONNECTION,{useNewUrlParser:true,useUnifiedTopology:true})
    return connection.connection.db
}