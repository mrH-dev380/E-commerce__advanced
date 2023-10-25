'use strict'

const ProductService = require('../services/ProductService')
const ProductServiceV2 = require('../services/ProductService.xx')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class ProductController {
  // QUERY
  // [GET] /product/draft/all
  async getAllDraftsForShop(req, res, next) {
    new SuccessResponse({
      message: 'Get list draft successful',
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  // [GET] /product/publish/all
  async getAllPublishForShop(req, res, next) {
    new SuccessResponse({
      message: 'Get list publish successful',
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  // [GET] /product/publish/all
  async getListSearchProduct(req, res, next) {
    console.log('1::', req.params)
    new SuccessResponse({
      message: 'Get list product search successful',
      metadata: await ProductServiceV2.getListSearchProduct(req.params),
    }).send(res)
  }

  // [GET] /product/
  async findAllProducts(req, res, next) {
    new SuccessResponse({
      message: 'Get list findAllProducts successful',
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res)
  }

  // [GET] /product/
  async findProductById(req, res, next) {
    new SuccessResponse({
      message: 'Get product by id  successful',
      metadata: await ProductServiceV2.findProductById({
        product_id: req.params.product_id,
      }),
    }).send(res)
  }

  // [POST] /product/signup
  async createNewProduct(req, res, next) {
    new SuccessResponse({
      message: 'Create new product successful',
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  // [POST] /product/publish/:id
  async publishProductByShop(req, res, next) {
    new SuccessResponse({
      message: 'Publish product successful',
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  // [POST] /product/unPublish/:id
  async unPublishProductByShop(req, res, next) {
    new SuccessResponse({
      message: 'Publish product successful',
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }
}

module.exports = new ProductController()
