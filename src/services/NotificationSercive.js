'use strict'

const { Types } = require('mongoose')
const NotificationModel = require('../models/notification.model.js')
const {
  NEW_PRODUCT_ADDED,
  NEW_PROMOTION,
} = require('../utils/constant/notification.constant.js')

class NotificationService {
  // push notifi when create new product
  static async pushNotificationToSystem({
    type = NEW_PRODUCT_ADDED,
    receivedId = 1,
    senderId,
    options = {},
  }) {
    let notifi_content

    if (type === NEW_PRODUCT_ADDED) {
      notifi_content = `@@@ has just added product: @@@`
    } else if (type === NEW_PROMOTION) {
      notifi_content = `@@@ has just added promotion: @@@`
    }

    const newNotify = await NotificationModel.create({
      notifi_type: type,
      notifi_content,
      notifi_senderId: senderId,
      notifi_receivedId: receivedId,
      notifi_options: options,
    })

    return newNotify
  }

  // [GET] /notify
  static async listNotifiByUser({ userId = 1, type = 'All', isRead = 0 }) {
    const match = { notifi_receivedId: userId }
    if (type !== 'All') {
      match['notifi_type'] = type
    }

    return await NotificationModel.aggregate([
      { $match: match },
      {
        $project: {
          notifi_type: 1,
          notifi_senderId: 1,
          notifi_receivedId: 1,
          notifi_content: 1,
          notifi_options: 1,
          createdAt: 1,
        },
      },
    ])
  }
}

module.exports = NotificationService
