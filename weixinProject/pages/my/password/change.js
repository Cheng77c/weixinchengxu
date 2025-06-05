const app = getApp();
const { request } = require('../../../utils/request');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  
  // 处理输入框变化
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [field]: value
    });
  },
  
  // 验证密码格式
  validatePassword(password) {
    return password && password.length >= 6;
  },
  
  // 提交表单
  async submitForm() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    
    // 验证表单
    if (!oldPassword) {
      wx.showToast({
        title: '请输入原密码',
        icon: 'none'
      });
      return;
    }
    
    if (!this.validatePassword(newPassword)) {
      wx.showToast({
        title: '新密码长度不能少于6位',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      });
      return;
    }
    
    if (oldPassword === newPassword) {
      wx.showToast({
        title: '新密码不能与原密码相同',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    try {
      const res = await request({
        url: '/user/change-password',
        method: 'POST',
        data: {
          oldPassword,
          newPassword
        }
      });
      
      if (res.code === 200) {
        wx.showToast({
          title: '密码修改成功',
          icon: 'success'
        });
        
        // 清空表单
        this.setData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message || '密码修改失败');
      }
    } catch (err) {
      console.error('修改密码失败:', err);
      wx.showToast({
        title: err.message || '修改失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
}) 