Page({
  data: {
    notices: [
      "公司动态：新项目上线！",
      "最新政策：培训课程更新！",
      "重要公告：即将举办线下活动！"
    ],
  },
   // 跳转到合作申请页面
   navigateToCooperateApply: function() {
    wx.navigateTo({
      url: '/pages/cooperateApply/cooperateApply'
    });
  },

  navigateToTrainingManagement: function() {
    wx.navigateTo({
      url: '/pages/trainingManagement/trainingManagement'
    });
  },

  navigateToProjectManagement: function() {
    wx.navigateTo({
      url: '/pages/projectList/projectList'
    });
  },

  navigateToDatumCenter: function() {
    wx.navigateTo({
      url: '/pages/datumCenter/datumCenter'
    });
  },
})
