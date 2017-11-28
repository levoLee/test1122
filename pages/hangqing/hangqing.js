const app = getApp();
const LoadPage = require('../../modules/loadPage');
Page({
    onShareAppMessage() {
    return {
      title:'行情',
      path:'pages/hangqing/hangqing'
    }
  },
  data: {
    datas: null,
    noData: true,
    loading: false,
    end: false
  },
  onLoad: function () {
    this.loadPage = null;
    this.renderPage();
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }

    const data = {
      pageSize: 20,
      orderByFluctuationDesc: true,
      orderByPricefluctuationDesc: false
    };

    this.loadPage = new LoadPage({
      keys: {
        pageIndex: 'pageNum',
        pageSize: 20
      },
      params: {
        url: wx.apis.getTeaList, 
        data: data
      },
      formatData: (res) => {
        res.data.data.dataList.forEach((item) => {
          item.name = item.name.length > 10 ? item.name.substring(0,10) + '...' : item.name
          item.price = item.price ? item.price.match(/\d+/)[0] : 0
          item.fluctuation = item.fluctuation ? item.fluctuation.match(/\d+/)[0] : 0
          item.class = item.pricefluctuation.indexOf('↑') > -1 ? 'left up' : 'left down'
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
  goDetail: function(ev) {
    const teaId = ev.currentTarget.dataset.teaid
    wx.navigateTo({
      url: '../detail/detail?teaId=' + teaId
    })
  },
  search: function() {
    wx.navigateTo({
      url: '../zixuan/zixuan'
    })
  }
})
