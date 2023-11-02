'use strict'

const DiscountService = require('../services/DiscountService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class DiscountController {
  // [POST] /discount
  async createDiscountCode(req, res, body) {
    new SuccessResponse({
      message: 'Discount code generated successfully',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res)
  }

  // [PATCH] /discount/:codeId
  async updateDiscountCode(req, res, next) {
    new SuccessResponse({
      message: 'Update product successful',
      metadata: await DiscountService.updateDiscountCode(
        req.params.codeId,
        req.user.userId,
        ...req.body
      ),
    }).send(res)
  }

  // [GET] /discount
  async getAllDiscountCodes(req, res, body) {
    new SuccessResponse({
      message: 'Get all code successfully',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res)
  }

  // [GET] /discount/amount
  async getDiscountAmount(req, res, body) {
    new SuccessResponse({
      message: 'Get all code successfully',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        userId: req.user.userId,
      }),
    }).send(res)
  }

  // [GET] /discount/products
  async getAllDiscountCodesWithProduct(req, res, body) {
    new SuccessResponse({
      message: 'Get all product code successfully',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res)
  }
}

module.exports = new DiscountController()
