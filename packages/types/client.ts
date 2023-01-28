// 链接配置

import type { EventTypes } from './event'
import type { BaseOptionsFieldsType } from './options'

export interface BaseClientType<
  O extends BaseOptionsFieldsType = BaseOptionsFieldsType
> {
  sdkName: string
  sdkVersion: string
  options: O
  getOptions: () => O
}

export interface LogType {
  message: string
  error: any
  type: EventTypes
}
