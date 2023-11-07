'use strict'

const express = require('express')
const router = express.Router()
const CartController = require('../controllers/CartController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

// authentication
router.use(authenticationV2)

router.post('/update', asyncHandler(CartController.updateCart))
router.post('', asyncHandler(CartController.addToCart))

router.get('', asyncHandler(CartController.listCart))

router.delete('/', asyncHandler(CartController.deleteProductCart))

module.exports = router
