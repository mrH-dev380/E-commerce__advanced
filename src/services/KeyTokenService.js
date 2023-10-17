'use strict'

const keytokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static async createKeyToken({ userId, publicKey, privateKey }) {
    try {
      // publicKey được sinh ra bởi thuật toán bất đối xứng chưa được hash nên chuyển qua string để lưu vào db
      const publicKeyString = publicKey.toString()
      const token = await keytokenModel.create({
        user: userId,
        publicKey: publicKeyString,
        // publicKey,
        // privateKey,
      })

      return token ? token.publicKey : null
    } catch (error) {
      return error
    }
  }
}

module.exports = KeyTokenService
