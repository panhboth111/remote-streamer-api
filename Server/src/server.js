const loaders = require('./loaders')
const app = require('express')()
const startServer = require('./utilities/startServer')
const PORT = process.env.PORT || 3000

startServer(app,PORT,loaders)

