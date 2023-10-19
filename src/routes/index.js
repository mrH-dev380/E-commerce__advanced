'use strict'

const { apiKey, permission } = require('../auth/checkAuth')
const accessRoute = require('./route.access')

function route(app) {
  // check api
  app.use(apiKey)

  // check permission
  app.use(permission('0000'))

  // init route
  app.use('/access', accessRoute)

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
      message: error.message || 'Internal Server Error',
    })
  })
}

module.exports = route
