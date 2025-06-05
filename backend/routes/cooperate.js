const Router = require('koa-router');
const cooperateController = require('../controllers/cooperate');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/api/cooperate' });

// 需要登录的接口
router.use(verifyToken);

// 创建合作申请
router.post('/apply', cooperateController.createApplication);

// 获取申请列表
router.get('/list', cooperateController.getApplications);

// 获取申请详情
router.get('/detail/:id', cooperateController.getApplicationDetail);

// 取消申请
router.delete('/:id', cooperateController.cancelApplication);

// 获取申请统计
router.get('/stats', cooperateController.getApplicationStats);

module.exports = router; 