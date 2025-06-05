// pages/trainingManagement/trainingManagement.js
Page({
  data: {
    courses: [], // 存储课程列表
    userType: '普通用户', // 当前用户类型（普通用户或合作伙伴）
    applicationStatus: false, // 是否已申请课程
    trainingProgress: '未开始', // 课程进度
    trainingResult: '', // 培训考试结果
  },

  // 获取课程列表数据
  getCourses() {
    // 示例数据，实际情况下可能需要通过网络请求获取数据
    const courses = [
      { id: 1, name: '基础培训课程', type: '线上', description: '基础知识培训课程' },
      { id: 2, name: '行业进阶课程', type: '线下', description: '行业分析与技巧培训' },
      { id: 3, name: '直播课程', type: '直播', description: '实时互动学习' },
    ];

    this.setData({
      courses: courses
    });
  },

  // 申请课程
  applyCourse(e) {
    const courseId = e.currentTarget.dataset.courseId;
    if (this.data.userType === '普通用户' && courseId !== 1) {
      wx.showToast({ title: '仅可申请基础培训课程', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认申请',
      content: '是否申请该课程？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            applicationStatus: true,
            trainingProgress: '申请中',
          });
          wx.showToast({ title: '申请已提交', icon: 'success' });
        }
      }
    });
  },

  // 查看申请状态
  viewApplicationStatus() {
    if (this.data.applicationStatus) {
      wx.showToast({ title: '您已申请课程', icon: 'success' });
    } else {
      wx.showToast({ title: '您还没有申请课程', icon: 'none' });
    }
  },

  // 培训签到
  signIn() {
    this.setData({ trainingProgress: '已签到' });
    wx.showToast({ title: '签到成功', icon: 'success' });
  },

  // 进行考试
  takeExam() {
    wx.navigateTo({
      url: '/pages/exam/exam' // 假设有一个考试页面
    });
  },

  // 获取培训证书
  getCertificate() {
    if (this.data.trainingResult === '合格') {
      wx.showToast({ title: '您已获得电子证书', icon: 'success' });
    } else {
      wx.showToast({ title: '考试未通过', icon: 'none' });
    }
  },

  onLoad() {
    this.getCourses(); // 页面加载时获取课程列表
  }
});