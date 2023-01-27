import { UAParser } from 'ua-parser-js'
import { generateUUID } from './helper'
import type { Breadcrumb } from '@dd-monitor/core'
import type { EventTypes } from '@dd-monitor/types'
import type { Logger } from './logger'

export interface MonitorSupport {
  logger: Logger
  replaceFlag: { [key in EventTypes]?: boolean }
  record?: any[]
  deviceInfo?: {
    browser_version: string
    browser: string
    os_version: string
    os: string
    ua: string
    device: string
    device_type: string
  }
  hasError: boolean
  events: any[]
  recordScreenId: string
  breadcrumb: Breadcrumb
}

interface MONITORGlobal {
  console?: Console
  __Monitor__?: MonitorSupport
}

export const isBrowserEnv = typeof window !== 'undefined' ? window : 0

export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as MONITORGlobal & T
}

const _global = getGlobal<Window>()
const _support = getGlobalMonitorSupport()

const uaResult = new UAParser().getResult()

// 某段时间代码是否报错
_support.hasError = false

// 存储录屏的信息
_support.events = []
// 本次录屏的id
_support.recordScreenId = generateUUID()

// 获取设备信息
_support.deviceInfo = {
  // 浏览器版本号
  browser_version: uaResult.browser.version,
  // Chrome
  browser: uaResult.browser.name,
  // 电脑系统 10
  os_version: uaResult.os.version,
  // Windows
  os: uaResult.os.name,
  ua: uaResult.ua,
  device: uaResult.device.model ? uaResult.device.model : 'Unknow',
  // pc
  device_type: uaResult.device.type ? uaResult.device.type : 'Pc',
}

_support.replaceFlag = _support.replaceFlag || {}
const replaceFlag = _support.replaceFlag
export function setFlag(replaceType, isSet) {
  if (replaceFlag[replaceType]) return
  replaceFlag[replaceType] = isSet
}
export function getFlag(replaceType) {
  return replaceFlag[replaceType] ? true : false
}

function getGlobalMonitorSupport(): MonitorSupport {
  _global.__Monitor__ = _global.__Monitor__ || ({} as MonitorSupport)
  return _global.__Monitor__
}

export function supportsHistory(): boolean {
  // borrowed from: https://github.com/angular/angular.js/pull/13945/files
  const chrome = (_global as any).chrome
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime
  const hasHistoryApi =
    'history' in _global &&
    !!(_global as Window).history.pushState &&
    !!(_global as Window).history.replaceState
  return !isChromePackagedApp && hasHistoryApi
}

export { _global, _support }
