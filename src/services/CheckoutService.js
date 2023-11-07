'use strict'

const { Types } = require('mongoose')
const cartModel = require('../models/cart.model')
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../core/error.response')
const { findCartByUserId } = require('../models/repositories/cartRepo')
const { checkProductByServer } = require('../models/repositories/productRepo')
const { getDiscountAmount } = require('./DiscountService')

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
    for (var i = 0; i < shop_order_ids.length; i++) {
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
}

module.exports = CheckoutService
