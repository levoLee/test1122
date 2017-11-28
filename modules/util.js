/**
 * author: caozhongping
 * createTime: 2017-4-11
 * desc: 静态方法
 *
 * author: nick
 * fixTime:2017-4-17
 * desc: 倒计时方法
 */
const Util = {
  //1. img1... === img2...
  //2. img2...@100... === img2...@400...
  
  isSameImage(img1 = '', img2 = '') {
    const replaceDomainReg = /img[0-9]*\.tuhu.(org|cn)/i
    const replaceAtReg = /@.+/
    const previewImageOrigin = img1.replace(replaceAtReg, '').replace(replaceDomainReg, '')
    const firstImageOrigin = img2.replace(replaceAtReg, '').replace(replaceDomainReg, '')
    return previewImageOrigin === firstImageOrigin
  },
  formatPath(path) {
    const [url, param] = path.split('?')
    const params = {}
    if (param) {
      param.split('&').forEach((kv) => {
        const [key, value] = kv.split('=')
        params[key] = value
      })
    }
    return { url, params }
  },
  format: (obj, fmt) => {
    const time = {
      'M+': obj.getMonth() + 1,
      'd+': obj.getDate(),
      'h+': obj.getHours(),
      'm+': obj.getMinutes(),
      's+': obj.getSeconds(),
      'q+': Math.floor((obj.getMonth() + 3) / 3),
      S: obj.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${obj.getFullYear()}`).substr(4 - RegExp.$1.length));
    Object.keys(time).forEach((key) => {
      if (new RegExp(`(${key})`).test(fmt)) {
        fmt = fmt.replace(RegExp.$1,
          (RegExp.$1.length === 1) ? (time[key]) : ((`00${time[key]}`).substr((`${time[key]}`).length)));
      }
    })
    return fmt;
  },
  addZero: num => (num < 10 ? `0${num}` : num),
  showDate: (time, isShort) => {
    const now = time ? new Date(time - 0) : new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const result = [`${year}-${Util.addZero(month)}-${Util.addZero(day)}`];

    if (!isShort) {
      const hh = now.getHours();
      const mm = now.getMinutes();
      const ss = now.getSeconds();

      result.push(`${Util.addZero(hh)}:${Util.addZero(mm)}:${Util.addZero(ss)}`)
    }

    return result.join(' ')
  },
  formatPrice: price => (parseFloat(price)).toFixed(2),
  showError: (obj, message) => {
    if (wx.errTimeout) {
      clearTimeout(wx.errTimeout);
      wx.errTimeout = null;
    }

    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })

    animation.left(0).opacity(1).step();

    obj.setData({
      error: {
        errorMessage: message,
        animation: animation.export()
      }
    });

    wx.errTimeout = setTimeout(() => {
      obj.setData({
        error: {
          errorMessage: '',
          end: true
        }
      });
    }, 1300)
  },
  showTipBox: (obj, message) => {
    if (wx.errTimeout) {
      clearTimeout(wx.errTimeout);
      wx.errTimeout = null;
    }

    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })

    animation.left(0).opacity(1).step();

    obj.setData({
      tipMsg: {
        tipMessage: message,
        animation: animation.export()
      }
    });

    wx.errTimeout = setTimeout(() => {
      obj.setData({
        tipMsg: {
          tipMessage: '',
          end: true
        }
      });
    }, 1300);
  },
  countDown: (el) => {
    let Second = Number(el.Second)
    let Minute = Number(el.Minute)
    let Hour = Number(el.Hour);

    Second -= 1

    if (Second < 0) {
      Minute -= 1;
      Second = 59;
      if (Minute < 0) {
        Hour -= 1
        Minute = 59;
        if (Hour < 0) {
          Hour = 0;
          Minute = 0;
          Second = 0;
        }
      }
    }

    el.Second = (Array(2).join(0) + Second).slice(-2);
    el.Minute = (Array(2).join(0) + Minute).slice(-2);
    el.Hour = (Array(2).join(0) + Hour).slice(-2);

    return el
  },
  countDown2: (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate.replace(/-/g, '/')).getTime();
    const leftsecond = parseInt((end - now) / 1000, 10);
    const el = { hour: '00', minute: '00', second: '00' };
    if((end - now) > 0){
      const day = Math.floor(leftsecond / (60 * 60 * 24));
      const h = Math.floor((leftsecond - (day * 24 * 60 * 60)) / 3600);
      const m = Math.floor((leftsecond - (day * 24 * 60 * 60) - (h * 3600)) / 60);
      const s = Math.floor(leftsecond - (day * 24 * 60 * 60) - (h * 3600) - (m * 60));
     
      el.day = el.day < 10 ? (`0${day}`) : day;
      el.hour = h < 10 ? (`0${h}`) : h;
      el.minute = m < 10 ? (`0${m}`) : m;
      el.second = s < 10 ? (`0${s}`) : s;
     

    }else{
      el.day = 0;
      el.hour = 0;
      el.minute = 0;
      el.second = 0;
    }
    
    return el
    
  },
  nextTick,
  diffObject
}

//比较两个对象是否属性值一样
function diffObject(oldObject, newObject) {
  const toString = Object.prototype.toString
  const oldType = toString.call(oldObject)
  const newType = toString.call(newObject)
  if (oldType !== newType) return;
  if (oldType === '[object Array]') {
    if (oldObject.length !== newObject.length) return;
    const equalLen = oldObject.map((obj, index) => diffObject(obj, newObject[index])).filter(isEqual => isEqual).length;
    return equalLen === oldObject.length
  }
  if (oldType === '[object Object]') {
    const oldKeys = Object.keys(oldObject)
    const newKeys = Object.keys(newObject)
    if (oldKeys.length !== newKeys.length) return;
    const equalLen = oldKeys.map(key => diffObject(oldObject[key], newObject[key])).filter(isEqual => isEqual).length;
    return equalLen === oldKeys.length
  }
  return oldObject === newObject
}

//模拟node nextTick
function nextTick(cb = () => {}) {
  const timerFunc = setTimeout;
  let queue = []
  let pending = false

  function callbacks() {
    pending = false
    const copyQueue = queue.slice(0)
    queue = []
    copyQueue.forEach((fn) => {
      if (!fn) return;
      fn()
    });
    cb();
  }

  return (fn) => {
    queue.push(fn);
    if (pending) return
    pending = true
    timerFunc(callbacks, 50)
  }
}

module.exports = Util
