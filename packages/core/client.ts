import { SDK_VERSION } from '@dd-monitor/types'
import { logger } from '@dd-monitor/utils'
import { Subscribe } from './subscribe'
import type { Breadcrumb } from './breadcrumb'
import type { Transport } from './transport'
import type {
  BaseClientType,
  BaseOptionsFieldsIntegrationType,
  BaseOptionsFieldsType,
  BasePluginType,
  EventTypes,
  TransportData,
} from '@dd-monitor/types'

export abstract class BaseClient<
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType,
  E extends EventTypes = EventTypes
> implements BaseClientType
{
  sdkName: string
  sdkVersion = SDK_VERSION
  options: BaseOptionsFieldsType
  abstract breadcrumb: Breadcrumb
  abstract transport: Transport
  constructor(options: O) {
    this.options = options
    logger.bindOptions(options.debug)
  }
  use(plugins: BasePluginType<E>[]) {
    if (this.options.disabled) return
    // 新建发布订阅实例
    const subscribe = new Subscribe<E>()
    plugins.forEach((item) => {
      if (!this.isPluginEnable(item.name)) return
      // 调用插件中的monitor并将发布函数传入
      item.on.call(this, subscribe.on.bind(subscribe))
      const wrapperTransform = (...args: any[]) => {
        // 先执行transform
        const res = item.transform?.apply(this, args)
        // 拿到transform返回的数据并传入
        item.emit?.call(this, res)
        // 如果需要新增hook，可在这里添加逻辑
      }
      // 订阅插件中的名字，并传入回调函数
      subscribe.emit(item.name, wrapperTransform)
    })
  }
  getOptions() {
    return this.options
  }
  // 判断当前插件是否启用，每个端的可选字段不同，需要子类实现
  abstract isPluginEnable(name: EventTypes): boolean
  // 手动上报方法，每个端需要自己实现
  abstract log(data: TransportData): void
}
