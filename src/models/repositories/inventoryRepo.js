'use strict'

const { Types } = require('mongoose')
const inventory = require('../inventory.model')

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = 'unknown',
}) => {
  return await inventory.create({
    inventory_productId: productId,
    inventory_location: location,
    inventory_stock: stock,
    inventory_shopId: shopId,
  })
}

module.exports = { insertInventory }
