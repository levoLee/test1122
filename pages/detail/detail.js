const app = getApp();
const LoadPage = require('../../modules/loadPage');

Page({
  onShareAppMessage() {
    return {
      title:'链茶详情',
      path:'pages/detail/detail?teaId=' + this.teaId
    }
  },
  data: {
    data: {},
    datas: null,
    noData: false,
    updownClass: 'left up',
    price: '',
    type: 'detail',
    classNames: ['active', '', '', ''],
    showPop: false,
    showComment: false,
    focus: '../../img/focus.png'
  },
  onLoad: function (options) {
    console.log(wx.tea.getUserInfo())
    wx.tea.gobackHome();
    this.teaId = options.teaId;
    this.loadPage = null;
    this.param = 'allList'
    this.lastNum = 0;
    this.getDetail();
    this.trendsId = null;
    this.index = null;
  },
  onShow: function () {   
    const route = app.globalData.route
    if (route === 'comment' && this.data.type !== 'detail') {
      this.loadPage = null;
      this.renderPage()
    }
  },
  getDetail: function() {    
    wx.fetch({
        url: wx.apis.getteaInfo + '?id=' + this.teaId
    }).then((res) => {
      res.data.data.srcimg = 'http://www.liancha.net.cn/' + res.data.data.srcimg
      this.setData({
        data: res.data.data,
        price: res.data.data.price.match(/\d+/g)[0],
        updownClass: res.data.data.amper.indexOf('-') > -1 ? 'left down' : 'left up'
      })
    })
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }

    let data = {
      pageSize: 10,
      userId: wx.tea.getUserInfo().userId,
      teaId: this.teaId
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
              item.activePath = item.activePath || '../../img/portrait.png';
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
  changetab: function(ev) {
    const type = ev.currentTarget.dataset.type;
    const num = ev.currentTarget.dataset.num;

    const classNames = this.data.classNames;
    classNames[this.lastNum] = '';
    classNames[num] = 'active';

    this.lastNum = num;

    this.setData({
      tab1: false
    })
    this.param = type;
    this.setData({
      type: type,
      classNames: classNames
    })
    if (type!=='detail') {
      this.loadPage = null;
      this.renderPage();
    }        
  },
  close: function() {
    this.setData({
      showPop: false
    })
  },
  focus: function() {
    wx.fetch({
        url: wx.apis.addAttend,
        method: 'POST',
        data: {
          userId: wx.tea.getUserInfo().userId,
          teaId: this.teaId
        },
        noStatus: true
    }).then((res) => {
      wx.showToast({
          title: '关注成功',
          icon: 'success'
      })
    })
  },
  showFabu: function() {
    this.setData({
      showPop: true
    })
  },
  setOption: function(ev) {
    const type = ev.currentTarget.dataset.type;
    app.globalData.route = 'comment';

    wx.navigateTo({
      url: '../comment/comment?type=' + type + '&teaId=' + this.teaId
    })

    this.setData({
      showPop: false
    })
  },
  lower: function(){
    this.renderPage();
  },
  scroll: function(event) {
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

        datas[this.index].count = parseInt(datas[this.index].count) + 1

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
