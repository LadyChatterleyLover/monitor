import { isBrowserEnv } from './global'
import { logger } from './logger'
import type { ToStringTypes } from '@dd-monitor/types'

// 用到所有事件的名称
type TotalEventName =
  | keyof GlobalEventHandlersEventMap
  | keyof XMLHttpRequestEventTargetEventMap
  | keyof WindowEventMap

export function getLocationHref(): string {
  if (typeof document === 'undefined' || document.location == null) return ''
  return document.location.href
}

export function getUrlWithEnv(): string {
  if (isBrowserEnv) return getLocationHref()
  return ''
}

export function on(
  target: HTMLElement | Element,
  eventName: TotalEventName,
  handler: () => void,
  opitons: boolean | unknown = false
): void {
  target.addEventListener(eventName, handler, opitons)
}

/**
 * 重写对象上面的某个属性
 *
 * @export
 * @param {Record<string, any>,} source 需要被重写的对象
 * @param {string} name 需要被重写对象的key
 * @param {(...args: any[]) => any} replacement 以原有的函数作为参数，执行并重写原有函数
 * @param {boolean} [isForced=false] 是否强制重写（可能原先没有该属性）
 */
export function replaceOld(
  source: Record<string, any>,
  name: string,
  replacement: (...args: any[]) => any,
  isForced = false
): void {
  if (source === undefined) return
  if (name in source || isForced) {
    const original = source[name]
    const wrapped = replacement(original)
    if (typeof wrapped === 'function') {
      source[name] = wrapped
    }
  }
}

export const defaultFunctionName = '<anonymous>'
/**
 * 需要获取函数名，匿名则返回<anonymous>
 * ../param {unknown} fn 需要获取函数名的函数本体
 * ../returns 返回传入的函数的函数名
 */
export function getFunctionName(fn: unknown): string {
  if (!fn || typeof fn !== 'function') {
    return defaultFunctionName
  }
  return fn.name || defaultFunctionName
}

export function throttle(fn: () => void, delay: number): () => void {
  let canRun = true
  return function (...args: any) {
    if (!canRun) return
    fn.apply(this, args)
    canRun = false
    setTimeout(() => {
      canRun = true
    }, delay)
  }
}

export function isInclude(origin: string, target: string): boolean {
  return !!~origin.indexOf(target)
}

export function getTimestamp(): number {
  return Date.now()
}

export function generateUUID() {
  let d = Date.now()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.trunc((d + Math.random() * 16) % 16)
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export function firstStrtoUppercase(str: string): string {
  return str.replace(/\b(\w)(\w*)/g, ($0: string, $1: string, $2: string) => {
    return `${$1.toUpperCase()}${$2}`
  })
}

export function firstStrtoLowerCase(str: string): string {
  return str.replace(/\b(\w)(\w*)/g, ($0: string, $1: string, $2: string) => {
    return `${$1.toLowerCase()}${$2}`
  })
}

export const nativeToString = Object.prototype.toString

export function toStringAny(target: any, type: ToStringTypes): boolean {
  return nativeToString.call(target) === `[object ${type}]`
}

export function toStringValidateOption(
  target: any,
  targetName: string,
  expectType: ToStringTypes
): boolean {
  if (toStringAny(target, expectType)) return true
  typeof target !== 'undefined' &&
    logger.error(
      `${targetName}期望传入:${expectType}类型，当前是:${nativeToString.call(
        target
      )}类型`
    )
  return false
}

export function typeofAny(target) {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase()
}

// 验证选项的类型
export function validateOption(target, targetName, expectType) {
  if (!target) return false
  if (typeofAny(target) === expectType) return true
  console.error(
    `web-see: ${targetName}期望传入${expectType}类型，目前是${typeofAny(
      target
    )}类型`
  )
}

export function validateOptionsAndSet(
  this: any,
  targetArr: [any, string, ToStringTypes][]
) {
  targetArr.forEach(
    ([target, targetName, expectType]) =>
      toStringValidateOption(target, targetName, expectType) &&
      (this[targetName] = target)
  )
}

export function nativeTryCatch(
  fn: () => void,
  errorFn?: (err: any) => void
): void {
  try {
    fn()
  } catch (err) {
    console.error('err', err)
    if (errorFn) {
      errorFn(err)
    }
  }
}
