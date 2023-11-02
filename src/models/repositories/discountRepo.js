'use strict'

const { getSelectData, unGetSelect } = require('../../utils')
const DiscountModel = require('../../models/discount.model')

const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sortBy = 'ctime',
  filter,
  unSelect,
}) => {
  const skip = (page - 1) * limit
  const documents = await DiscountModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelect(unSelect))
    .lean()

  return documents
}

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sortBy = 'ctime',
  filter,
  select,
}) => {
  const skip = (page - 1) * limit
  const documents = await DiscountModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

  return documents
}

const checkDiscountExists = async ({filter}) => {
  return await DiscountModel.find(filter)
}

const updateDiscount = async ({ codeId, shopId, bodyUpdate, isNew = true }) => {
  return await DiscountModel.findOneAndUpdate(
    {
      discount_code: codeId,
      discount_shopId: new Types.ObjectId(shopId),
    },
    bodyUpdate,
    { new: isNew }
  )
}

module.exports = {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  checkDiscountExists,
  updateDiscount,
}
