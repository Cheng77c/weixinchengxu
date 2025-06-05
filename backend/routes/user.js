const Router = require('koa-router');
const userController = require('../controllers/user');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/user' });

// 所有用户路由都需要认证
router.use(verifyToken);

// 更新个人资料
router.post('/update-profile', userController.updateProfile);

// 修改密码
router.post('/change-password', userController.changePassword);

module.exports = router; 