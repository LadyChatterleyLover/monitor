// 基础配置
import type { App } from 'vue'

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
  // vue实例
  vue?: App
}
