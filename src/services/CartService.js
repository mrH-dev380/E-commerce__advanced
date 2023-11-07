'use strict'

const { Types } = require('mongoose')
const cartModel = require('../models/cart.model')
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../core/error.response')
const { getProductById } = require('../models/repositories/productRepo')
const {
  findIndexProductAndShop,
  findCartByUserId,
} = require('../models/repositories/cartRepo')

class CartService {
  // [POST] /cart
  static async createUserCart({ userId, productInfo }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateOrInsert = { cart_products: [productInfo] },
      option = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, option)
  }

  // [POST] /cart/update-quantity
  static async updateUserCart({ userId, productInfo }) {
    const { shopId, item_products } = productInfo
    const { quantity, productId } = item_products
    const foundShop = await cartModel.findOne({
      cart_userId: userId,
      'cart_products.shopId': shopId,
    })
    // kiem tra co shop trong gio hang chua
    if (!foundShop) {
      const query = {
          cart_userId: userId,
          cart_state: 'active',
        },
        updateSet = {
          $push: { cart_products: { shopId, item_products: [item_products] } },
        },
        option = { upsert: true, new: true }
      return await cartModel.findOneAndUpdate(query, updateSet, option)
    }

    // kiem tra co san pham cua shop do chua
    const foundProductShop = await cartModel.findOne({
      cart_userId: userId,
      'cart_products.shopId': shopId,
      'cart_products.item_products.productId': productId,
    })
    if (!foundProductShop) {
      const query = {
          cart_userId: userId,
          'cart_products.shopId': shopId,
          cart_state: 'active',
        },
        updateSet = {
          $push: {
            'cart_products.$.item_products': item_products,
          },
        },
        option = { upsert: true, new: true }
      return await cartModel.findOneAndUpdate(query, updateSet, option)
    }

    // tim vi tri san pham trong gio hang
    const shopIndex = foundProductShop.cart_products.findIndex(
      (el) => el.shopId === shopId
    )
    const productIndex = foundProductShop.cart_products[
      +shopIndex
    ].item_products.findIndex((el) => el.productId === productId)
    const updateString = `cart_products.${shopIndex}.item_products.${productIndex}.quantity`

    const query = {
        cart_userId: userId,
        cart_state: 'active',
      },
      updateSet = {
        $inc: {
          [updateString]: quantity,
        },
      },
      option = { upsert: true, new: true }

    return await cartModel.findOneAndUpdate(query, updateSet, option)
  }

  // [POST] /cart/add-to-cart
  static async addToCart({ userId, product = {} }) {
    const { productId, quantity, shopId } = product
    // check product
    const foundProduct = await getProductById(productId)
    if (!foundProduct) throw new NotFoundError({ message: 'Not found product' })
    const productInfo = {
      shopId,
      item_products: {
        productId,
        name: foundProduct.product_name,
        quantity,
        price: foundProduct.product_price,
      },
    }
    // check cart exists
    const userCart = await cartModel
      .findOne({ cart_userId: new Types.ObjectId(userId) })
      .lean()
    if (!userCart) {
      // create cart
      return await CartService.createUserCart({ userId, productInfo })
    }

    // kiem tra san pham co trong gio hang chua
    if (userCart.cart_products.length === 0) {
      return await cartModel.findOneAndUpdate(
        { cart_userId: new Types.ObjectId(userId) },
        { cart_products: [productInfo] }
      )
    }

    return await CartService.updateUserCart({ userId, productInfo })
  }

  /**
   * update cart
   * shop_order_ids: [
   *  {
   *    shopId,
   *    item_product: [
   *      {
   *        quantity,
   *        old_quantity,
   *        productId
   *      }
   *    ],
   *    version
   *  }
   * ]
   */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_product[0]
    // check product
    const foundProduct = await getProductById(productId)
    if (!foundProduct) throw new NotFoundError({ message: 'Not found product' })
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError({
        message: 'The product does not belong to the shop',
      })

    if (quantity === 0) {
      return await CartService.deleteProductCart({ userId, productId })
    }

    return await CartService.updateUserCart({
      shopId,
      item_products: {
        productId,
        quantity: quantity - old_quantity,
      },
    })
  }

  static async deleteProductCart({ userId, product }) {
    const { shopId, productId } = product
    const { shopIndex, productIndex } = await findIndexProductAndShop(
      userId,
      shopId,
      productId
    )
    const foundShop = await findCartByUserId(userId)
    console.log('foundShop::', foundShop)
    if (foundShop.cart_products[shopIndex].item_products.length === 1) {
      const query = {
          cart_userId: userId,
          cart_state: 'active',
        },
        updateSet = {
          $pull: { cart_products: { shopId: shopId } },
        }
      return await cartModel.updateOne(query, updateSet)
    }

    const updateString = `cart_products.${shopIndex}.item_products`
    const query = {
        cart_userId: userId,
        'cart_products.shopId': shopId,
        cart_state: 'active',
      },
      updateSet = {
        $pull: { [updateString]: { productId } },
      }

    const deleteCart = await cartModel.updateOne(query, updateSet)

    return deleteCart
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: new Types.ObjectId(userId),
      })
      .lean()
  }
}

module.exports = CartService
