'use strict'

const { promisify } = require('node:util')
// promisify chuyen doi 1 ham thanh async/await
const redis = require('redis')
const { reservationInventory } = require('../models/repositories/inventoryRepo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.PEXPIRE).bind(redisClient) // thoi gian ton tai cua 1 key
const setnxAsync = promisify(redisClient.SETNX).bind(redisClient) // kiem tra ton tai cua key

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}` // tao key de khoa truy cap, tra lai key khi gd hoan tat
  const retryTimes = 10
  const expireTime = 3000 // thoi gian tam khoa key

  for (let i = 0; i < retryTimes; i++) {
    // kiem tra ai giu key thi duoc thanh toan
    const result = setnxAsync(key, '') // result co gia tri la 1 va 0
    if (result === 1) {
      // thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      })
      if (isReservation.modifiedCount) {
        // tra lai key
        await pexpire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient)
  return await delAsyncKey(keyLock)
}

module.exports = { acquireLock, releaseLock }
