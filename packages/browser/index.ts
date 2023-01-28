import { BrowserClient } from './client'
import errorPlugin from './plugins/error'
import unhandlerejecttionPlugin from './plugins/unhandlerejecttion'
import domPlugin from './plugins/dom'
import type { BasePluginType } from '@dd-monitor/types'
import type { BrowserOptionsFieldsTypes } from './types'

function init(
  options: BrowserOptionsFieldsTypes,
  plugins: BasePluginType[] = []
) {
  const browserClient = new BrowserClient(options)
  const browserPlugins = [domPlugin, errorPlugin, unhandlerejecttionPlugin]
  browserClient.use([...browserPlugins, ...plugins])
  return browserClient
}

export { init, BrowserClient }
