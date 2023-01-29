import { EventTypes } from '@dd-monitor/types'
import {
  _global,
  _support,
  getLocationHref,
  replaceOld,
  supportsHistory,
} from '@dd-monitor/utils'
import { StatusCode } from '../../types/event'
import { getTimestamp } from '../../utils/helper'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const historyRoutePlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.History,
  on(notify) {
    let lastHref: string
    if (!supportsHistory()) return
    const oldOnpopstate = _global.onpopstate
    _global.onpopstate = function (...args: any[]) {
      const to = getLocationHref()
      const from = lastHref
      lastHref = to
      notify(EventTypes.History, {
        from,
        to,
      })
      oldOnpopstate && oldOnpopstate.apply(this, args)
    }
    function historyReplaceFn(originalHistoryFn) {
      return function (...args: any[]): void {
        const url = args.length > 2 ? args[2] : undefined
        if (url) {
          const from = lastHref
          const to = String(url)
          lastHref = to
          notify(EventTypes.History, {
            from,
            to,
          })
        }
        return originalHistoryFn.apply(this, args)
      }
    }
    // 以下两个事件是人为调用，但是不触发onpopstate
    replaceOld(_global.history, 'pushState', historyReplaceFn)
    replaceOld(_global.history, 'replaceState', historyReplaceFn)
  },
  transform(collectedData) {
    return collectedData
  },
  emit(transformedData) {
    _support.breadcrumb.push({
      category: _support.breadcrumb.getCategory(EventTypes.History),
      type: EventTypes.History,
      status: StatusCode.Ok,
      time: getTimestamp(),
      data: {
        from: transformedData.from,
        to: transformedData.to,
      },
    })
  },
}

export default historyRoutePlugin
