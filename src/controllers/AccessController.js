'use strict'

const AccessService = require('../services/AccessService')

class AccessController {
  // [POST] /access/signup
  async signUp(req, res, next) {
    try {
      console.log(`[P]::SignUP::`, req.body)

      return res.status(201).json(await AccessService.signUp(req.body))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AccessController()
