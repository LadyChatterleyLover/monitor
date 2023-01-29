import type {
  BaseOptionsFieldsIntegrationType,
  BaseOptionsHooksType,
} from '@dd-monitor/types'
export interface BrowserOptionsFieldsTypes
  extends BrowserOptions,
    BrowserOptionsHooksType,
    BaseOptionsFieldsIntegrationType,
    BaseOptionsHooksType {
  // 是否使用image方式上报
  useImgUpload?: boolean
}

export interface BrowserOptions {
  xhr?: boolean
  fetch?: boolean
  console?: boolean
  dom?: boolean
  history?: boolean
  hash?: boolean
  unhandledrejection?: boolean
  recordScreen?: boolean
  whiteScreen?: boolean
  error?: boolean
  recordScreenTypeList?: string[]
  recordScreentime?: number
}

export interface BrowserOptionsHooksType {
  /**
   * 钩子函数，配置发送到服务端的xhr
   * 可以对当前xhr实例做一些配置：xhr.setRequestHeader()、xhr.withCredentials
   *
   * @param {XMLHttpRequest} xhr XMLHttpRequest的实例
   * @param {*} reportData 上报的数据
   * @memberof BrowserOptionsHooksType
   */
  configReportXhr?(xhr: XMLHttpRequest, reportData: any): void
}
