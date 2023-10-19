'use strict'

const AccessService = require('../services/AccessService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
  // [POST] /access/signup
  async signUp(req, res, next) {
    // return res.status(201).json(await AccessService.signUp(req.body))
    new CREATED({
      message: 'Register OK',
      metadata: await AccessService.signUp(req.body),
    }).send(res)
  }

  // [POST] /access/login
  async logIn(req, res, next) {
    new SuccessResponse({
      message: 'Login Successful',
      metadata: await AccessService.logIn(req.body),
    }).send(res)
  }

  // [POST] /access/logout
  async logOut(req, res, next) {
    new SuccessResponse({
      message: 'Logout Successful',
      metadata: await AccessService.logOut(req.keyStore),
    }).send(res)
  }
}

module.exports = new AccessController()
