'use strict'

const NotificationService = require('../services/NotificationSercive')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class NotificationController {
  // [GET] /notify
  async listNotifiByUser(req, res, next) {
    new SuccessResponse({
      message: 'Get notifi successfully',
      metadata: await NotificationService.listNotifiByUser(req.body),
    }).send(res)
  }
}

module.exports = new NotificationController()
