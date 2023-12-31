'use strict'

const {
  product,
  clothing,
  electronic,
  furniture,
} = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  searchProductByUser,
  publishProductByShop,
  unPublishProductByShop,
  findAllProducts,
  findProductById,
  updateProductById,
} = require('../models/repositories/productRepo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventoryRepo')
const { pushNotificationToSystem } = require('./NotificationSercive')
const { NEW_PRODUCT_ADDED } = require('../utils/constant/notification.constant')

// define Factory class to create product
class ProductFactory {
  /**
   * type: 'Clothing',
   * payload
   */

  static productRegistry = {}

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!type)
      throw new BadRequestError({ message: `Invalid Product Types ${type}` })

    return new productClass(payload).createProduct()
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!type)
      throw new BadRequestError({ message: `Invalid Product Types ${type}` })

    return new productClass(payload).updateProduct(productId)
  }

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  }

  // query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async getListSearchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      filter,
      page,
      select: [
        'product_name',
        'product_price',
        'product_thumb',
        'product_shop',
      ],
    })
  }

  static async findProductById({ product_id }) {
    return await findProductById({ product_id, unSelect: ['__v'] })
  }
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create new product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id })
    if (newProduct) {
      // Add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      })

      // push notify to system collection
      pushNotificationToSystem({
        type: NEW_PRODUCT_ADDED,
        receivedId: 1,
        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((result) => console.log(result.lean()))
        .catch((error) => console.log(error))
    }

    return newProduct
  }

  // update product
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product })
  }
}

// define sub-class for different types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newClothing)
      throw new BadRequestError({ message: 'Create new Clothing error' })

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct)
      throw new BadRequestError({ message: 'Create new Product error' })

    return newProduct
  }

  async updateProduct(productId) {
    // 1 - remove attributes has null or undefined
    const objectParams = removeUndefinedObject(this)

    // 2 - check update o cho nao?
    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(
          removeUndefinedObject(objectParams.product_attributes)
        ),
        model: product,
      })
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    )
    return updateProduct
  }
}

// define sub-class for different types Electronic
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newElectronic)
      throw new BadRequestError({ message: 'Create new Electronic error' })

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct)
      throw new BadRequestError({ message: 'Create new Product error' })

    return newProduct
  }

  async updateProduct(productId) {
    // 1 - remove attributes has null or undefined
    const objectParams = removeUndefinedObject(this)

    // 2 - check update o cho nao?
    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(
          removeUndefinedObject(objectParams.product_attributes)
        ),
        model: product,
      })
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    )
    return updateProduct
  }
}

// define sub-class for different types Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newFurniture)
      throw new BadRequestError({ message: 'Create new Furniture error' })

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct)
      throw new BadRequestError({ message: 'Create new Product error' })

    return newProduct
  }

  async updateProduct(productId) {
    // 1 - remove attributes has null or undefined
    const objectParams = removeUndefinedObject(this)

    // 2 - check update o cho nao?
    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(
          removeUndefinedObject(objectParams.product_attributes)
        ),
        model: product,
      })
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    )
    return updateProduct
  }
}

// register product types
ProductFactory.registerProductType('ELectronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory
