const { request } = require('../../utils/request');

Page({
  data: {
    showFAQ: false,
    faqList: [],
    inquiryText: "",
    ticketType: "技术支持",
    ticketContent: "",
    loading: false
  },

  onLoad() {
    this.loadFAQList();
  },

  // 加载FAQ列表
  loadFAQList() {
    this.setData({ loading: true });
    
    request({
      url: '/api/customer/faq',
      method: 'GET'
    }).then(res => {
      if (res.code === 200) {
        this.setData({
          faqList: res.data.list
        });
      } else {
        wx.showToast({
          title: res.message || '获取FAQ失败',
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

  toggleFAQ() {
    this.setData({
      showFAQ: !this.data.showFAQ
    });
  },

  submitTicket() {
    const { ticketType, ticketContent } = this.data;
    if (ticketContent.trim() === "") {
      wx.showToast({ title: "请填写问题内容", icon: "none" });
      return;
    }
    
    this.setData({ loading: true });
    
    request({
      url: '/api/customer/ticket',
      method: 'POST',
      data: {
        ticketType,
        content: ticketContent
      }
    }).then(res => {
      if (res.code === 200) {
        wx.showToast({ 
          title: "工单提交成功", 
          icon: "success" 
        });
        this.setData({
          ticketContent: ""
        });
      } else {
        wx.showToast({
          title: res.message || '工单提交失败',
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

  updateTicketContent(e) {
    this.setData({
      ticketContent: e.detail.value
    });
  },

  updateTicketType(e) {
    this.setData({
      ticketType: ['技术支持', '合作问题'][e.detail.value]
    });
  },

  updateInquiryText(e) {
    this.setData({
      inquiryText: e.detail.value
    });
  },

  sendInquiry() {
    const { inquiryText } = this.data;
    if (inquiryText.trim() === "") {
      wx.showToast({ title: "请填写您的问题", icon: "none" });
      return;
    }
    
    this.setData({ loading: true });
    
    request({
      url: '/api/customer/inquiry',
      method: 'POST',
      data: {
        content: inquiryText
      }
    }).then(res => {
      if (res.code === 200) {
        wx.showToast({ 
          title: "问题已提交", 
          icon: "success" 
        });
        this.setData({
          inquiryText: ""
        });
      } else {
        wx.showToast({
          title: res.message || '提交失败',
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
  
  // 跳转到工单列表页面
  viewTicketList() {
    wx.navigateTo({
      url: '/pages/ticketList/ticketList'
    });
  }
});
