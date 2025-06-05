// routes/index.js
const Router = require('koa-router');
const authRoutes = require('./auth');
const customerRoutes = require('./customer');
const projectRoutes = require('./project');
const userRoutes = require('./user');
const cooperateRoutes = require('./cooperate');
const uploadRoutes = require('./upload');
const fileRoutes = require('./file');

const router = new Router();

// 健康检查
router.get('/', (ctx) => {
  ctx.body = { message: '服务器运行正常' };
});

// 注册认证路由
router.use(authRoutes.routes(), authRoutes.allowedMethods());

// 注册用户路由
router.use(userRoutes.routes(), userRoutes.allowedMethods());

// 合并所有路由
router.use(customerRoutes.routes());
router.use(customerRoutes.allowedMethods());
router.use(projectRoutes.routes());
router.use(projectRoutes.allowedMethods());
router.use(cooperateRoutes.routes());
router.use(cooperateRoutes.allowedMethods());
router.use(uploadRoutes.routes());
router.use(uploadRoutes.allowedMethods());
router.use(fileRoutes.routes());
router.use(fileRoutes.allowedMethods());

module.exports = router;