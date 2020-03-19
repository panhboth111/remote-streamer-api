const expressLoader = require('./express')
const mongoLoader = require('./database')
require("dotenv").config();

module.exports = async app => {
    await mongoLoader()
    console.log("DB initialized")
    await expressLoader(app)
    console.log("express initialized")
}