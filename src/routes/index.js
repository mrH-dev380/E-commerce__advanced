'use strict'

const { apiKey, permission } = require('../auth/checkAuth')
const accessRoute = require('./route.access')

function route(app) {
  // check api
  app.use(apiKey)
  // check permission
  app.use(permission('0000'))

  app.use('/access', accessRoute)
}

module.exports = route
