'use strict'

const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

// Declare the Schema of the Mongo model
var cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'pending', 'failed'],
      default: 'active',
    },
    cart_products: { type: Array, default: [] }, // [{ shopId, item_products: [{productId, quantity}]}]
    cart_count_products: { type: Number, default: 0 },
    cart_userId: { type: String, required: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema)
