const LoadQueueLimit = require('./LoadQueueLimit.js');

const queue = LoadQueueLimit(10)

let loadingId = 0;
let successId = 0;
const LIMIT_TIME = 1000;
const myfetch = (opts) => {
  const { url, data, method, complete, header, noStatus } = opts;

  const showError = () => {
    wx.showToast({
      title: '网络异常',
      icon: 'loading',
      duration: 2000
    })
  };

  const showLoading = () => {
    loadingId += 1;

    wx.showToast({
      title: '加载中…',
      icon: 'loading',
      duration: 10000
    })
  };

  const hideLoading = () => {
    if (!noStatus) {
      successId += 1;

      setTimeout(() => {
        if (successId >= loadingId) {
          wx.hideToast();
        }
      }, 100)
    }
  };

  if (!noStatus) {
    showLoading();
  }

  //获取当前页面栈
  const currentPages = getCurrentPages()
  const getCurrentPage = (needOpts) => {
    if (currentPages.length) {
      const currentPage = currentPages[currentPages.length - 1]
      const pagePath = currentPage.__route__
      let pageOptions = '';
      if (needOpts) {
        const arr = [];
        Object.keys(currentPage.options).forEach((prop) => {
          arr.push({
            key: prop,
            value: currentPage.options[prop]
          })
        })
        arr.forEach((item, index) => {
          if (index === arr.length - 1) {
            pageOptions += (`${item.key}=${item.value}`);
          } else {
            pageOptions += (`${item.key}=${item.value}&`);
          }
        })
      }
      return `/${pagePath}?${pageOptions}`
    }
    return ''
  }

  const userInfo = wx.tea.getUserInfo();
  return queue(() => new Promise((resolve, reject) => {
    const startTime = +new Date();
    wx.request({
      url,
      data,
      method: method || 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: Object.assign({
        //Authorization: `Bearer ${userInfo ? userInfo.UserSession : ''}`,
        //currentPage: getCurrentPage(),
        'Content-type': 'application/x-www-form-urlencoded'
      }, header), // 设置请求的 header
      success(res) {
        // success
        if (typeof res.data === 'string') {
          try {
            res.data = JSON.parse(res.data);
          } catch (e) {

          }
        }
        resolve(res);
        hideLoading();
      },
      fail: (e) => {
        hideLoading();

        showError(3, e);
        reject();
      },
      complete: () => {
        complete && complete();
      }
    })
  }))
}

module.exports = myfetch;
