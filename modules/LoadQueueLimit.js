/**
 * [LoadQueueLimit 限制queue同时执行]
 * @param {Number} limit [description]
 */
function LoadQueueLimit(limit = 5) {
  const _queue = []

  return addQueue

  //添加队列
  function addQueue(funcOrPromise) {
    if (!funcOrPromise) throw new Error('funcOrPromise is undefined')

    return new wx.Promise((resolve, reject) => {
      _queue.push({ funcOrPromise, resolve, reject, isExcuted: false })
        //nextTick(excuteQueue)
      excuteQueue()
    })
  }

  //遍历queue执行
  function excuteQueue() {
    if (_queue.length > limit && _queue.filter(q => q.isExcuted).length >= 5) return

    _queue.filter(q => !q.isExcuted)
      .forEach((q) => {
        q.isExcuted = true
        const { funcOrPromise, resolve, reject } = q
        const doneTaskFunc = doneTask(resolve, q)
        const errorTaskFunc = doneTask(reject, q)

        convertToPromise(funcOrPromise)
          .then(doneTaskFunc, errorTaskFunc)
          .catch(errorTaskFunc)

        //防止异步超时占用队列 15s自动清除任务
        setTimeout(() => errorTaskFunc, 1000 * 15)
      })
  }

  //完成一个task时回调 (removeTask&excuteQueue)
  function doneTask(callback, q) {
    return function (...args) {
      try {
        removeTask(q) && excuteQueue()
      } catch (e) { console.error(e) }

      //是否已回调
      if (!q.isCallBack) {
        q.isCallBack = true
        callback(...args)
      }
    }
  }

  //删除queue里task
  function removeTask(q) {
    let hasRemoved = false

    _queue.forEach((_q, index) => {
      if (q === _q) {
        hasRemoved = true
        _queue.splice(index, 1)
      }
    })
    return hasRemoved
  }
}

function nextTick(cb) {
  if (requestIdleCallback) {
    return requestIdleCallback(cb)
  }

  return setTimeout(cb, 16.7)
}

function convertToPromise(funcOrPromise) {
  if (typeof funcOrPromise === 'function' && typeof funcOrPromise.then !== 'function') return wx.Promise.resolve(funcOrPromise())
  return funcOrPromise
}

module.exports = LoadQueueLimit
