'use strict'

const express = require('express')
const router = express.Router()
const AccessController = require('../controllers/AccessController')
const { asyncHandler } = require('../helpers/asyncHandler')
const { authentication } = require('../auth/authUtils')

router.post('/signup', asyncHandler(AccessController.signUp))
router.post('/login', asyncHandler(AccessController.logIn))

// authentication
router.use(authentication)

router.post('/logout', asyncHandler(AccessController.logOut))

module.exports = router
