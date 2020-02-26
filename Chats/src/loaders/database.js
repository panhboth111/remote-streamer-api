const mongoose = require('mongoose')
const {DBCONNECTION} = require("../../config")

module.exports = async () => {
    const connection = await mongoose.connect(DBCONNECTION,{useNewUrlParser:true,useUnifiedTopology:true},()=> console.log("database connection established"))
    return connection.connection.db
}