'use strict'

const StatusCode = {
  FORBIDDEN: 403,
  CONFLICT: 409,
}

const ReasonStatus = {
  FORBIDDEN: 'Bad request error',
  CONFLICT: 'Conflict error',
}

const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode')

class ErrorResponse extends Error {
  constructor({ message, status }) {
    super(message)
    this.status = status
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor({
    message = ReasonStatus.CONFLICT,
    status = StatusCode.CONFLICT,
  }) {
    super({ message, status })
  }
}

class BadRequestError extends ErrorResponse {
  constructor({
    message = ReasonStatus.FORBIDDEN,
    status = StatusCode.FORBIDDEN,
  }) {
    super({ message, status })
  }
}

class AuthFailureError extends ErrorResponse {
  constructor({
    message = ReasonPhrases.UNAUTHORIZED,
    status = StatusCodes.UNAUTHORIZED,
  }) {
    super({ message, status })
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    status = StatusCodes.NOT_FOUND
  ) {
    super(message, status)
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
}
