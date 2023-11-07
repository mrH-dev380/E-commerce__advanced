'use strict'

const CheckoutService = require('../services/CheckoutService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class CheckoutController {
  // [POST] /checkout/review
  async checkoutReview(req, res, next) {
    new SuccessResponse({
      message: 'Get Checkout Cart successfully',
      metadata: await CheckoutService.checkoutReview({
        userId: req.user.userId,
        cartId: req.body.cartId,
        shop_order_ids: req.body.shop_order_ids,
      }),
    }).send(res)
  }
}

module.exports = new CheckoutController()
