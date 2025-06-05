const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    userInfo: {},
    formData: {
      name: '',
      phone: '',
      companyName: '',
      position: '',
      contact: ''
    }
  },
  
  onLoad() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      userInfo,
      formData: {
        name: userInfo.name || '',
        phone: userInfo.phone || '',
        companyName: userInfo.companyName || '',
        position: userInfo.position || '',
        contact: userInfo.contact || ''
      }
    });
  },
  
  // 处理输入框变化
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },
  
  // 提交表单
  async submitForm() {
    const { formData } = this.data;
    
    // 表单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    try {
      const res = await request({
        url: '/user/update-profile',
        method: 'POST',
        data: formData
      });
      
      if (res.code === 200) {
        // 更新全局用户信息
        app.globalData.userInfo = res.userInfo;
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message || '保存失败');
      }
    } catch (err) {
      console.error('更新个人资料失败:', err);
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
}) 