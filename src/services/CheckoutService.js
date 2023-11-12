'use strict'

const { Types } = require('mongoose')
const cartModel = require('../models/cart.model')
const orderModel = require('../models/order.model')
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../core/error.response')
const { findCartByUserId } = require('../models/repositories/cartRepo')
const { checkProductByServer } = require('../models/repositories/productRepo')
const { getDiscountAmount } = require('./DiscountService')
const { acquireLock, releaseLock } = require('./RedisService')

class CheckoutService {
  /*
    {
      cartId,
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discounts:[],
          item_products: [
            {
              price,
              quantity,
              productId,
            }
          ],
        },
        {
          shopId,
          shop_discounts:[],
          item_products: [
            {
              price,
              quantity,
              productId,
            }
          ],
        }
      ],
    }
  */
  static async checkoutReview({ userId, shop_order_ids }) {
    // check cart exists
    const foundCart = await findCartByUserId(userId)
    if (!foundCart) throw new BadRequestError({ message: 'Cart not found' })

    const checkout_order = {
        totalPrice: 0, // tong tien hang,
        feeShip: 0, // phi giao hang
        totalDiscount: 0, // tong tien giam gia
        totalCheckout: 0, // tong thanh toan
      },
      shop_order_ids_new = []

    // tinh tong bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i]
      // check is product available
      const checkProductServer = await checkProductByServer(item_products)

      if (!checkProductServer[0])
        throw new BadRequestError({ message: 'Wrong product' })

      // tong tien don hang
      const checkoutPrice = await checkProductServer.reduce((curr, product) => {
        return curr + product.price * product.quantity
      }, 0)

      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      }

      if (shop_discounts.length > 0) {
        // TH: 1 discount
        const { totalPrice, discount } = await getDiscountAmount({
          code: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        })

        console.log(i, '::', totalPrice, discount)
        // tong tien discount giam gia
        checkout_order.totalDiscount += discount

        // neu tien giam gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = totalPrice
        }
      }

      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    }
  }

  static async orderByUser({
    shop_order_ids,
    userId,
    cartId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({ userId, shop_order_ids })

    // check lai 1 lan nua xem vuot ton kho hay khong?
    // get new array Products
    const products = shop_order_ids.flatMap((order) => order.item_products)
    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      const {productId, quantity} = products[i]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(keyLock ? true : false)
      if(keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check neu co 1 san pham het hang trong kho
    if(acquireProduct.includes(false)) {
      throw new BadRequestError({message: 'Mot so san pham da duoc cap nhap, vui long thu lai'})
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_product: shop_order_ids_new,
    })

    // TH: neu insert thanh cong, thi remove product trong gio hang
    if(newOrder) {
      // remove product in cart
    }

    return newOrder
  }

  // get all orders
  static async getOrdersByUser(){

  }

  // get one order
  static async getOneOrderByUser(){

  }

  // cancel order
  static async cancelOrderByUser(){

  }

  // update order status [Shop | Admin]
  static async updateOrderStatusByShop(){

  }
}

module.exports = CheckoutService
