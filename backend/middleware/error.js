/**
 * 全局错误处理中间件
 */
module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    
    // 设置状态码
    ctx.status = err.status || 500;
    
    // 构造错误响应
    const response = {
      code: ctx.status,
      message: err.message || '服务器内部错误'
    };
    
    // 开发环境下返回错误堆栈
    if (process.env.NODE_ENV !== 'production') {
      response.stack = err.stack;
    }
    
    ctx.body = response;
  }
}; 