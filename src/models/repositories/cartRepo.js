'use strict'

const { Types } = require('mongoose')

const { getSelectData, unGetSelect } = require('../../utils')
const CartModel = require('../../models/cart.model')

const findCartByUserId = async (userId) => {
  return await CartModel.findOne({ cart_userId: userId })
}

const findProductCartById = async (userId, shopId, productId) => {
  return await CartModel.findOne({
    cart_userId: userId,
    'cart_products.shopId': shopId,
    'cart_products.item_products.productId': productId,
  }).lean()
}

const findIndexProductAndShop = async (userId, shopId, productId) => {
  const foundProductShop = await findProductCartById(userId, shopId, productId)
  const shopIndex = foundProductShop.cart_products.findIndex(
    (el) => el.shopId === shopId
  )
  const productIndex = foundProductShop.cart_products[
    shopIndex
  ].item_products.findIndex((el) => el.productId === productId)

  return {
    shopIndex,
    productIndex,
  }
}

module.exports = { findCartByUserId, findIndexProductAndShop }
