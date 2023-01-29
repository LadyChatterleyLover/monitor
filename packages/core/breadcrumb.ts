import { EventTypes } from '@dd-monitor/types'
import { _support, getTimestamp, validateOption } from '../utils'
import { BreadcrumbTypes } from './../types/event'
export class Breadcrumb {
  public maxBreadcrumbs: number
  public beforePushBreadcrumb: unknown
  public stack: any[]
  constructor() {
    this.maxBreadcrumbs = 20
    this.beforePushBreadcrumb = null
    this.stack = []
  }
  /**
   * 添加用户行为栈
   */
  push(data) {
    if (typeof this.beforePushBreadcrumb === 'function') {
      // 执行用户自定义的hook
      const result = this.beforePushBreadcrumb(this, data)
      if (!result) return
      this.immediatePush(result)
      return
    }
    this.immediatePush(data)
  }
  immediatePush(data) {
    data.time || (data.time = getTimestamp())
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift()
    }
    this.stack.push(data)
    this.stack.sort((a, b) => a.time - b.time)
  }
  shift() {
    return this.stack.shift() !== undefined
  }
  clear() {
    this.stack = []
  }
  getStack() {
    return this.stack
  }
  getCategory(type) {
    switch (type) {
      // 接口请求
      case EventTypes.Xhr:
      case EventTypes.Fetch:
        return BreadcrumbTypes.Http

      // 用户点击
      case EventTypes.Click:
        return BreadcrumbTypes.Click

      // 路由变化
      case EventTypes.History:
      case EventTypes.Hashchange:
        return BreadcrumbTypes.Route

      // 加载资源
      case EventTypes.Resource:
        return BreadcrumbTypes.Resource

      // Js代码报错
      case EventTypes.Unhandledrejection:
      case EventTypes.Error:
        return BreadcrumbTypes.CodeError

      // 用户自定义
      default:
        return BreadcrumbTypes.Custom
    }
  }
  bindOptions(options: any = {}) {
    // maxBreadcrumbs 用户行为存放的最大容量
    // beforePushBreadcrumb 添加用户行为前的处理函数
    const { maxBreadcrumbs, beforePushBreadcrumb } = options
    validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') &&
      (this.maxBreadcrumbs = maxBreadcrumbs)
    validateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', 'function') &&
      (this.beforePushBreadcrumb = beforePushBreadcrumb)
  }
}
const breadcrumb =
  _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }
