const { request } = require('../../utils/request');

Page({
  data: {
    ticketId: null,
    ticket: null,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        ticketId: options.id
      });
      this.loadTicketDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTicketDetail().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载工单详情
  loadTicketDetail() {
    const { ticketId } = this.data;
    if (!ticketId || this.data.loading) return Promise.resolve();
    
    this.setData({ loading: true });
    
    return request({
      url: `/api/customer/ticket/${ticketId}`,
      method: 'GET'
    }).then(res => {
      if (res.code === 200) {
        // 格式化日期
        const ticket = res.data;
        if (ticket.createdAt) {
          ticket.createdAt = this.formatDate(new Date(ticket.createdAt));
        }
        if (ticket.resolvedAt) {
          ticket.resolvedAt = this.formatDate(new Date(ticket.resolvedAt));
        }
        
        this.setData({
          ticket
        });
      } else {
        wx.showToast({
          title: res.message || '获取工单详情失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },
  
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  
  // 返回工单列表
  goBack() {
    wx.navigateBack();
  }
}); 