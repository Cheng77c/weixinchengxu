const Inquiry = require('../models/inquiry');
const Ticket = require('../models/ticket');
const FAQ = require('../models/faq');
const User = require('../models/user');
const { Op } = require('sequelize');

class CustomerController {
  /**
   * 提交在线咨询
   */
  async submitInquiry(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { content } = ctx.request.body;
      
      if (!content || content.trim() === '') {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请填写咨询内容' };
        return;
      }
      
      const inquiry = await Inquiry.create({
        userId,
        content,
        status: 'pending'
      });
      
      ctx.body = {
        code: 200,
        message: '咨询提交成功',
        data: {
          id: inquiry.id,
          content: inquiry.content,
          status: inquiry.status,
          createdAt: inquiry.createdAt
        }
      };
    } catch (err) {
      console.error('提交咨询失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '提交咨询失败，请稍后重试' };
    }
  }
  
  /**
   * 获取用户咨询列表
   */
  async getUserInquiries(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10 } = ctx.query;
      
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      
      const { count, rows } = await Inquiry.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        attributes: ['id', 'content', 'status', 'reply', 'createdAt', 'repliedAt']
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
      console.error('获取咨询列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取咨询列表失败' };
    }
  }
  
  /**
   * 提交工单
   */
  async submitTicket(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { ticketType, content } = ctx.request.body;
      
      if (!ticketType || !content || content.trim() === '') {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请填写工单类型和内容' };
        return;
      }
      
      const ticket = await Ticket.create({
        userId,
        ticketType,
        content,
        status: 'pending',
        priority: 'medium'
      });
      
      ctx.body = {
        code: 200,
        message: '工单提交成功',
        data: {
          id: ticket.id,
          ticketType: ticket.ticketType,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      };
    } catch (err) {
      console.error('提交工单失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '提交工单失败，请稍后重试' };
    }
  }
  
  /**
   * 获取用户工单列表
   */
  async getUserTickets(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { status, page = 1, pageSize = 10 } = ctx.query;
      
      const where = { userId };
      if (status) {
        where.status = status;
      }
      
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      
      const { count, rows } = await Ticket.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        attributes: ['id', 'ticketType', 'content', 'status', 'priority', 'createdAt', 'resolvedAt']
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
      console.error('获取工单列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取工单列表失败' };
    }
  }
  
  /**
   * 获取工单详情
   */
  async getTicketDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      
      const ticket = await Ticket.findOne({
        where: { id, userId },
        attributes: ['id', 'ticketType', 'content', 'status', 'priority', 'solution', 'createdAt', 'resolvedAt']
      });
      
      if (!ticket) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '工单不存在' };
        return;
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: ticket
      };
    } catch (err) {
      console.error('获取工单详情失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取工单详情失败' };
    }
  }
  
  /**
   * 获取FAQ列表
   */
  async getFAQList(ctx) {
    try {
      const { category, page = 1, pageSize = 20 } = ctx.query;
      
      const where = { isActive: true };
      if (category) {
        where.category = category;
      }
      
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      
      const { count, rows } = await FAQ.findAndCountAll({
        where,
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        offset,
        limit,
        attributes: ['id', 'question', 'answer', 'category']
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
      console.error('获取FAQ列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取FAQ列表失败' };
    }
  }
}

module.exports = new CustomerController(); 