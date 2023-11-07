'use strict'

const express = require('express')
const router = express.Router()
const CheckoutController = require('../controllers/CheckoutController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

// authentication
router.use(authenticationV2)

router.post('/review', asyncHandler(CheckoutController.checkoutReview))

module.exports = router
