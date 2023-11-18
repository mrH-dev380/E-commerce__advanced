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

// test pub/sub redis

// require('./test/inventory.test.js')
// const productTest = require('./test/product.test.js')
// productTest.purchaseProduct('product:001', 10)

// init redis db
require('./dbs/init.redis.js')

// init db
require('./dbs/init.mongodb.js')
// const { checkOverload } = require('./helpers/check.connect.js')
// checkOverload()

// init router
const route = require('./routes')
const { BadRequestError } = require('./core/error.response.js')
route(app)

module.exports = app
