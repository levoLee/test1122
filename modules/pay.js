const app = getApp();

class Pay {
  wxPay(orderId, userId, type, autoJump) {
    return new wx.Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this._wxPay(orderId, userId, type, autoJump))
      }, 500)
    })
  }

  _wxPay(orderId, userId, type, autoJump) {
    const UserId = wx.tuhu.getUserId();
    return wx.fetch({
      url: wx.apis.FetchOrderDetialVersion,
      data: {
        userId: UserId,
        orderNo: orderId
      }
    }).then((res) => {
      if (res.data.Code - 0 !== 1) return
      const orderDetail = res.data.OrderDetial;
      if (orderDetail && orderDetail.SumMoney - 0 === 0) {
        wx.redirectTo({
          url: `../wait/orderDetail?orderNo=${orderId}`
        })
      } else {
        this.autoJump = autoJump
        return new wx.Promise((resolve, reject) => {
          wx.login({
            success(res) {
              const code = res.code;

              setTimeout(() => {
                let paySuccess = false
                wx.fetch({
                  url: wx.apis.wxPay,
                  method: 'POST',
                  data: {
                    orderId,
                    userId,
                    code
                  }
                }).then((res) => {
                  const payData = JSON.parse(res.data.requestPayment);
                  wx.requestPayment({
                    timeStamp: payData.timeStamp,
                    nonceStr: payData.nonceStr,
                    package: payData.package,
                    signType: payData.signType,
                    paySign: payData.paySign,
                    success(res) {
                      paySuccess = true
                      resolve(true)
                    },
                    fail(res) {
                      if (autoJump) {
                        wx.redirectTo({
                          url: `../wait/orderDetail?orderNo=${orderId}`
                        })
                      }
                    },
                    complete() {
                      app.globalData.orderLoaded = false;
                      if (wx.pageOrder) {
                        wx.pageOrder.loadPage = null;
                      }

                      if (paySuccess && autoJump) {
                        const hasType = type ? (`&type=${type}`) : '';
                        wx.redirectTo({
                          url: `../order/success?paysuccess=1&OrderID=${orderId}${hasType}`
                        })
                      }
                      resolve(false)
                    }
                  })
                })
              }, 500)
            }
          })
        })
      }
    })
  }
}

Pay.wxPay = (orderId, userId, type, autoJump = true) => {
  const instance = new Pay();
  return instance.wxPay(orderId, userId, type, autoJump);
}

module.exports = Pay
