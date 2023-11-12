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

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inventory_productId: new Types.ObjectId(productId),
      inventory_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inventory_stock: -quantity,
      },
      $push: {
        inventory_reservation: {
          quantity,
          cartId,
          createdAt: new date(),
        },
      },
    },
    option = { upsert: true, new: true }

  return await inventory.updateOne(query, updateSet, option)
}

module.exports = { insertInventory, reservationInventory }
