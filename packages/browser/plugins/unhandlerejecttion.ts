import { EventTypes, StatusCode } from '@dd-monitor/types'
import {
  _global,
  _support,
  getTimestamp,
  onEvent,
  unknownToString,
} from '@dd-monitor/utils'
import ErrorStackParser from 'error-stack-parser'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserClient } from '../client'

const unhandlerejectionPlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Unhandledrejection,
  on(notify) {
    onEvent(
      _global,
      'unhandledrejection',
      (e) => {
        notify(EventTypes.Unhandledrejection, e)
      },
      true
    )
  },
  transform(ev) {
    const stackFrame = ErrorStackParser.parse(ev.reason)[0]
    const { fileName, columnNumber, lineNumber } = stackFrame
    const data = {
      type: EventTypes.Unhandledrejection,
      status: StatusCode.Error,
      time: getTimestamp(),
      message: unknownToString(ev.reason.message || ev.reason.stack),
      fileName,
      line: lineNumber,
      column: columnNumber,
    }
    _support.breadcrumb.push({
      type: EventTypes.Unhandledrejection,
      category: _support.breadcrumb.getCategory(EventTypes.Unhandledrejection),
      data: Object.assign({}, data),
      time: getTimestamp(),
      status: StatusCode.Error,
    })
    return data
  },
  emit(transformedData) {
    return this.transport.send(transformedData, _support.breadcrumb.getStack())
  },
}

export default unhandlerejectionPlugin
