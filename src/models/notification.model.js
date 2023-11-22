'use strict'

const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'

// ORDER-001: order successfully
// ORDER-002: order failed
// PROMOTION-001: new PROMOTION
// SHOP-001: new product by User following

var notificationSchema = new Schema(
  {
    notifi_type: {
      type: String,
      enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001'],
      required: true,
    },
    notifi_senderId: { type: Types.ObjectId, ref: 'Shop', required: true },
    notifi_receivedId: { type: Number, required: true },
    notifi_content: { type: String },
    notifi_options: { type: Object, default: {} },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, notificationSchema)
