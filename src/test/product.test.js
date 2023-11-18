const RedisPubSubService = require('../services/RedisPubSubService')

class ProductServiceTest {
  async purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    }

    RedisPubSubService.publish('purchase_events', JSON.stringify(order))
  }
}

module.exports = new ProductServiceTest()
