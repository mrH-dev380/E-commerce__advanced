require('dotenv').config()
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet()) // secure Express apps by setting HTTP response headers.
app.use(compression()) // nén thành gzip gửi sang client
// express v4 already support urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// init db
require('./dbs/init.mongodb.js')
// const { checkOverload } = require('./helpers/check.connect.js')
// checkOverload()

// init router
const route = require('./routes')
route(app)

module.exports = app
