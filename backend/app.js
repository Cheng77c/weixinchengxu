// app.js
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const helmet = require('koa-helmet');
const koaStatic = require('koa-static');
const path = require('path');
const router = require('./routes');
const errorMiddleware = require('./middleware/error');
const config = require('./config');
const { koaBody } = require('koa-body');
const { syncModels } = require('./db/init');

// 添加必要的polyfill
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = require('stream/web').ReadableStream;
}

// 创建Koa应用实例
const app = new Koa();

// 安全头
app.use(helmet());

// 跨域处理
app.use(cors());

// 文件上传和请求体解析
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024, // 设置上传文件大小限制为200MB
    keepExtensions: true,
  }
}));

// 静态文件服务
app.use(koaStatic(path.join(__dirname, 'public')));

// 日志记录
app.use(logger());

// 全局错误处理
app.use(errorMiddleware);

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = config.port || 3001;
(async () => {
  try {
    // 同步数据库模型
    await syncModels();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
})();

module.exports = app;