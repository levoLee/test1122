const app = getApp();
const LoadPage = require('../../modules/loadPage');

Page({
  onShareAppMessage() {
    return {
      title:'链茶',
      path:'pages/index/index'
    }
  },
  data: {
    datas: null,
    type: 0,
    noData: true,
    loading: false,
    end: false,
    showComment: false,
    showPop: false,
    hiddenGotop: false
  },
  onLoad: function () {
    this.loadPage = null;
    this.renderPage();
    this.trendsId = null;
  },
  onShow: function () {
    const route = app.globalData.route
    if (route === 'comment') {
      this.loadPage = null;
      this.renderPage();
      this.trendsId = null;
      app.globalData.route = null;
    }
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }
    const data = {
      pageSize: 10,
      statu: this.data.type
    };

    this.loadPage = new LoadPage({
      keys: {
        pageIndex: 'pageNum'
      },
      params: {
        url: wx.apis.getTrendsList, 
        data: data
      },
      formatData: (res) => {
        res.data.data.dataList.forEach((item) => {
          item.createTime = item.createTime.split(' ')[0];
          item.activePath = item.activePath || '../../img/portrait.png'
        })
        return res.data.data.dataList;
      },
      setData: this.setData.bind(this)
    })

    return this.loadPage;
  },
  renderPage: function() {
    this.getLoadPage().request().then((datas) => {
      if (!datas) {
        return;
      }

      this.setData({
        datas: datas,
        noData: datas.length > 0
      })
    });
  },
  lower: function(){
    this.renderPage();
  },
  scroll: function(event) {
    this.setData({
        loading: true
    })
  },
  goOptionDetail: function(ev) {
    const trendId = ev.currentTarget.dataset.trendid
    wx.navigateTo({
      url: '../option/option?trendId=' + trendId
    })
  },
  comment: function(ev) {
    const item = ev.currentTarget.dataset.item;
    this.index = ev.currentTarget.dataset.index;

    this.trendsId = item.id;
    
    this.setData({
      showComment: true
    })
  },
  bindKeyInput: function(ev) {
    this.setData({
      value: ev.detail.value
    })
  },
  cancel: function() {
    this.setData({
      showComment: false
    })
  },
  fabu: function() {
    wx.fetch({
      url: wx.apis.addComment,
      method: 'POST',
      data: {
        userId: wx.tea.getUserInfo().userId,
        trendsId: this.trendsId,
        content: this.data.value
      },
      noStatus: true
    }).then((res) => {
      if (res.data.meta.code == 0) {
        const datas = this.data.datas;

        datas[this.index].count = parseInt(datas[this.index].count || 0) + 1

        this.setData({
          datas: datas
        }) 

        this.index = null;

        this.setData({
          showComment: false
        })

        wx.showToast({
            title: '评论成功',
            icon: 'success'
        })
      }
    })
  },
  change: function(ev) {
    const type = ev.currentTarget.dataset.type;
    this.setData({
      type: type
    })
    this.loadPage = null;
    this.renderPage();
  },
  showPop: function() {
    this.setData({
      showPop: true
    })
  },
  close: function() {
    this.setData({
      showPop: false
    })
  },
  setOption: function(ev) {
    const type = ev.currentTarget.dataset.type;
    app.globalData.route = 'comment'

    wx.navigateTo({
      url: '../comment/comment?type=' + type + '&teaId=' + this.teaId + '&from=index'
    })

    this.setData({
      showPop: false
    })
  },
  search: function () {
    wx.navigateTo({
      url: '../search/searchAll/index'
    })
  },
})
