// 上报数据
import type { BreadcrumbData } from './breadcrumbs'
import type { EventTypes, StatusCode } from './event'
export interface TransportData {
  // app唯一key
  appKey: string
  // 错误列
  column?: number
  // 错误行
  line?: number
  // 当前日期
  date: string
  // 用户设备信息
  deviceInfo: {
    browser_version: string
    browser: string
    os_version: string
    os: string
    ua: string
    device: string
    device_type: string
  }
  // 报错文件名
  fileName?: string
  // 报错信息
  message: string
  // 报错页面地址
  pageUrl?: string
  // 录屏id
  recordScreenId?: string
  // sdk名字
  sdkName: string
  // sdk版本
  sdkVersion: string
  // 状态
  status: StatusCode
  // 当前时间戳
  time: number
  // 报错类型
  type: EventTypes
  // uuid
  uuid: string
  // 用户行为
  breadcrumb?: BreadcrumbData[]
}
