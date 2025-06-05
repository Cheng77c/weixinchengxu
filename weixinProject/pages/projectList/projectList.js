// projectList.js
import { request } from '../../utils/request';
import { formatDate } from '../../utils/util';

Page({
  data: {
    projects: [],
    statusIndex: 0,
    statusOptions: ['全部', '待审核', '已通过', '已拒绝', '进行中', '已完成'],
    statusValues: ['', 'pending', 'approved', 'rejected', 'in_progress', 'completed'],
    statusMap: {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝',
      'in_progress': '进行中',
      'completed': '已完成'
    },
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadProjects();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      projects: []
    }, () => {
      this.loadProjects().then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProjects();
    }
  },

  // 加载项目列表
  loadProjects() {
    const { statusValues, statusIndex, page, pageSize } = this.data;
    const status = statusValues[statusIndex];
    
    this.setData({ loading: true });
    
    return request({
      url: '/api/project/list',
      method: 'GET',
      data: {
        status,
        page,
        pageSize
      }
    }).then(res => {
      if (res.code === 200) {
        const projects = res.data.list.map(item => {
          // 处理日期格式
          item.createdAt = formatDate(new Date(item.createdAt));
          // 处理进度值
          item.progressValue = parseInt(item.progress || '0%');
          return item;
        });
        
        this.setData({
          projects,
          hasMore: projects.length >= pageSize
        });
      } else {
        wx.showToast({
          title: res.message || '获取项目列表失败',
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

  // 加载更多项目
  loadMoreProjects() {
    if (!this.data.hasMore || this.data.loading) return;
    
    const { statusValues, statusIndex, page, pageSize, projects } = this.data;
    const status = statusValues[statusIndex];
    const nextPage = page + 1;
    
    this.setData({ loading: true });
    
    request({
      url: '/api/project/list',
      method: 'GET',
      data: {
        status,
        page: nextPage,
        pageSize
      }
    }).then(res => {
      if (res.code === 200) {
        const newProjects = res.data.list.map(item => {
          // 处理日期格式
          item.createdAt = formatDate(new Date(item.createdAt));
          // 处理进度值
          item.progressValue = parseInt(item.progress || '0%');
          return item;
        });
        
        this.setData({
          projects: [...projects, ...newProjects],
          page: nextPage,
          hasMore: newProjects.length >= pageSize
        });
      } else {
        wx.showToast({
          title: res.message || '获取更多项目失败',
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

  // 状态筛选变化
  statusChange(e) {
    this.setData({
      statusIndex: e.detail.value,
      page: 1,
      projects: [],
      hasMore: true
    }, () => {
      this.loadProjects();
    });
  },

  // 跳转到项目详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/projectDetail/projectDetail?id=${id}`
    });
  },

  // 跳转到申请页面
  goToApply() {
    wx.navigateTo({
      url: '/pages/projectManagement/projectManagement'
    });
  }
}); 