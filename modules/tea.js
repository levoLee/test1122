/**用户信息相关*/
//wx.tea.getUserInfo()

/**获取用户Id*/
//wx.tea.getUserId()

/**写入用户信息*/
//wx.tea.setUserInfo(userInfo)

//获取用户信息 promise
//wx.tea.getUserPromise().then((userInfo) => {})
//获取用户id promise
//wx.tea.getUserIdPromise().then((userId) => {})

//获取网络状态
//wx.tea.getNetWork()

const tea = {
  util: {}
};

const safeRedirect = url => wx.redirectTo({
  url,
  fail: () => {
    wx.switchTab({ url });
  }
})


(function (ns) {
  let networkType = 'wifi';
  // 页面显示
  wx.getNetworkType({
    success(res) {
      // 返回网络类型, 有效值：
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      networkType = res.networkType
    }
  });


  wx.onNetworkStatusChange && wx.onNetworkStatusChange((res) => {
    networkType = res.networkType
  })

  ns.getNetWork = () => networkType
}(tea));

/**用户信息 */
(function (ns) {
  let userInfo = wx.getStorageSync('userInfo');
  let url = null;
  let notLogin = false;
  let userPromiseResolve = null;

  let userPromise = new Promise((resolve) => {
    userPromiseResolve = resolve;
  })

  const setUrl = (currentUrl) => {
    url = currentUrl;
  }

  ns.setNullUserPromise = () => {
    userPromise = new Promise((resolve) => {
      resolve(null);
    })
  }

  ns.setDataUserPromise = () => {
    userPromise = new Promise((resolve) => {
      userPromiseResolve = resolve;
    })
  }

  ns.getUserPromise = () => {
    if (userInfo) {
      if (!userInfo.NickName) {
        wx.fetch({
          url: `${wx.apis.userInfoDetail}?userId=${userInfo.UserId}`
        }).then((res) => {
          Object.assign(userInfo, res.data)

          ns.setUserInfo(userInfo);
          userPromiseResolve(userInfo);
        }, () => {
          userPromiseResolve(userInfo);
        })
      } else {
        userPromiseResolve(userInfo);
      }
    } else {
      setTimeout(() => {
        !userInfo && userPromiseResolve(null);
      }, 3000)
    }

    return userPromise;
  }

  ns.getUserIdPromise = () => ns.getUserPromise().then(userInfo => (userInfo ? userInfo.UserId : ''))

  ns.gotoPageBack = () => {
    if (notLogin) {
      notLogin = false;

      ns.safeBack();
    } else {
      ns.gotoPageWithUser();
    }
  }

  ns.setNotLogin = (flag) => {
    notLogin = flag;
  }

  ns.getNotLogin = flag => notLogin

  ns.setUserInfo = (item) => {
    if (item !== undefined) {
      userInfo = item;
      userPromiseResolve(item);
      wx.setStorageSync('userInfo', userInfo)
    }
  }

  ns.getUserInfo = () => userInfo;

  ns.getUserId = () => {
    const info = ns.getUserInfo();

    return info ? info.UserId : '';
  }

  ns.safeBack = () => {
    const pageUrl = ns.getPageUrl();
    if (pageUrl.indexOf('pages/index/index') > -1) {
      return;
    }

    if (pageUrl.indexOf('pages/dongtai/dongtai') > -1 ||
     pageUrl.indexOf('pages/zixuan/my') > -1 ||
     pageUrl.indexOf('pages/hangqing/hangqing') > -1 ) {

      wx.switchTab({
        url: '/pages/index/index'
      })
    } else {
      wx.navigateTo({
        url: '/pages/index/index'
      })
    }
  };

  ns.gobackHome = () => {
    const info = ns.getUserInfo();
    if (!info) {
      ns.safeBack()
    }
  }

  ns.getPageUrl = (opt = {}) => {
    const args = [];
    const pages = getCurrentPages();
    if (pages.length === 0) return '';
    const currentPage = pages[pages.length - 1];

    let currentUrl = opt.url;

    for (const key in currentPage.options) {
      args.push(`${key}=${currentPage.options[key]}`);
    }

    for (const key in opt.args) {
      args.push(`${key}=${opt.args[key]}`);
    }

    if (!currentUrl) {
      currentUrl = `/${currentPage.__route__}`;
    }

    if (args.length > 0) {
      if (currentUrl.indexOf('?') > -1) {
        currentUrl += `&${args.join('&')}`;
      } else {
        currentUrl += `?${args.join('&')}`;
      }
    }

    return currentUrl;
  }

  ns.gotoPageAfterUser = () => safeRedirect(url)
}(tea));

module.exports = wx.tea = tea;
