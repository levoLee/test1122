//logs.js
const app = getApp();
const LoadPage = require('../../modules/loadPage');
Page({
	onShareAppMessage() {
	    return {
	      title:'链茶动态',
	      path:'pages/option/option?trendId=' + this.trendId
	    }
	},
  	data: {
    	datas: [],
    	display: false,
    	nickname: '',
    	createTime: '',
    	portrait: '',
    	title: '',
    	content: '',
    	forwordCount: 0,
    	zancount: 0,
    	commentCount: 0,
    	noData: true,
	    loading: false,
	    end: false,
	    text: '正序',
	    showComment: false,
	    value: ''
  	},
  	onLoad: function (options) {
  		wx.tea.gobackHome();
  		this.trendId = options.trendId
  		this.teaId = null;
  		this.type = true;//评论类型，列表的还是当前的
  		this.getOption();
  		this.renderPage();
  		this.shareAppUrl();
  		this.loadPage = null;
  		this.userId = null; 		
  		this.index = null;
  		this.trendsId = null;
  	},
  	shareAppUrl: function() {
  		this.onShareAppMessage = () => {
  			return {
  				title: '快来分享链茶观点吧',
		        desc: '快来分享链茶观点吧',
		        path: '/pages/option/option',
		        success: (res) => {
		        	wx.fetch({
		                url: wx.apis.wxShareUrl + '?id=' + this.trendId,
		                noStatus: true
		            }).then((res) => {
		            	if (res.data.meta.code == 0) {
		            		this.setData({
								forwordCount: parseInt(this.data.forwordCount) + 1
							})

			            	wx.showToast({
							  	title: '转发成功',
							  	icon: 'success'
							})
		            	}
		            })
		        }
  			}
  		}
  	},
  	getLoadPage: function() {
	    if (this.loadPage) {
	        return this.loadPage
	    }

	    const data = {
	      pageSize: 10,
	      trendsId: this.trendId,
	      orderByTimeDesc: this.type
	    };

	    this.loadPage = new LoadPage({
	      	keys: {
	        	pageIndex: 'pageNum'
	      	},
	      	params: {
	        	url: wx.apis.commentList, 
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
		        commentCount: datas.length || 0,
		        noData: datas.length > 0
		    })
	    });
	},
	reload: function(ev) {
		const type = ev.currentTarget.dataset.type - 0;
		this.type = type === 1 ? true : false;
		this.loadPage = null;
		this.setData({
			text: type === 1 ? '正序' : '反序',
			display: false
		})
		this.renderPage();
	},
  	getOption: function() {
  		wx.fetch({
      		url: wx.apis.getTrend + '?id=' + this.trendId
   		}).then((res) => {
   			this.teaId = res.data.data.teaId;
   			this.userId = res.data.data.userId;
    		this.setData({
    			nickname: res.data.data.userName,
		    	createTime: res.data.data.createTime,
		    	portrait: res.data.data.activePath || '../../img/portrait.png',
		    	title: res.data.data.title,
		    	content: res.data.data.content,
		    	forwordCount: res.data.data.forwordCount || 0,
		    	zancount: res.data.data.zancount || 0
    		})
    	})
  	},
  	addOption: function() {
  		wx.fetch({
      		url: wx.apis.addTrend
   		}).then((res) => {
    		
    	})
  	},
  	handleOpen: function() {
		this.setData({
  			display: true
  		})
  	},
  	handleClose: function() {
  		this.setData({
  			display: false
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
  	addPraise: function(ev) {
  		const id = ev.currentTarget.dataset.id || this.userId;
  		const index = ev.currentTarget.dataset.index;

  		wx.fetch({
      		url: wx.apis.addPraise,
      		method: 'POST',
      		data: {
      			userId: wx.tea.getUserInfo().userId,
      			commentId: id
      		}
   		}).then((res) => {
    		if (res.data.meta.code == 0) {
    			wx.showToast({
				  	title: '点赞成功',
				  	icon: 'success'
				})
    			if (index || index == 0) {
    				const datas = this.data.datas;
	    			datas[index].count = parseInt(datas[index].count || 0)+1;

	    			this.setData({
	    				datas: datas
	    			})
    			} else {
    				this.setData({
    					zancount: parseInt(this.data.zancount) + 1
    				})  				
    			}
    		}
    	})
  	},
	focus: function() {
		wx.fetch({
	        url: wx.apis.addAttend,
	        method: 'POST',
	        data: {
	          userId: wx.tea.getUserInfo().userId,
	          trendsId: this.trendId
	        },
	        noStatus: true
	    }).then((res) => {
	      wx.showToast({
	          title: '关注成功',
	          icon: 'success'
	      })
	    })
	},
	comment: function(ev) {
		const item = ev.currentTarget.dataset.item;
		this.index = ev.currentTarget.dataset.index;

		if (item) {
			this.trendsId = item.trendsId;
		} else {
			this.trendsId = this.trendId;
		}
		
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
	    		if (!this.index && this.index !== 0) {
		    		this.setData({
		    			commentCount: this.data.commentCount + 1
		    		})
		    	}

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
	}
})
