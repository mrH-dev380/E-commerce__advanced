'use strict'

const InventoryService = require('../services/InventoryService')
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class InventoryController {
  // [POST] /inventory
  async addStockToInventory(req, res, next) {
    new SuccessResponse({
      message: 'Update inventory successfully',
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res)
  }
}

module.exports = new InventoryController()
