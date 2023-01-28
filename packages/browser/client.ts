import { BaseClient } from '@dd-monitor/core'
import {
  firstStrtoLowerCase,
  getTimestamp,
  isError,
  unknownToString,
} from '@dd-monitor/utils'
import ErrorStackParser from 'error-stack-parser'
import { EventTypes, StatusCode } from '@dd-monitor/types'
import { BrowserOptions } from './options'
import { BrowserTransport } from './transport'
import type { LogType } from '@dd-monitor/types'
import type { Breadcrumb } from '@dd-monitor/core'
import type { BrowserOptionsFieldsTypes } from './types'

export class BrowserClient extends BaseClient<
  BrowserOptionsFieldsTypes,
  EventTypes
> {
  transport: BrowserTransport
  breadcrumb: Breadcrumb<BrowserOptionsFieldsTypes>
  constructor(options: BrowserOptionsFieldsTypes) {
    super(options)
    this.options = new BrowserOptions(options)
    this.transport = new BrowserTransport(options)
  }
  isPluginEnable(name: EventTypes): boolean {
    const field = firstStrtoLowerCase(name)
    return this.options[field]
  }
  log(data: LogType): void {
    const { message, error, type = EventTypes.Custom } = data
    let errorInfo = {}
    if (isError(error)) {
      const result = ErrorStackParser.parse(
        !error.target ? error : error.error || error.reason
      )[0]
      errorInfo = {
        ...result,
        line: result.lineNumber,
        column: result.columnNumber,
      }
    }
    const sendData = Object.assign(
      {
        type,
        status: StatusCode.Error,
        message: unknownToString(message),
        time: getTimestamp(),
      },
      errorInfo
    )
    this.breadcrumb.push({
      type,
      category: this.breadcrumb.getCategory(EventTypes.Custom),
      message: unknownToString(message),
      time: getTimestamp(),
    })
    this.transport.send(sendData)
  }
}
