import { fromHttpStatus } from '@dd-monitor/utils'
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals'

// 处理接口的状态
export function httpTransform(data, options) {
  let message = ''
  const { elapsedTime, time, method, type, status } = data
  const name = `${type}--${method}`
  if (status === 0) {
    message =
      elapsedTime <= options.overTime * 1000
        ? 'http请求失败，失败原因：跨域限制或接口不存在'
        : 'http请求失败，失败原因：接口超时'
  } else {
    message = fromHttpStatus(status)
  }
  message = `${data.url}: ${message}`
  return {
    url: data.url,
    time,
    elapsedTime,
    message,
    name,
    type,
    request: {
      httpType: type,
      method,
      data: data.reqData || '',
    },
    response: {
      status,
    },
  }
}

const viewportWidth = window.innerWidth
const viewportHeight = window.innerHeight
// firstScreenPaint为首屏加载时间
let firstScreenPaint = 0
// 页面是否渲染完成
let isOnLoaded = false
let timer
let observer
let entries: any[] = []

function getRenderTime() {
  let startTime = 0
  entries.forEach((entry) => {
    if (entry.startTime > startTime) {
      startTime = entry.startTime
    }
  })
  // performance.timing.navigationStart 页面的起始时间
  return startTime - performance.timing.navigationStart
}

// 定时器循环监听dom的变化，当document.readyState === 'complete'时，停止监听
function checkDOMChange(callback) {
  cancelAnimationFrame(timer)
  timer = requestAnimationFrame(() => {
    if (document.readyState === 'complete') {
      isOnLoaded = true
    }
    if (isOnLoaded) {
      // 取消监听
      observer && observer.disconnect()
      // document.readyState === 'complete'时，计算首屏渲染时间
      firstScreenPaint = getRenderTime()
      entries = null
      callback && callback(firstScreenPaint)
    } else {
      checkDOMChange(callback)
    }
  })
}

// dom 对象是否在屏幕内
function isInScreen(dom) {
  const rectInfo = dom.getBoundingClientRect()
  if (rectInfo.left < viewportWidth && rectInfo.top < viewportHeight) {
    return true
  }
  return false
}

// 外部通过callback 拿到首屏加载时间
export function observeFirstScreenPaint(callback) {
  const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK']
  observer = new MutationObserver((mutationList) => {
    checkDOMChange(callback)
    const entry: any = { children: [] }
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length && isInScreen(mutation.target)) {
        Array.from(mutation.addedNodes).forEach((node) => {
          if (
            node.nodeType === 1 &&
            !ignoreDOMList.includes(node.nodeName) &&
            isInScreen(node)
          ) {
            entry.children.push(node)
          }
        })
      }
    }

    if (entry.children.length) {
      entries.push(entry)
      entry.startTime = Date.now()
    }
  })
  observer.observe(document, {
    childList: true, // 监听添加或删除子节点
    subtree: true, // 监听整个子树
    characterData: true, // 监听元素的文本是否变化
    attributes: true, // 监听元素的属性是否变化
  })
}

// 判断资料是否来自缓存
export function isCache(entry) {
  return (
    entry.transferSize === 0 ||
    (entry.transferSize !== 0 && entry.encodedBodySize === 0)
  )
}

export function getResource() {
  if (performance.getEntriesByType) {
    const entries = performance.getEntriesByType('resource')
    // 过滤掉非静态资源的 fetch、 xmlhttprequest、beacon
    let list: any[] = entries.filter((entry) => {
      return !['fetch', 'xmlhttprequest', 'beacon'].includes(
        entry.initiatorType
      )
    })

    if (list.length) {
      list = JSON.parse(JSON.stringify(list))
      list.forEach((entry) => {
        entry.isCache = isCache(entry)
      })
    }
    return list
  }
}

export function getWebVitals(callback) {
  onLCP((res) => {
    callback(res)
  })
  onFID((res) => {
    callback(res)
  })
  onCLS((res) => {
    callback(res)
  })
  onFCP((res) => {
    callback(res)
  })
  onTTFB((res) => {
    callback(res)
  })
  // 首屏加载时间
  observeFirstScreenPaint((res) => {
    const data = {
      name: 'FSP',
      value: res,
      rating: res > 2500 ? 'poor' : 'good',
    }
    callback(data)
  })
}
