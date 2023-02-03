// 长任务
import { EventTypes, StatusCode } from '@dd-monitor/types'
import { getTimestamp } from '@dd-monitor/utils'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const longTaskPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Performance,
  on(notify) {
    const observer = new PerformanceObserver((list) => {
      for (const long of list.getEntries()) {
        notify(EventTypes.Performance, {
          type: EventTypes.Performance,
          name: 'long_task',
          longTask: long,
          time: getTimestamp(),
          status: StatusCode.Ok,
        })
      }
    })
    observer.observe({ entryTypes: ['longtask'] })
  },
  transform(collectedData) {
    return collectedData
  },
  emit(transformedData) {
    return this.transport.send(transformedData)
  },
}

export default longTaskPlugin
