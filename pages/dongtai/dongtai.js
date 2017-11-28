
//index.js
//获取应用实例
const app = getApp();
const LoadPage = require('../../modules/loadPage');

Page({
  onShareAppMessage() {
    return {
      title:'链茶动态',
      path:'pages/dongtai/dongtai'
    }
  },
  data: {
    datas: null,
    type: 'allList',
    noData: true,
    showComment: false,
    end: false
  },
  onLoad: function () {
    wx.tea.gobackHome();
    this.loadPage = null;
    this.param = 'allList'
    this.trendsId = null;
    this.index = null;
    this.renderPage();
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }

    let data = {
      pageSize: 10,
      userId: wx.tea.getUserInfo().userId 
    };
    let url = wx.apis.getUserTrendsList;

    if (this.param === 'oneList' || this.param === 'zeroList') {
      data = Object.assign({}, data, {
        statu: this.param === 'oneList' ? 1 : 0
      })
    }

    this.loadPage = new LoadPage({
          keys: {
            pageIndex: 'pageNum'
          },
          params: {
            url: url, 
            data: data
          },
          formatData: (res) => {
            res.data.data[this.param].forEach((item) => {
              item.createTime = item.createTime.split(' ')[0];
              item.activePath = item.activePath || '../../img/portrait.png'
              item.content = item.content.length > 20 ? item.content.substring(0,20) + '...' : item.content
            })

            return res.data.data[this.param];
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
  change: function(ev) {
    const type = ev.currentTarget.dataset.type;
    this.param = type;
    this.loadPage = null;

    this.setData({
      type: type
    })

    this.renderPage();
  },
  lower: function(){
    this.renderPage();
  },
  scroll: function() {
    this.setData({
        loading: true
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
        const datas = this.data[this.param];

        datas[this.index].count = parseInt(datas[this.index].count || 0) + 1

        this.setData({
          [this.param]: datas
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
  goDetail: function(ev) {
    const teaId = ev.currentTarget.dataset.teaid
    wx.navigateTo({
      url: '../detail/detail?teaId=' + teaId
    })
  },
  goOptionDetail: function(ev) {
    const trendId = ev.currentTarget.dataset.trendid
    wx.navigateTo({
      url: '../option/option?trendId=' + trendId
    })
  }
})
