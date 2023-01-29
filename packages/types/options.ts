// 基础配置
import type { TransportData } from './transport'
import type { App } from 'vue'
import type { BreadcrumbData } from './breadcrumbs'
import type { Breadcrumb } from '@dd-monitor/core/breadcrumb'

type CANCEL = null | undefined | boolean

type TSetRequestHeader = (key: string, value: string) => object

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

interface IRequestHeaderConfig {
  url: string
  method: HttpMethod
}

export interface BaseOptionsType<O extends BaseOptionsFieldsIntegrationType>
  extends BaseOptionsFieldsIntegrationType {
  bindOptions(options: O): void
}

export type BaseOptionsFieldsIntegrationType = BaseOptionsFieldsType &
  BaseOptionsHooksType

export interface BaseOptionsFieldsType {
  // 上报地址
  dsn: string
  // app唯一的key
  appKey: string
  // 是否禁用
  disabled?: boolean
  // debug模式
  debug?: boolean
  // 不需要监控的请求url
  filterXhrUrlRegExp?: RegExp
  // 用户行为最大上报数 默认为20
  maxBreadcrumbs?: number
  // 节流函数延迟时间
  throttleDelayTime?: number
  // 最大上报数 默认为2
  maxDuplicateCount?: number
  // 录屏时间
  recordScreentime?: number
  // vue实例
  vue?: App
}

export interface BaseOptionsHooksType {
  /**
   * 钩子函数:在每次发送事件前会调用
   *
   * @param {TransportDataType} event 上报的数据格式
   * @return {*}  {(Promise<TransportDataType | null | CANCEL> | TransportDataType | any | CANCEL | null)} 如果返回 null | undefined | boolean 时，将忽略本次上传
   * @memberof BaseOptionsHooksType
   */
  beforeDataReport?(
    event: TransportData
  ):
    | Promise<TransportData | null | CANCEL>
    | TransportData
    | any
    | CANCEL
    | null
  /**
   *
   * 钩子函数，每次发送前都会调用
   * @param {TransportData} event 上报的数据格式
   * @param {string} url 上报到服务端的地址
   * @return {*}  {string} 返回空时不上报
   * @memberof BaseOptionsHooksType
   */
  configReportUrl?(event: TransportData, url: string): string
  /**
   * 钩子函数:在每次添加用户行为事件前都会调用
   *
   * @param {Breadcrumb} breadcrumb Breadcrumb的实例
   * @param {BreadcrumbPushData} hint 单次推入用户行为栈的数据
   * @return {*}  {(BreadcrumbPushData | CANCEL)} 如果返回 null | undefined | boolean 时，将忽略本次的push
   * @memberof BaseOptionsHooksType
   */
  beforePushBreadcrumb?(
    breadcrumb: Breadcrumb,
    hint: BreadcrumbData
  ): BreadcrumbData | CANCEL
  /**
   * 钩子函数:拦截用户页面的ajax请求，并在ajax请求发送前执行该hook，可以对用户发送的ajax请求做xhr.setRequestHeader
   *
   * @param {IRequestHeaderConfig} config 原本的请求头信息
   * @param {IBeforeAppAjaxSendConfig} setRequestHeader 设置请求头函数
   * @memberof BaseOptionsHooksType
   */
  beforeAppAjaxSend?(
    config: IRequestHeaderConfig,
    setRequestHeader: Headers
  ): void
  /**
   *钩子函数:在beforeDataReport后面调用，在整合上报数据和本身SDK信息数据前调用，当前函数执行完后立即将数据错误信息上报至服务端
   *trackerId表示用户唯一键（可以理解成userId），需要trackerId的意义可以区分每个错误影响的用户数量
   *
   * @return {*}  {(string | number)}
   * @memberof BaseOptionsHooksType
   */
  backTrackerId?(): string | number
}
