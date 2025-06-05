const fs = require('fs');
const path = require('path');
const Cooperate = require('../models/cooperate');
const User = require('../models/user');
const { Op } = require('sequelize');
const sequelize = require('../db/mysql');

class CooperateController {
  /**
   * 创建合作申请
   */
  async createApplication(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { companyName, contactName, contactPhone, companyDesc, intentionDesc } = ctx.request.body;
      
      // 验证请求参数
      if (!companyName || !contactName || !contactPhone || !companyDesc || !intentionDesc) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请填写所有必填项' };
        return;
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(contactPhone)) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请输入有效的手机号码' };
        return;
      }
      
      // 获取上传的文件
      let attachments = [];
      if (ctx.request.files && ctx.request.files.files) {
        const files = Array.isArray(ctx.request.files.files) 
          ? ctx.request.files.files 
          : [ctx.request.files.files];
        
        // 确保上传目录存在
        const uploadDir = path.join(__dirname, '../public/uploads/cooperate');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // 处理每个文件
        for (const file of files) {
          const ext = path.extname(file.originalFilename);
          const fileName = `cooperate_${userId}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          
          // 读取临时文件并写入到目标位置
          const reader = fs.createReadStream(file.filepath);
          const writer = fs.createWriteStream(filePath);
          await new Promise((resolve, reject) => {
            reader.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          attachments.push({
            name: file.originalFilename,
            url: `/uploads/cooperate/${fileName}`,
            size: file.size,
            type: file.mimetype
          });
        }
      }
      
      // 如果前端直接传递了附件数据
      if (ctx.request.body.attachments && Array.isArray(ctx.request.body.attachments)) {
        attachments = [...attachments, ...ctx.request.body.attachments];
      }
      
      // 创建合作申请记录
      const cooperate = await Cooperate.create({
        userId,
        companyName,
        contactName,
        contactPhone,
        companyDesc,
        intentionDesc,
        attachments,
        status: 'pending'
      });
      
      ctx.body = {
        code: 200,
        message: '申请提交成功',
        data: {
          id: cooperate.id,
          status: cooperate.status,
          createdAt: cooperate.createdAt
        }
      };
    } catch (err) {
      console.error('创建合作申请失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '申请提交失败，请稍后重试' };
    }
  }
  
  /**
   * 获取申请列表
   */
  async getApplications(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { status, page = 1, pageSize = 10 } = ctx.query;
      
      // 构建查询条件
      const where = { userId };
      if (status) {
        where.status = status;
      }
      
      // 分页查询
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      
      const { count, rows } = await Cooperate.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        attributes: ['id', 'companyName', 'status', 'createdAt', 'reviewedAt', 'reviewComment']
      });
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          list: rows
        }
      };
    } catch (err) {
      console.error('获取申请列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取申请列表失败' };
    }
  }
  
  /**
   * 获取申请详情
   */
  async getApplicationDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      
      const cooperate = await Cooperate.findOne({
        where: { id, userId },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'phone']
          }
        ]
      });
      
      if (!cooperate) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '申请不存在' };
        return;
      }
      
      // 确保附件数据正确序列化
      const cooperateData = cooperate.toJSON();
      
      // 检查附件数据是否为字符串，如果是则解析
      if (typeof cooperateData.attachments === 'string') {
        try {
          cooperateData.attachments = JSON.parse(cooperateData.attachments);
        } catch (e) {
          console.error('解析附件数据失败:', e);
          cooperateData.attachments = [];
        }
      }
      
      // 确保附件是数组
      if (!Array.isArray(cooperateData.attachments)) {
        cooperateData.attachments = [];
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: cooperateData
      };
    } catch (err) {
      console.error('获取申请详情失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取申请详情失败' };
    }
  }
  
  /**
   * 取消申请
   */
  async cancelApplication(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      
      const cooperate = await Cooperate.findOne({
        where: { id, userId }
      });
      
      if (!cooperate) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '申请不存在' };
        return;
      }
      
      if (cooperate.status !== 'pending') {
        ctx.status = 400;
        ctx.body = { code: 400, message: '只能取消待审核的申请' };
        return;
      }
      
      // 软删除申请
      await cooperate.destroy();
      
      ctx.body = {
        code: 200,
        message: '申请已取消'
      };
    } catch (err) {
      console.error('取消申请失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '取消申请失败' };
    }
  }
  
  /**
   * 获取申请统计
   */
  async getApplicationStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // 统计各状态的申请数量
      const stats = await Cooperate.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { userId },
        group: ['status']
      });
      
      // 格式化结果
      const result = {
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      
      stats.forEach(item => {
        const { status, count } = item.toJSON();
        result[status] = count;
        result.total += count;
      });
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: result
      };
    } catch (err) {
      console.error('获取申请统计失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取申请统计失败' };
    }
  }
}

module.exports = new CooperateController(); 