const { request } = require('../../utils/request');

Page({
  data: {
    tickets: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    currentStatus: '' // 空字符串表示全部
  },

  onLoad() {
    this.loadTickets();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      tickets: [],
      hasMore: true
    }, () => {
      this.loadTickets().then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreTickets();
    }
  },

  // 加载工单列表
  loadTickets() {
    if (this.data.loading) return Promise.resolve();
    
    this.setData({ loading: true });
    
    const { page, pageSize, currentStatus } = this.data;
    
    return request({
      url: '/api/customer/tickets',
      method: 'GET',
      data: {
        page,
        pageSize,
        status: currentStatus
      }
    }).then(res => {
      if (res.code === 200) {
        const { list, total } = res.data;
        this.setData({
          tickets: list,
          hasMore: page * pageSize < total
        });
      } else {
        wx.showToast({
          title: res.message || '获取工单列表失败',
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

  // 加载更多工单
  loadMoreTickets() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    
    const { page, pageSize, currentStatus } = this.data;
    
    request({
      url: '/api/customer/tickets',
      method: 'GET',
      data: {
        page,
        pageSize,
        status: currentStatus
      }
    }).then(res => {
      if (res.code === 200) {
        const { list, total } = res.data;
        this.setData({
          tickets: [...this.data.tickets, ...list],
          hasMore: page * pageSize < total
        });
      } else {
        wx.showToast({
          title: res.message || '获取更多工单失败',
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

  // 切换状态筛选
  changeStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status,
      page: 1,
      tickets: [],
      hasMore: true
    }, () => {
      this.loadTickets();
    });
  },

  // 查看工单详情
  viewTicketDetail(e) {
    const ticketId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/ticketDetail/ticketDetail?id=${ticketId}`
    });
  }
}); 