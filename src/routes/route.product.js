'use strict'

const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

// search products
router.get(
  '/search/:keySearch',
  asyncHandler(ProductController.getListSearchProduct)
)
router.get('/:product_id', asyncHandler(ProductController.findProductById))
router.get('', asyncHandler(ProductController.findAllProducts))

// authentication
router.use(authenticationV2)

router.post('', asyncHandler(ProductController.createNewProduct))
router.post(
  '/publish/:id',
  asyncHandler(ProductController.publishProductByShop)
)
router.post(
  '/unpublish/:id',
  asyncHandler(ProductController.unPublishProductByShop)
)

// QUERY
router.get('/draft/all', asyncHandler(ProductController.getAllDraftsForShop))
router.get('/publish/all', asyncHandler(ProductController.getAllPublishForShop))

module.exports = router
