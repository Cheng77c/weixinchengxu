const Router = require('koa-router');
const projectController = require('../controllers/project');
const { verifyToken } = require('../middleware/auth');
const { koaBody } = require('koa-body');

const router = new Router({ prefix: '/api/project' });

// 配置文件上传中间件
const fileUploadMiddleware = koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024, // 限制文件大小为200MB
    keepExtensions: true
  }
});

// 项目申请相关接口
router.post('/apply', verifyToken, projectController.createProject);
router.get('/list', verifyToken, projectController.getProjects);
router.get('/detail/:id', verifyToken, projectController.getProjectDetail);
router.put('/progress/:id', verifyToken, projectController.updateProgress);

// 项目报告相关接口
router.post('/report', verifyToken, fileUploadMiddleware, projectController.submitReport);
router.get('/report/list', verifyToken, projectController.getReports);
router.get('/report/detail/:id', verifyToken, projectController.getReportDetail);

module.exports = router;