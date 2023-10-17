'use strict'

const express = require('express')
const router = express.Router()
const AccessController = require('../controllers/AccessController')

router.post('/signup', AccessController.signUp)

module.exports = router
