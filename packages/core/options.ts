import { ToStringTypes } from '@dd-monitor/types/const'
import { validateOptionsAndSet } from '@dd-monitor/utils'
import type {
  BaseOptionsFieldsIntegrationType,
  BaseOptionsType,
} from '@dd-monitor/types'
import type { App } from 'vue'
export class BaseOptions<
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType
> implements BaseOptionsType<O>
{
  dsn: string
  appKey: string
  filterXhrUrlRegExp: RegExp
  throttleDelayTime = 0
  beforeAppAjaxSend = null
  vue: App = null
  bindOptions(options: O): void {
    const {
      dsn,
      appKey,
      filterXhrUrlRegExp,
      throttleDelayTime,
      beforeAppAjaxSend,
      vue,
    } = options
    const optionArr = [
      [dsn, 'dsn', ToStringTypes.String],
      [appKey, 'appKey', ToStringTypes.String],
      [throttleDelayTime, 'throttleDelayTime', ToStringTypes.Number],
      [filterXhrUrlRegExp, 'filterXhrUrlRegExp', ToStringTypes.RegExp],
      [beforeAppAjaxSend, 'beforeAppAjaxSend', ToStringTypes.Function],
    ]
    validateOptionsAndSet.call(this, optionArr)
    this.vue = vue
  }
  isFilterHttpUrl(url: string): boolean {
    return this.filterXhrUrlRegExp && this.filterXhrUrlRegExp.test(url)
  }
}
