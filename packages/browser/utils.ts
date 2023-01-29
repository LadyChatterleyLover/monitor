import { fromHttpStatus } from '@dd-monitor/utils'

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
