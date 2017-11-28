const app = getApp();

//0长文，1交易，2产品

Page({
  data: {
    title: '',
    content: '',
    type: 0,
    src: '../../img/upload.png'
  },
  //事件处理函数
  onLoad: function (options) {
    wx.tea.gobackHome();
    this.type = options.type;
    this.teaId = options.teaId;
    this.name = options.name || '';
    this.setData({
      type: this.type,
      from: options.from || '',
      teaName: this.name
    })
    wx.setNavigationBarTitle({
      title: this.type == 0 ? '发布观点' : '发布交易'
    })
  },
  onShow: function() {
    const commentData = app.globalData.commentData;

    if (commentData) {
      this.setData({
        title: wx.getStorageSync('title') || '',
        content: wx.getStorageSync('content') || '',
        teaName: commentData.name,
        from: commentData.from
      })
      this.teaId = commentData.teaId;
      wx.setStorageSync('title', '')
      wx.setStorageSync('content', '')
      app.globalData.commentData = null;
    }
  },
  bindTitleInput: function(ev) {
    this.setData({
      title: ev.detail.value
    })
  },
  bindKeyInput: function(ev) {
    const content = ev.detail.value
    this.setData({
      content: content
    })
    if (content.indexOf('@') > -1 && this.data.from === 'index') {
      wx.setStorageSync('title', this.data.title)
      wx.setStorageSync('content', this.data.content.replace('@', ''))

      wx.navigateTo({
        url: '../zixuan/zixuan?from=fabu'
      })
    }
  },
  addOption: function() {
    wx.fetch({
        url: wx.apis.addTrend,
        data: {
          userId: wx.tea.getUserInfo().userId,
          teaId: this.teaId,
          title: this.data.title,
          content: this.data.content,
          type: this.data.type
        }
    }).then((res) => {
      if (res.data.meta.code == 0) {
        wx.showToast({
          title: '发表成功',
          icon: 'success',
          duration: 3000
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 3000)
      }
    })
  },
  goDetail: function() {
    wx.navigateTo({
      url: '../detail/detail?teaId=' + this.teaId
    })
  },
  chooseImg: function(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], 
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
        wx.request({
          url: wx.apis.upload,
          filePath: res.tempFilePaths[0],
          method: 'POST',
          name: 'file',
          header: {
            'content-type':'multipart/form-data'
          },
          // data: {
          //   files: res.tempFiles
          // },
          success: (res) => {

          }
        })
      }
    })
  }
})
