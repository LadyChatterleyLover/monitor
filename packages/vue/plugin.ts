import { EventTypes } from '@dd-monitor/types'
import {
  getTimestamp,
  getUrlWithEnv,
  variableTypeDetection,
} from '@dd-monitor/utils'
import { breadcrumb } from '@dd-monitor/core'
import type { BrowserClient } from '../browser'
import type { BasePluginType } from '@dd-monitor/types'
import type { TransportData } from './../types/transport'
import type { App, ComponentPublicInstance } from 'vue'

const vuePlugin: BasePluginType<EventTypes, BrowserClient> = {
  name: EventTypes.Vue,
  on(notify) {
    const Vue: any = this.options.vue
    if (Vue && Vue.config) {
      const originErrorHandle = Vue.config.errorHandler
      Vue.config.errorHandler = function (
        err: Error,
        vm: App,
        info: string
      ): void {
        const data = {
          message: `${err.message}(${info})`,
          url: getUrlWithEnv(),
          name: err.name,
          time: getTimestamp(),
        }
        notify(EventTypes.Vue, { data, vm })
        const hasConsole = typeof console !== 'undefined'
        if (hasConsole) {
          console.error(`Error in ${info}: "${err.toString()}"`)
        }
        return originErrorHandle?.(err, vm, info)
      }
    }
  },
  transform({
    data: collectedData,
    vm,
  }: {
    data: TransportData
    vm: ComponentPublicInstance
  }) {
    const Vue = this.options.vue
    if (variableTypeDetection.isString(Vue?.version)) {
      return { ...collectedData, ...vueVmHandler(vm) }
    }
  },
  emit(data: TransportData) {
    breadcrumb.push({
      type: EventTypes.Error,
      category: breadcrumb.getCategory(EventTypes.Error),
      data,
    })
    this.transport.send(data, breadcrumb.getStack())
  },
}

function vueVmHandler(vm: ComponentPublicInstance) {
  let componentName = ''
  if (vm.$root === vm) {
    componentName = 'root'
  } else {
    const name = vm.$options && vm.$options.name
    componentName = name ? `component <${name}>` : 'anonymous component'
  }
  return {
    componentName,
    propsData: vm.$props,
  }
}

export default vuePlugin
