'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const shopModel = require('../models/shop.model')
const KeyTokenService = require('./KeyTokenService')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils/index')

const RoleShop = {
  SHOP: 'shop',
  EDITOR: 'editor',
  WRITER: 'writer',
  ADMIN: 'admin',
}

class AccessService {
  static async signUp({ name, email, password }) {
    try {
      // step1: check email exits
      const holderShop = await shopModel.findOne({ email }).lean() // lean() returns object js 30 times smaller
      if (holderShop) {
        return {
          code: 'xxx',
          massage: 'Shop already registered!',
        }
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      })

      if (newShop) {
        // Thuật toán bất đối xứng
        // create privateKey and publicKey
        const { publicKey, privateKey } = await crypto.generateKeyPairSync(
          'rsa',
          {
            modulusLength: 4096,
            publicKeyEncoding: {
              type: 'pkcs1',
              format: 'pem',
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
            },
          }
        )
        // const publicKey = crypto.randomBytes(64).toString('hex')
        // const privateKey = crypto.randomBytes(64).toString('hex')

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          // privateKey,
        })

        if (!publicKeyString) {
          return {
            code: 'xxx',
            massage: 'publicKeyString error',
          }
        }
        console.log(`PublicKeyString::`, publicKeyString)

        const publicKeyObject = crypto.createPublicKey(publicKeyString)
        console.log(`PublicKeyObject::`, publicKeyObject)

        // create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyObject,
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
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error',
      }
    }
  }
}

module.exports = AccessService
