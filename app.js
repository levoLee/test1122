

// 统计数据

Promise = require('./modules/promise').Promise;

wx.Promise = Promise;

//require('./modules/proxy-wx.js').Init();
require('./modules/tea');


wx.fetch = require('./modules/fetch');
wx.Util = require('./modules/util');
require('./modules/polyfills');

//const URL = 'http://112.74.40.2';
const URL = 'http://www.liancha.net.cn/'

const apis = {
  login: `${URL}/api/v1/authorize/userAuthorize`,
  commentList: `${URL}/api/v1/comment/getCommentList`,
  addComment: `${URL}/api/v1/comment/add`,
  options: `${URL}/api/v1/optional/getoptionalList`,
  addOption: `${URL}/api/v1/optional/add`,
  allInfo: `${URL}/api/v1/tea/allInfo`,
  getteaInfo: `${URL}/api/v1/tea/getteaInfo`,
  getDealList: `${URL}/api/v1/deal/getDealList`,
  addMy: `${URL}/api/v1/optional/add`,
  addTrend:`${URL}/api/v1/trends/add`,
  getTrend:`${URL}/api/v1/trends/get`,
  addPraise: `${URL}/api/v1/praise/add`,
  getTrendsList: `${URL}/api/v1/trends/getTrendsList`,
  getUserTrendsList: `${URL}/api/v1/trends/getUserTrendsList`,
  getSearchList: `${URL}/api/v1/tea/getSearchList`,
  addPraise: `${URL}/api/v1/praise/add`,
  upload: `${URL}/api/v1/common/upload?type=5`,
  addAttend: `${URL}/api/v1/attend/add`,
  wxShareUrl: `${URL}/api/v1/trends/forword`,
  getTeaList: `${URL}/api/v1/tea/getTeaList`
};

wx.apis = apis;
App({
  onLaunch(options) {
    wx.app = this;

    const userInfo = wx.tea.getUserInfo();

    if (!userInfo) {
      this.wxLogin()
    } else {

    }
  },
  globalData: {

  },
  wxLogin() {
    //mark 静默登录
    wx.login({
      success: (res) => {
        if (res.code) {//sessionkey
          wx.login({
            success: (resData) => {
              this.wxAuthorization().then((resultData) => {
                wx.request({
                  url: wx.apis.login,
                  method: 'POST',
                  header: {
                    'Content-type': 'application/x-www-form-urlencoded'
                  },
                  data: {
                    wxcode: resData.code,
                    signature: resultData.signature,
                    encryptedData: resultData.encryptedData,
                    channel: 'WXAPP',
                    iv: resultData.iv
                  },
                  success: (resInfo) => {
                    if (resInfo.data.meta.code === 0) {
                      wx.tea.setUserInfo(resInfo.data.data);
                    }
                  }
                })
              });
            }
          })
        }
      }
    })
  },
  wxAuthorization() {
    //mark 授权登录
    return new wx.Promise((resolve) => {
      wx.getUserInfo({
        complete(res) {
          resolve(res)
        }
      })
    })
  },
  globalData: {
    commentData: null,
    route: null
  }
})
