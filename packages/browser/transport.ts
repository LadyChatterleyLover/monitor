import { Breadcrumb, Transport } from '@dd-monitor/core'
import { EventTypes, ToStringTypes } from '@dd-monitor/types'
import {
  _support,
  getLocationHref,
  toStringValidateOption,
} from '@dd-monitor/utils'
import dayjs from 'dayjs'
import { roleName, username } from './../types/const'
import type { TransportData } from '@dd-monitor/types'
import type { BrowserOptionsFieldsTypes } from './types'

export class BrowserTransport extends Transport<BrowserOptionsFieldsTypes> {
  configReportXhr: unknown
  useImgUpload = false
  constructor(options: BrowserOptionsFieldsTypes) {
    super()
    super.bindOptions(options)
    this.bindOptions(options)
  }
  post(data: any, url: string): void {
    const requestFun = () => {
      fetch(`${url}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    this.queue.addTask(requestFun)
  }
  imgRequest(data: any, url: string): void {
    const requestFun = () => {
      let img = new Image()
      const spliceStr = !url.includes('?') ? '?' : '&'
      img.src = `${url}${spliceStr}data=${encodeURIComponent(
        JSON.stringify(data)
      )}`
      img = null
    }
    this.queue.addTask(requestFun)
  }
  getTransportData(data: TransportData): TransportData {
    const info: any = {
      ...data,
      ...this.getAuthInfo(), // 获取用户信息
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      uuid: this.uuid,
      page_url: getLocationHref(),
      deviceInfo: _support.deviceInfo,
      username,
      roleName,
    }

    // 性能数据和录屏不需要附带用户行为
    if (
      data.type != EventTypes.Performance &&
      data.type != EventTypes.Recordscreen
    ) {
      info.breadcrumb = new Breadcrumb().getStack() // 获取用户行为栈
    }
    return info
  }
  sendToServer(data: any, url: string): void {
    data.recordScreenId = _support.recordScreenId
    return this.useImgUpload ? this.imgRequest(data, url) : this.post(data, url)
  }

  bindOptions(options: BrowserOptionsFieldsTypes) {
    const { configReportXhr, useImgUpload, dsn, appKey } = options
    toStringValidateOption(dsn, 'dsn', ToStringTypes.String) && (this.dsn = dsn)
    toStringValidateOption(appKey, 'appKey', ToStringTypes.String) &&
      (this.appKey = appKey)
    toStringValidateOption(
      configReportXhr,
      'configReportXhr',
      ToStringTypes.Function
    ) && (this.configReportXhr = configReportXhr)
    toStringValidateOption(
      useImgUpload,
      'useImgUpload',
      ToStringTypes.Boolean
    ) && (this.useImgUpload = useImgUpload)
  }
}
