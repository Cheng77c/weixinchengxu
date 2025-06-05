// routes/auth.js
const Router = require('koa-router');
const authController = require('../controllers/auth');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/auth' });

// 手机号密码登录
router.post('/phone-login', authController.phoneLogin);

// 手机号注册
router.post('/phone-register', authController.phoneRegister);

// 微信登录
router.post('/wechat-login', authController.wechatLogin);

// 绑定微信和手机号
router.post('/bind-wechat', authController.bindWechat);

// 获取用户信息（需要认证）
router.get('/user-info', verifyToken, authController.getUserInfo);

module.exports = router;