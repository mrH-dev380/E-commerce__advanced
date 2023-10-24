'use strict'

const AccessService = require('../services/AccessService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
  // [POST] /access/signup
  async handleRefreshToken(req, res, next) {
    // new SuccessResponse({
    //   message: 'Get Token Successful',
    //   metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    // }).send(res)

    // v2 fixed, no need accessToken
    new SuccessResponse({
      message: 'Get Token Successful',
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user:req.user,
        keyStore: req.keyStore
      }),
    }).send(res)
  }

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
