import { _support, generateUUID, getTimestamp } from '@dd-monitor/utils'
import { record } from 'rrweb'
import { EventTypes, StatusCode } from '@dd-monitor/types'
import pako from 'pako'
import { Base64 } from 'js-base64'
import type { BrowserOptionsFieldsTypes } from '../types'
import type { BrowserTransport } from '../transport'

// 压缩
export function zip(data) {
  if (!data) return data
  // 判断数据是否需要转为JSON
  const dataJson =
    typeof data !== 'string' && typeof data !== 'number'
      ? JSON.stringify(data)
      : data
  const str = Base64.encode(dataJson as string)
  const binaryString = pako.gzip(str)
  const arr = Array.from(binaryString)
  let s = ''
  arr.forEach((item) => {
    s += String.fromCharCode(item as number)
  })
  return Base64.btoa(s)
}

export function recordData(
  transport: BrowserTransport,
  options: BrowserOptionsFieldsTypes
) {
  console.log('recordData')
  let events = []
  record({
    emit(event, isCheckout) {
      if (isCheckout) {
        // 此段时间内发生错误，上报录屏信息
        if (_support.hasError) {
          const recordScreenId = _support.recordScreenId
          // _support.recordScreenId = generateUUID()
          transport.send({
            type: EventTypes.RecordScreen,
            recordScreenId,
            time: getTimestamp(),
            status: StatusCode.Ok,
            events: zip(events),
          })
          events = []
          _support.hasError = false
        } else {
          // 不上报，清空录屏
          events = []
          _support.recordScreenId = generateUUID()
        }
      }
      events.push(event)
    },
    recordCanvas: true,
    // 默认每10s重新制作快照
    checkoutEveryNms: 1000 * options.recordScreentime,
  })
}
