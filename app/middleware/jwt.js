'use strict'

// 解析token的中间件，也可以用egg-jwt，自己封装更适合了解原理
const jwt = require('jsonwebtoken')

module.exports = ({ app }) => {
  return async function verfy(ctx, next) {
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -1,
        message: '用户未登陆',
      }
      return
    }

    const token = ctx.request.header.authorization.replace('Bearer', '')
    try {
      const res = await jwt.verify(token, app.config.jwt.secret)
      console.log('token', res)
      ctx.state.email = res.email
      ctx.state.userid = res._id
      await next()
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登录过期了',
        }
      } else {
        ctx.body = {
          code: -1,
          message: '用户信息出错',
        }
      }
    }
  }
}
