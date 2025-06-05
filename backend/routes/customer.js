const Router = require('koa-router');
const customerController = require('../controllers/customer');
const { verifyToken } = require('../middleware/auth');

const router = new Router({ prefix: '/api/customer' });

// 在线咨询相关接口
router.post('/inquiry', verifyToken, customerController.submitInquiry);
router.get('/inquiries', verifyToken, customerController.getUserInquiries);

// 工单相关接口
router.post('/ticket', verifyToken, customerController.submitTicket);
router.get('/tickets', verifyToken, customerController.getUserTickets);
router.get('/ticket/:id', verifyToken, customerController.getTicketDetail);

// FAQ接口
router.get('/faq', customerController.getFAQList);

module.exports = router;