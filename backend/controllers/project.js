const fs = require('fs');
const path = require('path');
const Project = require('../models/project');
const ProjectReport = require('../models/projectReport');
const User = require('../models/user');
const { Op } = require('sequelize');

class ProjectController {
  /**
   * 创建项目申请
   */
  async createProject(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { 
        projectName, 
        projectLeader, 
        projectDescription, 
        projectGoal, 
        projectBudget 
      } = ctx.request.body;
      
      // 验证请求参数
      if (!projectName || !projectLeader || !projectDescription || !projectGoal || !projectBudget) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请填写所有必填项' };
        return;
      }
      
      // 创建项目记录
      const project = await Project.create({
        userId,
        projectName,
        projectLeader,
        projectDescription,
        projectGoal,
        projectBudget,
        status: 'pending',
        progress: '0%'
      });
      
      ctx.body = {
        code: 200,
        message: '项目申请提交成功',
        data: {
          id: project.id,
          status: project.status,
          createdAt: project.createdAt
        }
      };
    } catch (err) {
      console.error('创建项目申请失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '项目申请提交失败，请稍后重试' };
    }
  }
  
  /**
   * 获取项目列表
   */
  async getProjects(ctx) {
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
      
      const { count, rows } = await Project.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        attributes: ['id', 'projectName', 'projectLeader', 'status', 'progress', 'createdAt', 'reviewedAt']
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
      console.error('获取项目列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取项目列表失败' };
    }
  }
  
  /**
   * 获取项目详情
   */
  async getProjectDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      
      const project = await Project.findOne({
        where: { id, userId },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'phone']
          }
        ]
      });
      
      if (!project) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '项目不存在' };
        return;
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: project
      };
    } catch (err) {
      console.error('获取项目详情失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取项目详情失败' };
    }
  }
  
  /**
   * 更新项目进度
   */
  async updateProgress(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      const { progress } = ctx.request.body;
      
      if (!progress) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请提供项目进度' };
        return;
      }
      
      const project = await Project.findOne({
        where: { id, userId }
      });
      
      if (!project) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '项目不存在' };
        return;
      }
      
      // 只有审核通过的项目才能更新进度
      if (project.status !== 'approved' && project.status !== 'in_progress') {
        ctx.status = 400;
        ctx.body = { code: 400, message: '只有审核通过的项目才能更新进度' };
        return;
      }
      
      // 更新项目进度
      await project.update({
        progress,
        status: 'in_progress'
      });
      
      ctx.body = {
        code: 200,
        message: '项目进度更新成功',
        data: {
          id: project.id,
          progress: project.progress,
          status: project.status
        }
      };
    } catch (err) {
      console.error('更新项目进度失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '更新项目进度失败' };
    }
  }
  
  /**
   * 提交项目报告
   */
  async submitReport(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { projectId, reportTitle, reportContent } = ctx.request.body;
      
      if (!projectId || !reportTitle) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请提供项目ID和报告标题' };
        return;
      }
      
      // 检查项目是否存在
      const project = await Project.findOne({
        where: { id: projectId, userId }
      });
      
      if (!project) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '项目不存在' };
        return;
      }
      
      // 只有进行中的项目才能提交报告
      if (project.status !== 'in_progress' && project.status !== 'approved') {
        ctx.status = 400;
        ctx.body = { code: 400, message: '只有进行中的项目才能提交报告' };
        return;
      }
      
      // 处理上传的文件
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;
      
      if (ctx.request.files && ctx.request.files.file) {
        const file = ctx.request.files.file;
        
        // 确保上传目录存在
        const uploadDir = path.join(__dirname, '../public/uploads/reports');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // 生成唯一文件名
        const ext = path.extname(file.originalFilename);
        const uniqueFileName = `report_${userId}_${projectId}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        // 读取临时文件并写入到目标位置
        const reader = fs.createReadStream(file.filepath);
        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          reader.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        fileUrl = `/uploads/reports/${uniqueFileName}`;
        fileName = file.originalFilename;
        fileSize = file.size;
        fileType = file.mimetype;
      }
      
      // 创建项目报告记录
      const report = await ProjectReport.create({
        projectId,
        userId,
        reportTitle,
        reportContent,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        status: 'submitted'
      });
      
      // 更新项目状态为已完成，如果需要的话
      if (project.progress === '100%') {
        await project.update({ status: 'completed' });
      }
      
      ctx.body = {
        code: 200,
        message: '报告提交成功',
        data: {
          id: report.id,
          reportTitle: report.reportTitle,
          createdAt: report.createdAt
        }
      };
    } catch (err) {
      console.error('提交项目报告失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '报告提交失败，请稍后重试' };
    }
  }
  
  /**
   * 获取项目报告列表
   */
  async getReports(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { projectId, page = 1, pageSize = 10 } = ctx.query;
      
      // 构建查询条件
      const where = { userId };
      if (projectId) {
        where.projectId = projectId;
      }
      
      // 分页查询
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      
      const { count, rows } = await ProjectReport.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        include: [
          {
            model: Project,
            attributes: ['id', 'projectName', 'status', 'progress']
          }
        ]
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
      console.error('获取项目报告列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取项目报告列表失败' };
    }
  }
  
  /**
   * 获取项目报告详情
   */
  async getReportDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      
      const report = await ProjectReport.findOne({
        where: { id, userId },
        include: [
          {
            model: Project,
            attributes: ['id', 'projectName', 'status', 'progress']
          }
        ]
      });
      
      if (!report) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '报告不存在' };
        return;
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: report
      };
    } catch (err) {
      console.error('获取项目报告详情失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取项目报告详情失败' };
    }
  }
}

module.exports = new ProjectController(); 