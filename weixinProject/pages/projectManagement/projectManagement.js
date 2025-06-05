// projectManagement.js
import { request, baseUrl } from '../../utils/request';

Page({
  data: {
    projectName: '',
    projectLeader: '',
    projectDescription: '',
    projectGoal: '',
    projectBudget: '',
    progress: '',
    reportFile: null,
    feedback: ''
  },

  onLoad() {
    // 加载项目信息
    this.loadProjectInfo();
  },

  // 加载项目信息
  loadProjectInfo() {
    // 这里可以根据需要加载项目信息
  },

  // 输入项目名称
  inputProjectName(e) {
    this.setData({
      projectName: e.detail.value
    });
  },

  // 输入项目负责人
  inputProjectLeader(e) {
    this.setData({
      projectLeader: e.detail.value
    });
  },

  // 输入项目描述
  inputProjectDescription(e) {
    this.setData({
      projectDescription: e.detail.value
    });
  },

  // 输入项目目标
  inputProjectGoal(e) {
    this.setData({
      projectGoal: e.detail.value
    });
  },

  // 输入项目预算
  inputProjectBudget(e) {
    this.setData({
      projectBudget: e.detail.value
    });
  },

  // 用户提交项目申请
  submitProjectApplication: function() {
    const { projectName, projectLeader, projectDescription, projectGoal, projectBudget } = this.data;
    if (!projectName || !projectLeader || !projectDescription || !projectGoal || !projectBudget) {
      wx.showToast({
        title: '请填写完整的项目信息',
        icon: 'none',
      });
      return;
    }
    
    // 发起项目申请请求
    request({
      url: '/api/project/apply',
      method: 'POST',
      data: {
        projectName,
        projectLeader,
        projectDescription,
        projectGoal,
        projectBudget
      }
    }).then(res => {
      wx.showToast({
        title: '项目申请已提交',
        icon: 'success',
      });
      
      // 清空表单
      this.setData({
        projectName: '',
        projectLeader: '',
        projectDescription: '',
        projectGoal: '',
        projectBudget: ''
      });
      
      // 提交成功后跳转到项目列表页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/projectList/projectList'
        });
      }, 1500);
    }).catch(err => {
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none',
      });
    });
  },

  // 更新项目进度
  updateProgress: function(progress) {
    this.setData({
      progress
    });
  },

  // 提交报告
  submitReport: function() {
    const that = this;
    if (!this.data.reportFile) {
      wx.showToast({
        title: '请上传报告文件',
        icon: 'none',
      });
      return;
    }

    // 上传报告
    wx.uploadFile({
      url: baseUrl + '/api/project/report',
      filePath: that.data.reportFile,
      name: 'file',
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      formData: {
        projectId: that.data.projectId || '',
        reportTitle: '项目进度报告'
      },
      success(res) {
        const result = JSON.parse(res.data);
        if (result.code === 200) {
          wx.showToast({
            title: '报告已提交',
            icon: 'success',
          });
          that.setData({
            reportFile: null
          });
        } else {
          wx.showToast({
            title: result.message || '上传失败',
            icon: 'none',
          });
        }
      },
      fail() {
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none',
        });
      }
    });
  },

  // 选择文件
  chooseFile: function() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        this.setData({
          reportFile: res.tempFiles[0].path
        });
      }
    });
  },

  // 显示反馈
  showFeedback: function(feedback) {
    this.setData({
      feedback
    });
  }
});
