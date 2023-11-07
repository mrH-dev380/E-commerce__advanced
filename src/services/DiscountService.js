'use strict'

const { Types } = require('mongoose')

const { BadRequestError, NotFoundError } = require('../core/error.response')
const discount = require('../models/discount.model')
const {
  findAllDiscountCodesSelect,
  checkDiscountExists,
  updateDiscount,
} = require('../models/repositories/discountRepo')
const { findAllProducts } = require('../models/repositories/productRepo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
    } = payload

    if (new Date() < Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError({ message: 'Discount code has been expired' })
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError({
        message: 'Start date must be before end date',
      })
    }

    if ((applies_to === 'specific') & (product_ids < 1))
      throw new BadRequestError({ message: 'Invalid product applied' })

    // check code exists
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: new Types.ObjectId(shopId),
      })
      .lean()

    if (foundDiscount) throw new BadRequestError({ message: 'Discount exists' })

    // create index for discount code
    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_code: code,
      discount_type: type,
      discount_value: value,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_user_count: uses_count,
      discount_users_used: users_used || [],
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_oder_value: min_order_value || 0,
      discount_shopId: shopId,

      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
    })

    return newDiscount
  }

  static async updateDiscountCode(codeId, shopId, bodyUpdate) {
    const foundDiscount = await discount
      .findOne({
        discount_code: codeId,
        discount_shopId: new Types.ObjectId(shopId),
      })
      .lean()
    if (!foundDiscount)
      throw new NotFoundError({ message: `Discount code not found` })

    const updateDiscountCode = await updateDiscount({
      codeId,
      shopId,
      bodyUpdate: updateNestedObjectParser(removeUndefinedObject(bodyUpdate)),
    })

    return updateDiscountCode
  }

  static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }) {
    // check code exists
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: new Types.ObjectId(shopId),
      })
      .lean()

    if (!foundDiscount || !foundDiscount.discount_is_active)
      throw new NotFoundError({ message: 'Discount not exists' })

    const { discount_applies_to, discount_product_ids } = foundDiscount
    let products
    if (discount_applies_to === 'all') {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: new Types.ObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      })
    }

    if (discount_applies_to === 'specific') {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      })
    }

    return products
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discount = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: new Types.ObjectId(shopId),
        discount_is_active: true,
      },
      select: [
        'discount_name',
        'discount_code',
        'discount_start_date',
        'discount_end_date',
        'discount_type',
        'discount_value',
      ],
    })
    return discount
  }

  // Apply Discount Code
  static async getDiscountAmount({ code, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: code,
        discount_shopId: new Types.ObjectId(shopId),
      },
    })

    console.log('code::', foundDiscount)

    if (!foundDiscount)
      throw new NotFoundError({ message: 'Discount not exists' })

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
      discount_max_value,
    } = foundDiscount[0]

    if (!discount_is_active)
      throw new NotFoundError({ message: 'Discount expired' })
    if (discount_max_uses < 1)
      throw new NotFoundError({ message: 'Discount are out' })
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new NotFoundError({ message: 'Discount expired' })

    // check order value
    let totalOrder = 0

    totalOrder = products.reduce((curr, product) => {
      return curr + product.quantity * product.price
    }, 0)

    if (totalOrder < discount_min_value)
      throw new NotFoundError({
        message: `Discount requires a minium order value of ${discount_min_value}`,
      })

    if (discount_max_uses_per_user > 0) {
      const userDiscountUsed = discount_users_used.find(
        (user) => user.userId === userId
      )
      if (userDiscountUsed) {
        throw new NotFoundError({ message: 'Discount already used' })
      }
    } else {
      throw new NotFoundError({ message: 'Discount expired' })
    }

    const amount =
      discount_type === 'fixed_amount'
        ? discount_value
        : totalOrder * (discount_value / 100)

    const finalAmount =
      amount > discount_max_value ? discount_max_value : amount

    return {
      totalOrder,
      discount: finalAmount,
      totalPrice: totalOrder - finalAmount,
    }
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    return await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: new Types.ObjectId(shopId),
    })
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: new Types.ObjectId(shopId),
      },
    })

    if (!foundDiscount) NotFoundError({ message: 'Discount not exists' })

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_user_count: -1,
      },
    })

    return result
  }
}

module.exports = DiscountService
