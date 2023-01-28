import { validateOptionsAndSet } from '@dd-monitor/utils'
import { BaseOptions } from '@dd-monitor/core'
import { ToStringTypes } from '@dd-monitor/types'
import type { BrowserOptionsFieldsTypes } from './types'

export class BrowserOptions extends BaseOptions<BrowserOptionsFieldsTypes> {
  xhr?: boolean
  fetch?: boolean
  console?: boolean
  dom?: boolean
  history?: boolean
  hash?: boolean
  unhandledrejection?: boolean
  recordScreen?: boolean
  whiteScreen?: boolean
  whiteBoxElements?: string[]
  overTime?: number
  constructor(options: BrowserOptionsFieldsTypes) {
    super()
    super.bindOptions(options)
    this.bindOptions(options)
    // 白屏检测的父容器列表
    this.whiteBoxElements = ['html', 'body', '#app', '#root']
    this.overTime = 5
  }
  bindOptions(options: BrowserOptionsFieldsTypes) {
    const {
      xhr = true,
      fetch = true,
      dom = true,
      history = true,
      hash = true,
      unhandledrejection = true,
      recordScreen = true,
      whiteScreen = true,
      console = true,
      error = true,
      disabled = false,
    } = options
    const booleanType = ToStringTypes.Boolean
    const optionArr = [
      [xhr, 'xhr', booleanType],
      [fetch, 'fetch', booleanType],
      [dom, 'dom', booleanType],
      [history, 'history', booleanType],
      [hash, 'hash', booleanType],
      [unhandledrejection, 'unhandledrejection', booleanType],
      [recordScreen, 'recordScreen', booleanType],
      [whiteScreen, 'whiteScreen', booleanType],
      [console, 'console', booleanType],
      [error, 'error', booleanType],
      [disabled, 'disabled', booleanType],
    ]
    validateOptionsAndSet.call(this, optionArr)
  }
}
