'use strict'

const { SuccessResponse } = require('../core/success.response')
const CommentService = require('../services/CommentService')

class CommentController {
  // [POST] /comment
  async createComment(req, res, next) {
    new SuccessResponse({
      message: 'Create new comment',
      metadata: await CommentService.createComment(req.body),
    }).send(res)
  }

  // [GET] comment
  async getCommentByParentId(req, res, next) {
    new SuccessResponse({
      message: 'Get comments product successfully',
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res)
  }

  // [DELETE] comment
  async deleteComment(req, res, next) {
    new SuccessResponse({
      message: 'Get comments product successfully',
      metadata: await CommentService.deleteComment(req.body),
    }).send(res)
  }
}

module.exports = new CommentController()
