import { EventTypes, HttpCode, StatusCode } from '@dd-monitor/types'
import {
  _global,
  _support,
  getTimestamp,
  onEvent,
  replaceOld,
  variableTypeDetection,
} from '@dd-monitor/utils'
import { httpTransform } from '../utils'
import type { MONITORXMLHttpRequest } from '../../types/http'
import type { HttpMethod } from './../../types/options'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const xhrPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Xhr,
  on(notify) {
    monitorXhr.call(this, notify)
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
    _support.breadcrumb.push({
      type: EventTypes.Xhr,
      category: _support.breadcrumb.getCategory(EventTypes.Xhr),
      data: Object.assign({}, transformedData),
      status: transformedData.isError ? StatusCode.Error : StatusCode.Ok,
      time: transformedData.time,
    })
    if (transformedData.isError) {
      return this.transport.send(
        transformedData,
        _support.breadcrumb.getStack()
      )
    }
  },
}

function monitorXhr(
  this: BrowserClient,
  notify: (eventName: EventTypes, data: any) => void
) {
  const { options, transport } = this
  if (!('XMLHttpRequest' in _global)) {
    return
  }
  const originalXhrProto = XMLHttpRequest.prototype
  replaceOld(originalXhrProto, 'open', (originalOpen: () => void) => {
    return function (...args: any[]) {
      const method = variableTypeDetection.isString(args[0])
        ? args[0].toUpperCase()
        : args[0]
      this.handlerData = {
        type: EventTypes.Xhr,
        time: getTimestamp(),
        url: args[1],
        method,
      }
      originalOpen.apply(this, args)
    }
  })
  replaceOld(originalXhrProto, 'send', (originalSend: () => void) => {
    return function (...args: any[]): void {
      const { method, url } = this.handlerData
      options.beforeAppAjaxSend &&
        options.beforeAppAjaxSend(
          { method: method as HttpMethod, url },
          this as any
        )
      onEvent(this, 'loadend', function (this: MONITORXMLHttpRequest) {
        const isBlock = transport.isSelfDsn(url)
        if (isBlock) return
        const { responseType, response, status } = this
        const eTime = getTimestamp()
        if (['', 'json', 'text'].includes(responseType)) {
          this.handlerData.data =
            typeof response === 'object' ? JSON.stringify(response) : response
        }
        this.handlerData.status = status
        this.handlerData.elapsedTime = eTime - this.handlerData.time
        notify(EventTypes.Xhr, this.handlerData)
      })
      originalSend.apply(this, args)
    }
  })
}

export default xhrPlugin
