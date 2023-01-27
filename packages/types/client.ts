// 链接配置

import type { BaseOptionsFieldsType } from './options'

export interface BaseClientType<
  O extends BaseOptionsFieldsType = BaseOptionsFieldsType
> {
  sdkName: string
  sdkVersion: string
  options: O
  getOptions: () => O
}
