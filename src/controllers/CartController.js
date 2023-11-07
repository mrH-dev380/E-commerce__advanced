'use strict'

const CartService = require('../services/CartService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class CartController {
  // [POST] /cart
  async addToCart(req, res, next) {
    new SuccessResponse({
      message: 'Create new Cart successfully',
      metadata: await CartService.addToCart({
        userId: req.user.userId,
        product: req.body,
      }),
    }).send(res)
  }

  // [POST] /cart/update
  async updateCart(req, res, next) {
    new SuccessResponse({
      message: 'Update new Cart successfully',
      metadata: await CartService.addToCartV2({
        userId: req.user.userId,
        shop_order_ids: req.body.shop_order_ids,
      }),
    }).send(res)
  }

  // [DELETE] /cart/updateAt
  async deleteProductCart(req, res, next) {
    new SuccessResponse({
      message: 'Delete Cart successfully',
      metadata: await CartService.deleteProductCart({
        userId: req.user.userId,
        product: req.body,
      }),
    }).send(res)
  }

  // [GET] /cart
  async listCart(req, res, next) {
    new SuccessResponse({
      message: 'Get List Cart successfully',
      metadata: await CartService.getListUserCart({
        userId: req.user.userId,
      }),
    }).send(res)
  }
}

module.exports = new CartController()
