const Router = require('koa-router');
const fileController = require('../controllers/file');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/api/datum' });

// 所有接口都需要登录认证
router.use(verifyToken);

// 获取文件分类列表
router.get('/categories', fileController.getCategories);

// 上传文件
router.post('/upload', fileController.uploadFile);

// 获取文件列表
router.get('/files', fileController.getFileList);

// 按分类获取文件列表（分类展示）
router.get('/files-by-category', fileController.getFilesByCategory);

// 获取用户上传的文件列表
router.get('/my-files', fileController.getUserUploadedFiles);

// 获取文件详情
router.get('/files/:id', fileController.getFileDetail);

// 下载文件
router.get('/download/:id', fileController.downloadFile);

// 删除文件
router.delete('/files/:id', fileController.deleteFile);

module.exports = router; 