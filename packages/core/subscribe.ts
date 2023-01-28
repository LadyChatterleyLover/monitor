import { getFunctionName, nativeTryCatch } from '@dd-monitor/utils'

type MonitorCallback = (data: any) => void

export class Subscribe<T> {
  dep: Map<T, MonitorCallback[]> = new Map()
  on(eventName: T, callBack: (data: any) => any) {
    const fns = this.dep.get(eventName)
    if (fns) {
      this.dep.set(eventName, fns.concat(callBack))
      return
    }
    this.dep.set(eventName, [callBack])
  }
  emit<D = any>(eventName: T, data: D) {
    const fns = this.dep.get(eventName)
    if (!eventName || !fns) return
    fns.forEach((fn) => {
      nativeTryCatch(
        () => {
          fn(data)
        },
        (e: Error) => {
          console.error(
            `Subscribe.notify：监听事件的回调函数发生错误\neventName:${eventName}\nName: ${getFunctionName(
              fn
            )}\nError: ${e}`
          )
        }
      )
    })
  }
}
