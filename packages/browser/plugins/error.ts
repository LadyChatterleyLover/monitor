import { EventTypes, StatusCode } from '@dd-monitor/types'
import {
  _global,
  _support,
  getTimestamp,
  interceptStr,
  onEvent,
} from '@dd-monitor/utils'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const resourceMap = {
  img: '图片',
  script: 'js脚本',
}

export interface ResourceErrorTarget {
  src?: string
  href?: string
  localName?: string
}

export function resourceTransform(target) {
  return {
    time: getTimestamp(),
    message: `${
      interceptStr(target.src, 120) || interceptStr(target.href, 120)
    }; 资源加载失败`,
    name: `${resourceMap[target.localName] || target.localName}`,
  }
}

const errorPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Error,
  on(emit) {
    onEvent(
      _global,
      'error',
      (e) => {
        if (_global.__VUE__) {
          const Vue = this.options.vue
          const handler = Vue.config.errorHandler
          Vue.config.errorHandler = function (err, vm, info) {
            console.log('err', err)
            emit(EventTypes.Error, err)
            if (handler) Reflect.apply(handler, null, [err, vm, info])
          }
        }
        emit(EventTypes.Error, e)
      },
      true
    )
  },
  transform(ev: ErrorEvent) {
    const target = ev.target as ResourceErrorTarget
    if (!target) {
      // vue和react捕获的报错使用ev解析，异步错误使用ev.Error解析
      const errorData = {
        type: EventTypes.Error,
        status: StatusCode.Error,
        time: getTimestamp(),
        message: ev.message,
        fileName: ev.filename,
        line: ev.lineno,
        column: ev.colno,
      }
      _support.breadcrumb.push({
        type: EventTypes.Error,
        category: _support.breadcrumb.getCategory(EventTypes.Error),
        data: errorData,
        time: getTimestamp(),
        status: StatusCode.Error,
      })
      return {
        ...errorData,
      }
    }

    // 资源加载报错
    if (target.localName) {
      // 提取资源加载的信息
      const data = resourceTransform(target)
      _support.breadcrumb.push({
        ...data,
        type: EventTypes.Resource,
        category: _support.breadcrumb.getCategory(EventTypes.Resource),
        status: StatusCode.Error,
        time: getTimestamp(),
      })
      return {
        ...data,
        type: EventTypes.Resource,
        status: StatusCode.Error,
      }
    }
  },
  emit(transformedData) {
    return this.transport.send(transformedData, _support.breadcrumb.getStack())
  },
}

export default errorPlugin
