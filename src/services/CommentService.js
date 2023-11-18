'use strict'

const { Types } = require('mongoose')
const CommentModel = require('../models/comment.model')
const { NotFoundError } = require('../core/error.response')
const { getProductById } = require('../models/repositories/productRepo')

/*
  key features: Comment service
  + add comment [User, Shop]
  + get a list of comments [User, Shop]
  + delete a comment [User | Shop | Admin]
*/

class CommentService {
  // [POST] /comment
  static async createComment({ productId, userId, content, parentCommentId }) {
    const comment = new CommentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    })

    let rightValue
    if (parentCommentId) {
      // reply comment
      const parentComment = await CommentModel.findById(parentCommentId)
      if (!parentComment)
        throw new NotFoundError({ message: 'Parent comment not found' })

      rightValue = parentComment.comment_right

      // update many comments
      await CommentModel.updateMany(
        {
          comment_productId: new Types.ObjectId(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      )

      await CommentModel.updateMany(
        {
          comment_productId: new Types.ObjectId(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      )
    } else {
      const maxRightValue = await CommentModel.findOne(
        {
          comment_productId: new Types.ObjectId(productId),
        },
        'comment_right',
        { sort: { comment_right: -1 } }
      )
      if (maxRightValue) {
        rightValue = maxRightValue.right + 1
      } else {
        rightValue = 1
      }
    }

    // insert to comment
    comment.comment_left = rightValue
    comment.comment_right = rightValue + 1

    await comment.save()
    return comment
  }

  // [GET] /comment
  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0, //skip
  }) {
    console.log('productId', productId)
    console.log('parentCommentId', parentCommentId)
    if (parentCommentId) {
      const parent = await CommentModel.findById(parentCommentId)
      if (!parent)
        throw new NotFoundError({ message: 'Not found comment for product' })

      const comments = await CommentModel.find({
        comment_productId: new Types.ObjectId(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lt: parent.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({
          comment_left: 1,
        })

      return comments
    }

    const comments = await CommentModel.find({
      comment_productId: new Types.ObjectId(productId),
      comment_parentId: parentCommentId,
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      })

    return comments
  }

  // [DELETE] /comment/
  static async deleteComment({ commentId, productId }) {
    // check product exists ?
    const foundProduct = await getProductById(productId)
    if (!foundProduct) {
      throw new NotFoundError({ message: 'Product not found' })
    }

    // 1.determined left, right comment value
    const comments = await CommentModel.findById(commentId)
    if (!comments) throw new NotFoundError({ message: 'Not found comment' })

    const leftValue = comments.comment_left
    const rightValue = comments.comment_right

    const width = rightValue - leftValue + 1
    // 2.delete child comment
    await CommentModel.deleteMany({
      comment_productId: new Types.ObjectId(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    })
    // 3.update another comment
    await CommentModel.updateMany(
      {
        comment_productId: new Types.ObjectId(productId),
        comment_right: { $gt: rightValue },
      },
      { $inc: { comment_right: -width } }
    )

    await CommentModel.updateMany(
      {
        comment_productId: new Types.ObjectId(productId),
        comment_left: { $gt: rightValue },
      },
      { $inc: { comment_left: -width } }
    )

    return true
  }
}

module.exports = CommentService
