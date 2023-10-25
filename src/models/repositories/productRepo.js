'use strict'

const { product, clothing, electronic, furniture } = require('../product.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelect } = require('../../utils')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)

  const results = await product
    .find(
      {
        $text: { $search: regexSearch },
        isPublished: true,
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()

  return results
}

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })
  if (!foundShop) return null
  const option = { $set: { isDraft: false, isPublished: true } }
  const { modifiedCount } = await product.updateOne(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    option
  )
  return modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })
  if (!foundShop) return null
  const option = { $set: { isDraft: true, isPublished: false } }
  const { modifiedCount } = await product.updateOne(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    option
  )
  return modifiedCount
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
  return products
}

const findProductById = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelect(unSelect)).lean()
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  searchProductByUser,
  publishProductByShop,
  unPublishProductByShop,
  findAllProducts,
  findProductById,
}
