'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const shopModel = require('../models/shop.model')
const KeyTokenService = require('./KeyTokenService')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils/index')
const { findByEmail } = require('./ShopService')
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response')

const RoleShop = {
  SHOP: 'shop',
  EDITOR: 'editor',
  WRITER: 'writer',
  ADMIN: 'admin',
}

class AccessService {
  static async handlerRefreshTokenV2({ refreshToken, user, keyStore }) {
    const { userId, email } = user

    // check token used -> delete all token in keyStore
    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteByUserId(userId)
      throw new ForbiddenError({
        message: 'Something went wrong. Please login again.',
      })
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError({ message: 'Shop not registered.' })

    // check userId
    const foundShop = await findByEmail({ email })
    if (!foundShop)
      throw new AuthFailureError({ message: 'Shop not registered.' })

    // create new token
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    )

    // update token
    await KeyTokenService.updateKeyToken(refreshToken, tokens)

    return {
      user,
      tokens,
    }
  }

  static async handlerRefreshToken(refreshToken) {
    const foundTokenUsed = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    )
    // check and delete all token in keyStore
    if (foundTokenUsed) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundTokenUsed.privateKey
      )
      console.log(userId, email)
      await KeyTokenService.deleteByUserId(userId)
      throw new ForbiddenError({
        message: 'Something went wrong. Please login again.',
      })
    }

    // not found token
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken)
      throw new AuthFailureError({ message: 'Shop not registered.' })

    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    )

    // check userId
    const foundShop = await findByEmail({ email })
    if (!foundShop)
      throw new AuthFailureError({ message: 'Shop not registered.' })

    // create new token
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    )

    // update token
    await KeyTokenService.updateKeyToken(refreshToken, tokens)

    return {
      user: { userId, email },
      tokens,
    }
  }

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
      // console.log(`Key Store::`, keyStore)

      // create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      )
      // console.log(`Create Token Success::`, tokens)

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
