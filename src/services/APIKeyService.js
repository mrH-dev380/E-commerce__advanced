'use strict'

const apiKeyModel = require('../models/apikey.modal')
const crypto = require('node:crypto')

const findById = async (key) => {
  // const newKey = await apiKeyModel.create({key: crypto.randomBytes(64).toString('hex'), permissions:['0000']})
  // console.log(key)
  // aee95ae865c8a573767bc02f629deff534856a7a645afc677573ee9d2d97f9443f3bf8fedd4eddb2e6cef4781b71b7b12962d4eebd8925bb3862626ede66bf08
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean()
  return objKey
}

module.exports = { findById }
