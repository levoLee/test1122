const app = getApp();
const LoadPage = require('../../../modules/loadPage');

Page({
  onShareAppMessage() {
    return {
      title:'链茶搜索全部',
      path:'pages/search/searchTea/index'
    }
  },
  data: {
    datas: null,
    value: '',
    noData: true,
    loading: false,
    end: false,
    search: {
      searchValue: '',
      showClearBtn: false
    },
    searchResult: []
  },
  onLoad: function (options) {
    wx.tea.gobackHome();
    this.from = options.from || '';
    this.loadPage = null;
  },
  getLoadPage: function() {
    if (this.loadPage) {
        return this.loadPage
    }

    const data = {
      pageSize: 20,
      userId: wx.tea.getUserInfo().userId,
      name: this.data.value
    };

    this.loadPage = new LoadPage({
          keys: {
            pageIndex: 'pageNum'
          },
          params: {
            url: wx.apis.getTeaList, 
            data: data
          },
          formatData: (res) => {
            res.data.data.dataList.forEach((item) => {
              item.name = item.name.length > 10 ? item.name.substring(0,20) + '...' : item.name
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
  search: function() {
  	this.loadPage = null;
  	this.renderPage();
  },
  lower: function(){
    this.renderPage();
  },
  scroll: function(event) {
    this.setData({
        loading: true
    })
  },
  bindKeyInput: function(ev) {
    const val = ev.detail.value;

  	this.setData({
      value: val
  	})
    if (ev.detail.value.length > 1) {
      this.search(),
      this.setData({
        'search.showClearBtn': val != '' ? true : false,
        'search.searchValue': val
      })
    }
  },
   //清除输入内容
  searchActiveChangeclear: function (e) {
    this.setData({
      'search.showClearBtn': false,
      'search.searchValue': ''
    })
  },
  focus: function(ev) {
  	const teaId = ev.currentTarget.dataset.teaid;

  	wx.fetch({
      url: wx.apis.addMy,
      data: {
      	userId: wx.tea.getUserInfo().userId,
      	teaId: teaId
      }
    }).then((res) => {
    	if (res.data.meta.code == 0) {
    		wx.showToast({
  			  title: '添加成功',
  			  icon: 'success'
  			})
    	}
    })
  },
  choose: function(ev) {
    if (this.from === 'fabu') {
      const name = ev.currentTarget.dataset.item.name;
      const teaId = ev.currentTarget.dataset.item.id;
      app.globalData.commentData = {
        name: name,
        teaId: teaId,
        from: 'index'
      }

      wx.navigateBack({
        url: '../../comment/comment'
      })
    }
  }
})
