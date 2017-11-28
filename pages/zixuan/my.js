const app = getApp();
const LoadPage = require('../../modules/loadPage');

Page({
  onShareAppMessage() {
    return {
      title:'链茶自选',
      path:'pages/zixuan/my'
    }
  },
  data: {
    datas: null,
    noData: true,
    loading: false,
    end: false
  },
  onLoad: function () {
    wx.tea.gobackHome();    
  },
  onShow: function () {
    this.loadPage = null;
    this.renderPage();
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }

    const data = {
      pageSize: 20,
      userId: wx.tea.getUserInfo().userId
    };

    this.loadPage = new LoadPage({
          keys: {
            pageIndex: 'pageNum',
            pageSize: 20
          },
          params: {
            url: wx.apis.options, 
            data: data
          },
          formatData: (res) => {
            res.data.data.dataList.forEach((item) => {
              item.teaName = item.teaName.length > 10 ? item.teaName.substring(0,10) + '...' : item.teaName
              item.className = item.percent.indexOf('-') ? 'down' : 'up'
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
  search: function() {
    wx.navigateTo({
      url: '../search/searchAll/index'
    })
  },
  goDetail: function(ev) {
    const teaId = ev.currentTarget.dataset.teaid
    wx.navigateTo({
      url: '../detail/detail?teaId=' + teaId
    })
  }
})
