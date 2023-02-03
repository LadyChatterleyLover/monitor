// 长任务
import { EventTypes, StatusCode } from '@dd-monitor/types'
import { _global, getTimestamp, onEvent } from '@dd-monitor/utils'
import { getResource } from '../utils'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const loadEventPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Performance,
  on(notify) {
    onEvent(_global, 'load', () => {
      notify(EventTypes.Performance, {
        type: EventTypes.Performance,
        name: 'resource_list',
        time: getTimestamp(),
        status: StatusCode.Ok,
        resourceList: getResource(),
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

export default loadEventPlugin
