import { EventTypes, StatusCode } from '@dd-monitor/types'
import {
  _global,
  getTimestamp,
  onEvent,
  unknownToString,
} from '@dd-monitor/utils'
import ErrorStackParser from 'error-stack-parser'
import { breadcrumb } from '@dd-monitor/core'
import { recordData } from './record'
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
    breadcrumb.push({
      type: EventTypes.Unhandledrejection,
      category: breadcrumb.getCategory(EventTypes.Unhandledrejection),
      data: Object.assign({}, data),
      time: getTimestamp(),
      status: StatusCode.Error,
    })
    return data
  },
  emit(transformedData) {
    this.transport.send(transformedData, breadcrumb.getStack())
    recordData(this.transport, this.options)
  },
}

export default unhandlerejectionPlugin
