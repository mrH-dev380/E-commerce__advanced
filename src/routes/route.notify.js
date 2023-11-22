'use strict'

const express = require('express')
const router = express.Router()
const NotificationController = require('../controllers/NotificationController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

// authentication
router.use(authenticationV2)

router.get('', asyncHandler(NotificationController.listNotifiByUser))

module.exports = router
