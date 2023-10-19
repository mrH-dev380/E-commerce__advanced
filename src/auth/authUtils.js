'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { NotFoundError, AuthFailureError } = require('../core/error.response')
const { findByUserId } = require('../services/KeyTokenService')

const HEADER = {
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = JWT.sign(payload, publicKey, {
      expiresIn: '1 days',
    })

    // refreshToken
    const refreshToken = JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    })

    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.log(`error verify::`, err)
      } else {
        console.log(`decoded verify::`, decoded)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {}
}

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing
   * 2 - get accessToken
   * 3 - verifyToken
   * 4 - check user in db
   * 5 - check keyStore with this userId
   * 6 - OK all => return next()
   */

  // 1 - Check userId missing
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError({ message: 'Invalid Request userID' })

  // 2 - get accessToken
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError({ message: 'Not found keyStore' })

  // 3 - verifyToken
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError({ message: 'Invalid Request' })
  // console.log('keyStore', keyStore.publicKey)
  // const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
  // console.log(123)
  // console.log('decodeUser', decodeUser.userId, userId)
  try {
    // 4 - check user in db
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId)
      throw new AuthFailureError({ message: 'Invalid UserId' })
    // 5 - check keyStore with this userId
    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

module.exports = { createTokenPair, authentication }
