import { EventTypes } from '@dd-monitor/types'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const performancePlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Performance,
  on(notify) {
    //
  },
}

export default performancePlugin
