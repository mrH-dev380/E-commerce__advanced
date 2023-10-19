'use strict'

const {
  Types: { ObjectId },
} = require('mongoose')
const keytokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static async createKeyToken({ userId, publicKey, privateKey, refreshToken }) {
    try {
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
        option = { upsert: true, new: true }
      const token = await keytokenModel.findOneAndUpdate(filter, update, option)
      return token ? token.publicKey : null
    } catch (error) {
      return error
    }
  }

  static async findByUserId(userId) {
    return await keytokenModel.findOne({ user: new ObjectId(userId) }).lean()
  }

  static async removeKeyById(id) {
    console.log('id', id)
    return await keytokenModel.deleteOne({
      _id: new ObjectId(id),
    })
  }
}

module.exports = KeyTokenService
