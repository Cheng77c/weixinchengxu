const Router = require('koa-router');
const uploadController = require('../controllers/upload');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/api' });

// 需要登录的接口
router.use(verifyToken);

// 文件上传
router.post('/upload', uploadController.uploadFile);

module.exports = router;