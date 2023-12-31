'use strict'

const express = require('express')
const router = express.Router()
const AccessController = require('../controllers/AccessController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authenticationV2 } = require('../auth/authUtils')

router.post('/signup', asyncHandler(AccessController.signUp))
router.post('/login', asyncHandler(AccessController.logIn))

// authentication
router.use(authenticationV2)

router.post('/logout', asyncHandler(AccessController.logOut))
router.post('/refreshToken', asyncHandler(AccessController.handleRefreshToken))

module.exports = router
