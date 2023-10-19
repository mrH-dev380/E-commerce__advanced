'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const shopModel = require('../models/shop.model')
const KeyTokenService = require('./KeyTokenService')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils/index')
const { findByEmail } = require('./ShopService')
const { BadRequestError, AuthFailureError } = require('../core/error.response')

const RoleShop = {
  SHOP: 'shop',
  EDITOR: 'editor',
  WRITER: 'writer',
  ADMIN: 'admin',
}

class AccessService {
  // [POST] /access/login
  /**
   * 1 - check email in db
   * 2 - match password
   * 3 - create AT and RT -> save
   * 4 - generate tokens
   * 5 0 get data return login
   */
  static async logIn({ email, password, refreshToken = null }) {
    // 1 - check email in db
    const foundShop = await findByEmail({ email })
    if (!foundShop)
      throw new BadRequestError({ message: 'Shop not registered' })

    // 2 - match password
    const passwordMatched = await bcrypt.compare(password, foundShop.password)
    if (!passwordMatched)
      throw new AuthFailureError({ message: 'Authentication Error' })

    // 3 - create AT and RT -> save
    const publicKey = crypto.randomBytes(64).toString('hex')
    console.log('publicKey', publicKey)
    const privateKey = crypto.randomBytes(64).toString('hex')

    // 4 - generate tokens
    const { _id: userId } = foundShop
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    )

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
      userId,
    })

    // console.log('login route', req.keyStore)

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    }
  }

  // [POST] /access/signup
  static async signUp({ name, email, password }) {
    // step1: check email exits
    const holderShop = await shopModel.findOne({ email }).lean() // lean() returns object js 30 times smaller
    if (holderShop) {
      throw new BadRequestError({ message: 'Error: Shop already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    })

    if (newShop) {
      const publicKey = crypto.randomBytes(64).toString('hex')
      const privateKey = crypto.randomBytes(64).toString('hex')

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      })

      if (!keyStore) {
        return {
          code: 'xxx',
          massage: 'Key Store error',
        }
      }
      console.log(`Key Store::`, keyStore)

      // create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      )
      console.log(`Create Token Success::`, tokens)

      return {
        code: '201',
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      }
    }
    return {
      code: '200',
      metadata: null,
    }
  }

  // [POST] /access/logout
  static async logOut(keyStore) {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log(delKey)
    return delKey
  }
}

module.exports = AccessService
