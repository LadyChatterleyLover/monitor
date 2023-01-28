import { breadcrumb } from '@dd-monitor/core'
import { EventTypes, StatusCode } from '@dd-monitor/types'
import {
  _global,
  getTimestamp,
  htmlElementAsString,
  onEvent,
} from '@dd-monitor/utils'
import { recordData } from './record'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const domPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Dom,
  on(notify) {
    if (!('document' in _global)) return
    onEvent(
      _global.document,
      'click',
      () => {
        notify(EventTypes.Dom, {
          category: 'click',
          data: _global.document,
        })
      },
      true
    )
  },
  transform(collectedData) {
    const htmlString = htmlElementAsString(
      collectedData.data.activeElement as HTMLElement
    )
    return htmlString
  },
  emit(transformedData) {
    breadcrumb.push({
      type: EventTypes.Click,
      category: breadcrumb.getCategory(EventTypes.Click),
      data: transformedData,
      time: getTimestamp(),
      status: StatusCode.Ok,
    })
  },
}

export default domPlugin
