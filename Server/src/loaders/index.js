const databaseLoader = require('./database')
const appLoader = require('./app')
module.exports = async (app) => {
    await databaseLoader()
    console.log("database initialized")
    await appLoader(app)
    console.log("app initialized")
}