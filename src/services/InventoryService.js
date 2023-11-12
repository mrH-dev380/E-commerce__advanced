'use strict'

const { Types } = require('mongoose')
const inventoryModel = require('../models/inventory.model')
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../core/error.response')
const { getProductById } = require('../models/repositories/productRepo')

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = '115 le van sy, HCM',
  }) {
    const product = await getProductById(productId)
    if (!product)
      throw new BadRequestError({ message: 'The product does not exists' })

    const query = { inventory_shopId: shopId, inventory_productId: productId },
      updateSet = {
        $inc: { inventory_stock: stock },
        $set: { inventory_location: location },
      },
      option = { upsert: true, new: true }

    return await inventoryModel.findOneAndUpdate(query, updateSet, option)
  }
}

module.exports = InventoryService
