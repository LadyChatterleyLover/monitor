import { breadcrumb } from '@dd-monitor/core'
import { EventTypes, HttpType, StatusCode } from '@dd-monitor/types'
import { _global, getTimestamp, replaceOld } from '@dd-monitor/utils'
import { httpTransform } from '../utils'
import { HttpCode } from './../../types/event'
import type { HttpMethod } from './../../types/options'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const fetchPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Fetch,
  on(notify) {
    monitorFetch.call(this, notify)
  },
  transform(collectedData) {
    const isError =
      collectedData.status === 0 ||
      collectedData.status === HttpCode.BadRequest ||
      collectedData.status > HttpCode.Unauthorized
    const result: any = httpTransform(collectedData, this.options)
    result.isError = isError
    return result
  },
  emit(transformedData) {
    breadcrumb.push({
      type: EventTypes.Fetch,
      category: breadcrumb.getCategory(EventTypes.Fetch),
      data: Object.assign({}, transformedData),
      status: transformedData.isError ? StatusCode.Error : StatusCode.Ok,
      time: transformedData.time,
    })
    if (transformedData.isError) {
      return this.transport.send(transformedData, breadcrumb.getStack())
    }
  },
}

function monitorFetch(
  this: BrowserClient,
  notify: (eventName: EventTypes, data: any) => void
) {
  const { options, transport } = this
  if (!('fetch' in _global)) {
    return
  }
  replaceOld(_global, EventTypes.Fetch, (originalFetch: () => void) => {
    return function (url: string, config: Partial<Request> = {}): void {
      const sTime = getTimestamp()
      const method: HttpMethod =
        (config && (config.method as HttpMethod)) || 'GET'
      let handlerData: any = {
        type: HttpType.Fetch,
        method,
        reqData: config && config.body,
        url,
      }
      const headers = new Headers(config.headers || {})
      Object.assign(headers, {
        setRequestHeader: headers.set,
      })
      options.beforeAppAjaxSend &&
        options.beforeAppAjaxSend({ url, method }, headers)
      config = {
        ...config,
        headers,
      }
      const isBlock = transport.isSelfDsn(url)
      return originalFetch.apply(_global, [url, config]).then(
        (res: Response) => {
          const resClone = res.clone()
          const eTime = getTimestamp()
          handlerData = Object.assign(Object.assign({}, handlerData), {
            elapsedTime: eTime - sTime,
            status: resClone.status,
            time: sTime,
          })
          resClone.text().then(() => {
            if (isBlock) return
            notify(EventTypes.Fetch, handlerData)
          })
          return res
        },
        (err: Error) => {
          const eTime = getTimestamp()
          handlerData = Object.assign(Object.assign({}, handlerData), {
            elapsedTime: eTime - sTime,
            status: 0,
            time: sTime,
          })
          notify(EventTypes.Fetch, handlerData)
          throw err
        }
      )
    }
  })
}

export default fetchPlugin
