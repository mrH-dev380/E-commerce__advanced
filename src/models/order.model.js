'use strict'

const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

// Declare the Schema of the Mongo model
var orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    /*
      order_checkout = {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
    */
    order_shipping: { type: Object, default: {} },
    /*
      country,
      city,
      ward,
      street
   */
    order_payment: { type: Object, default: {} },
    order_products: { type: Object, required: true },
    order_trackingNumber: { type: String, default: '#0000111092023' },
    order_status: {
      type: String,
      enum: ['pending, confirmed', 'shipped', 'canceled', 'delivered'],
      default: 'pending',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema)
