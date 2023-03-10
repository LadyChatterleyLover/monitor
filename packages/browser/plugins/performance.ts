import { EventTypes, StatusCode } from '@dd-monitor/types'
import { getTimestamp } from '@dd-monitor/utils'
import { getWebVitals } from '../utils'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const performancePlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Performance,
  on(notify) {
    // 获取FCP、LCP、TTFB、FID等指标
    getWebVitals((res) => {
      // name指标名称、rating 评级、value数值
      const { name, rating, value } = res
      notify(EventTypes.Performance, {
        type: EventTypes.Performance,
        status: StatusCode.Ok,
        time: getTimestamp(),
        name,
        rating,
        value,
      })
    })
  },
  transform(collectedData) {
    return collectedData
  },
  emit(transformedData) {
    return this.transport.send(transformedData)
  },
}

export default performancePlugin
