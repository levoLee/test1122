/**
 * 实现代理/拦截 微信小程序自带方法
 */
const Util = require('./util.js')

//所有页面 obj数据
const $pages = {}

const defaultConfig = {
  autoDeletePrefetch: true, //是否要自动删除[$prefetch]数据
  prefetchKeys: ['$prefetch'], //默认key：$prefetch
  lastRouteFail: false //上一次路由跳转是否失败
}

const proxyRoute = (obj) => {
  const path = obj.url
  const fail = obj.fail || (() => {});
  if (typeof path === 'string') {
    const { url: pathUrl, params } = Util.formatPath(path)
    const url = pathResolve(getCurrentPage(), pathUrl)

    const targetPageOpt = $pages[url]
    if (!targetPageOpt) return

    const onPrefetch = targetPageOpt.onPrefetch
    const config = targetPageOpt.config || {}

    //has onPrefetch && 上一次跳转没有失败
    if (typeof onPrefetch === 'function' && !config.lastRouteFail) {
      //自动删除 $prefetch 之前预加载数据
      if (config.autoDeletePrefetch) {
        (config.prefetchKeys || []).forEach((key) => {
          delete targetPageOpt[key];
        })
      }

      obj.fail = function () {
        config.lastRouteFail = true
        fail()
      }

      onPrefetch.call(targetPageOpt, { params })
    }
    //设置上一次跳转成功
    config.lastRouteFail = false
  }
}

const proxyWxApi = {
  navigateTo(obj) {
    proxyRoute(obj)
  },
  redirectTo(obj) {
    proxyRoute(obj)
  },
  switchTab(obj) {
    proxyRoute(obj)
  },
  reLaunch(obj) {
    proxyRoute(obj)
  }
}


/**
 * [pathResolve description]
 * @param  {[string]} url [description]
 * ['../che/chex','../abc','./index']
 * @return {[strng]}      [description]
 * 'pages/che/che'
 */
function pathResolve(route, url) {
  if (!url) {
    return route;
  }
  if (url[0] === '/') { // /index
    url = url.substr(1);
    return pathResolve('', url);
  }
  if (url[0] !== '.') { // index
    return pathResolve(route, `./${url}`);
  }
  let current = route.split('/');
  if (url[0] === '.' && url[1] === '/') { // ./index
    url = url.substr(2);
    if (url[0] !== '.') {
      if (current.length) { current[current.length - 1] = url; } else { current = [url]; }
      return current.length === 1 ? (current[0]) : current.join('/');
    }
    return pathResolve(current.join('/'), url);
  }
  if (url[0] === '.' && url[1] === '.' && url[2] === '/') { // ../index || ....../index || ../../../index
    url = url.replace(/^\.*/ig, '');
    current.pop();
    return pathResolve(current.join('/'), `.${url}`);
  }
  if (url[0] === '.') {
    return pathResolve(route, url.substr(1));
  }
}

//获取当前页面
function getCurrentPage() {
  const currentPages = getCurrentPages()
  if (currentPages.length === 0) return {}
  return currentPages[currentPages.length - 1].__route__
}

exports.Init = function () {
  Object.keys(proxyWxApi)
    .filter(key => key.indexOf('$') === -1 || key.indexOf('_') === -1)
    .forEach((key) => {
      const oldFunc = wx[key]

      Object.defineProperty(wx, key, {
        get() {
          return function (...args) {
            try {
              proxyWxApi[key].apply(this, args)
            } catch (e) {
              console.error('[proxy-wx]:proxyWxApi[key] error', e)
            }

            oldFunc.apply(this, args)
          }
        }
      })
    })
}

exports.InitPage = function (opts, path) {
  if (typeof path === 'undefined') {
    console.error('[proxy-wx] InitPage path undefined')
  }

  //页面配置
  opts.config = Object.assign({}, defaultConfig, opts.config || {});

  PageExtend(opts)

  return ($pages[path] = opts)
}
