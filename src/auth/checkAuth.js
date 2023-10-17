'use strict'

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
}

const { findById } = require('../services/APIKeyService')

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString()
    if (!key) {
      return res.status(403).json({ message: 'Action Forbidden' })
    }

    const objKey = await findById(key)
    if (!objKey) {
      return res.status(403).json({ message: 'Forbidden API key' })
    }
    req.objKey = objKey
    return next()
  } catch (error) {}
}

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({ message: 'Permission Denied' })
    }
    console.log(`permission::`, req.objKey.permissions)

    const isValidPermission = req.objKey.permissions.includes(permission)
    if (!isValidPermission) {
      return res.status(403).json({ message: 'Permission Denied' })
    }

    return next()
  }
}

module.exports = { apiKey, permission }
