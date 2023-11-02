'use strict'

const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inventory_productId: { type: Types.ObjectId, ref: 'Product' },
    inventory_location: { type: String, default: 'unKnow' },
    inventory_stock: { type: Number, require: true },
    inventory_shopId: { type: Types.ObjectId, ref: 'Shop' },
    inventory_reservations: { type: Array, default: [] },
    /**
     * cartId:
     * stock:
     * createdOn:
     */
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema)
