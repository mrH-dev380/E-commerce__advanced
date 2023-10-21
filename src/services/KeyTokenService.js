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

  static async findByRefreshTokenUsed(refreshToken) {
    return await keytokenModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean()
  }

  static async findByRefreshToken(refreshToken) {
    return await keytokenModel.findOne({
      refreshToken: refreshToken,
    })
  }

  static async updateKeyToken(refreshToken, tokens) {
    const filter = { refreshToken },
      option = {
        $set: { refreshToken: tokens.refreshToken },
        $push: { refreshTokenUsed: refreshToken },
      }
    return await keytokenModel.updateOne(filter, option)
  }

  static async deleteByUserId(userId) {
    return await keytokenModel.findOneAndDelete({ user: userId })
  }
}

module.exports = KeyTokenService
