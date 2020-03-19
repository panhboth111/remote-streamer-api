const mongoose = require('mongoose')

module.exports = async () => {
    const connection = await mongoose.connect(process.env.DBCONNECTION,{useNewUrlParser:true,useUnifiedTopology:true},()=> console.log("database connection established"))
    return connection.connection.db
}