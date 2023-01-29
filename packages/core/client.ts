import { SDK_VERSION } from '@dd-monitor/types'
import { SDK_NAME } from './../types/const'
import { Subscribe } from './subscribe'
import type { Breadcrumb } from './breadcrumb'
import type { Transport } from './transport'
import type {
  BaseClientType,
  BaseOptionsFieldsIntegrationType,
  BasePluginType,
  EventTypes,
  LogType,
} from '@dd-monitor/types'

export abstract class BaseClient<
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType,
  E extends EventTypes = EventTypes
> implements BaseClientType
{
  sdkName = SDK_NAME
  sdkVersion = SDK_VERSION
  options: BaseOptionsFieldsIntegrationType
  abstract breadcrumb: Breadcrumb
  abstract transport: Transport
  constructor(options: O) {
    this.options = options
  }
  use(plugins: BasePluginType<E>[]) {
    if (this.options.disabled) return
    // 新建发布订阅实例
    const subscribe = new Subscribe<E>()
    plugins.forEach((item) => {
      if (!this.isPluginEnable(item.name)) return
      item.on.call(this, subscribe.emit.bind(subscribe))
      const wrapperTransform = (...args: any[]) => {
        const res = item.transform?.apply(this, args)
        item.emit?.call(this, res)
      }
      subscribe.on(item.name, wrapperTransform)
    })
  }
  getOptions() {
    return this.options
  }
  // 判断当前插件是否启用，每个端的可选字段不同，需要子类实现
  abstract isPluginEnable(name: EventTypes): boolean
  // 手动上报方法，每个端需要自己实现
  abstract log(data: LogType): void
}
