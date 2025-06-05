const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT认证中间件
 * 验证请求头中的Authorization字段
 */
const verifyToken = async (ctx, next) => {
  try {
    // 从请求头中获取token
    const token = ctx.header.authorization?.split(' ')[1];
    
    if (!token) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '未授权，请先登录' };
      return;
    }
    
    try {
      // 验证token
      const decoded = jwt.verify(token, config.jwt.secret);
      // 将解码后的用户信息存储到ctx.state中
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        ctx.status = 401;
        ctx.body = { code: 401, message: '登录已过期，请重新登录' };
      } else {
        ctx.status = 401;
        ctx.body = { code: 401, message: '无效的token' };
      }
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};

module.exports = {
  verifyToken
}; 