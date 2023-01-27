import {
  Queue,
  isInclude,
  logger,
  validateOptionsAndSet,
} from '@dd-monitor/utils'
import { SDK_NAME, SDK_VERSION, ToStringTypes } from '@dd-monitor/types'
import type {
  AuthInfo,
  BaseOptionsFieldsIntegrationType,
  BreadcrumbData,
  TransportData,
} from '@dd-monitor/types'

export abstract class Transport<
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType
> {
  appKey = ''
  dsn = ''
  queue: Queue
  beforeDataReport:
    | Promise<TransportData | null | undefined | boolean>
    | TransportData
    | any
    | null
    | undefined
    | boolean = null
  backTrackerId: unknown = null
  configReportUrl: unknown = null
  maxDuplicateCount = 3
  constructor() {
    this.queue = new Queue()
  }

  getAuthInfo(): AuthInfo {
    const trackerId = this.getTrackerId()
    const result: AuthInfo = {
      trackerId: String(trackerId),
      sdkVersion: SDK_VERSION,
      sdkName: SDK_NAME,
      appKey: this.appKey,
    }
    return result
  }

  getTrackerId(): string | number {
    if (typeof this.backTrackerId === 'function') {
      const trackerId = this.backTrackerId()
      if (typeof trackerId === 'string' || typeof trackerId === 'number') {
        return trackerId
      } else {
        logger.error(
          `trackerId:${trackerId} 期望 string 或 number 类型，但是传入 ${typeof trackerId}`
        )
      }
    }
    return ''
  }

  isSelfDsn(targetUrl: string): boolean {
    return this.dsn && isInclude(targetUrl, this.dsn)
  }

  bindOptions(options: Partial<O> = {}): void {
    const {
      dsn,
      beforeDataReport,
      appKey,
      maxDuplicateCount,
      backTrackerId,
      configReportUrl,
    } = options
    const functionType = ToStringTypes.Function
    const optionArr = [
      [appKey, 'appKey', ToStringTypes.String],
      [dsn, 'dsn', ToStringTypes.String],
      [maxDuplicateCount, 'maxDuplicateCount', ToStringTypes.Number],
      [beforeDataReport, 'beforeDataReport', functionType],
      [backTrackerId, 'backTrackerId', functionType],
      [configReportUrl, 'configReportUrl', functionType],
    ]
    validateOptionsAndSet.call(this, optionArr)
  }

  async send(data: any, breadcrumb: BreadcrumbData[] = []) {
    let transportData = {
      ...this.getTransportData(data),
      breadcrumb,
    }
    if (typeof this.beforeDataReport === 'function') {
      transportData = await this.beforeDataReport(transportData)
      if (!transportData) return
    }
    let dsn = this.dsn
    if (!dsn) {
      logger.error('dsn不能为空')
      return
    }
    if (typeof this.configReportUrl === 'function') {
      dsn = this.configReportUrl(transportData, dsn)
      if (!dsn) return
    }
    return this.sendToServer(transportData, dsn)
  }

  //  post方式，子类需要重写
  abstract post(data: TransportData | any, url: string): void

  // 最终上报到服务器的方法，需要子类重写
  abstract sendToServer(data: TransportData | any, url: string): void

  // 获取上报的格式
  abstract getTransportData(data: TransportData): TransportData
}
