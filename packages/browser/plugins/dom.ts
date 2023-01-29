import { EventTypes, StatusCode } from '@dd-monitor/types'
import {
  _global,
  _support,
  getTimestamp,
  htmlElementAsString,
  onEvent,
} from '@dd-monitor/utils'
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
    _support.breadcrumb.push({
      type: EventTypes.Click,
      category: _support.breadcrumb.getCategory(EventTypes.Click),
      data: transformedData,
      time: getTimestamp(),
      status: StatusCode.Ok,
    })
  },
}

export default domPlugin
