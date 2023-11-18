'use strict'

const { apiKey, permission } = require('../auth/checkAuth')

function route(app) {
  // check api
  app.use(apiKey)

  // check permission
  app.use(permission('0000'))

  // init route
  app.use('/product', require('./route.product'))
  app.use('/access', require('./route.access'))
  app.use('/cart', require('./route.cart'))
  app.use('/discount', require('./route.discount'))
  app.use('/inventory', require('./route.inventory'))
  app.use('/comment', require('./route.comment'))
  // app.use('/checkout', require('./route.checkout'))

  // handling error
  app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
  })

  app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
      status: 'error',
      code: statusCode,
      stack: error.stack,
      message: error.message || 'Internal Server Error',
    })
  })
}

module.exports = route
