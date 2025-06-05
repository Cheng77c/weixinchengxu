Page({
  data: {
    fileCategories: ['培训资料', '法律文件', '行业报告', '项目文件'],  // 资料分类
    uploadedFiles: [],  // 已上传的文件列表
    downloadableFiles: [],  // 可下载的文件列表
    userRole: '普通用户',  // 当前用户角色（可根据实际情况设置）
  },

  onLoad: function () {
    // 初始化数据加载，如从后台获取文件信息
    this.loadUploadedFiles();
    this.loadDownloadableFiles();
  },

  // 加载合作伙伴上传的文件
  loadUploadedFiles: function() {
    // 模拟获取上传文件列表（可以从后端API获取）
    this.setData({
      uploadedFiles: [
        { name: '合同_001.pdf', category: '法律文件', uploadedBy: '合作伙伴' },
        { name: '项目计划.xlsx', category: '项目文件', uploadedBy: '合作伙伴' },
      ]
    });
  },

  // 加载公司提供的可下载文件
  loadDownloadableFiles: function() {
    // 模拟获取可下载文件列表（可以从后端API获取）
    let files = [
      { name: '行业白皮书.pdf', category: '行业报告', isExclusive: false },
      { name: '行业政策.pdf', category: '行业报告', isExclusive: true },
      { name: '培训资料.docx', category: '培训资料', isExclusive: false },
    ];

    // 根据用户角色过滤文件
    if (this.data.userRole === '普通用户') {
      files = files.filter(file => !file.isExclusive);  // 普通用户无法下载专属文件
    }

    this.setData({
      downloadableFiles: files,
    });
  },

  // 处理文件上传
  handleUpload: function () {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'docx', 'xlsx', 'jpg', 'png'],
      success: res => {
        const file = res.tempFiles[0];
        console.log('上传文件:', file);
        // 上传文件到服务器的逻辑（调用API）
        wx.showToast({ title: '文件上传成功', icon: 'success' });
        this.loadUploadedFiles();  // 重新加载上传的文件列表
      }
    });
  },

  // 处理文件下载
  handleDownload: function (e) {
    const fileName = e.currentTarget.dataset.filename;
    console.log('下载文件:', fileName);
    // 模拟下载逻辑，实际应调用API来下载文件
    wx.showToast({ title: `下载 ${fileName}`, icon: 'success' });
  },

  // 搜索文件
  handleSearch: function (e) {
    const query = e.detail.value.trim().toLowerCase();
    const allFiles = this.data.downloadableFiles;
    const filteredFiles = allFiles.filter(file => file.name.toLowerCase().includes(query));
    this.setData({
      downloadableFiles: filteredFiles,
    });
  },
});
