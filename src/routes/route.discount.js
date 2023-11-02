'use strict'

const express = require('express')
const router = express.Router()
const DiscountController = require('../controllers/DiscountController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

router.get(
  '/list_code_product',
  asyncHandler(DiscountController.getAllDiscountCodesWithProduct)
)

// authentication
router.use(authenticationV2)

router.get('', asyncHandler(DiscountController.getAllDiscountCodes))

router.patch('/:codeId', asyncHandler(DiscountController.updateDiscountCode))

router.post('/amount', asyncHandler(DiscountController.getDiscountAmount))
router.post('', asyncHandler(DiscountController.createDiscountCode))

module.exports = router
