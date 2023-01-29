import { EventTypes } from '@dd-monitor/types'
import { BrowserClient } from './client'
import errorPlugin from './plugins/error'
import unhandlerejecttionPlugin from './plugins/unhandlerejecttion'
import domPlugin from './plugins/dom'
import fetchPlugin from './plugins/fetch'
import xhrPlugin from './plugins/xhr'
import historyRoutePlugin from './plugins/historyRoute'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserOptionsFieldsTypes } from './types'

function init(
  options: BrowserOptionsFieldsTypes,
  plugins: BasePluginType[] = []
) {
  options.recordScreen = options.recordScreen ?? true
  options.recordScreenTypeList = options.recordScreenTypeList ?? [
    EventTypes.Error,
    EventTypes.Unhandledrejection,
    EventTypes.Resource,
    EventTypes.Fetch,
    EventTypes.Xhr,
  ]
  options.recordScreentime = options.recordScreentime ?? 5
  options.debug = options.debug ?? true
  options.disabled = options.disabled ?? false
  options.dom = options.dom ?? true
  options.xhr = options.xhr ?? true
  options.unhandledrejection = options.unhandledrejection ?? true
  options.error = options.error ?? true
  options.fetch = options.fetch ?? true
  options.history = options.history ?? true
  options.maxBreadcrumbs = options.maxBreadcrumbs ?? 10
  options.maxDuplicateCount = options.maxDuplicateCount ?? 2
  const browserClient = new BrowserClient(options)
  const browserPlugins = [
    domPlugin,
    errorPlugin,
    unhandlerejecttionPlugin,
    xhrPlugin,
    fetchPlugin,
    historyRoutePlugin,
  ]
  browserClient.use([...browserPlugins, ...plugins])
  return browserClient
}

export { init, BrowserClient }
