import type { EventTypes, HttpMethod, HttpType } from '@dd-monitor/types'

export interface HttpCollectedType {
  type?: EventTypes
  method?: HttpMethod
  request: {
    httpType?: HttpType
    traceId?: string
    method?: string
    url?: string
    data?: any
  }
  response: {
    status?: number
    data?: any
  }
  elapsedTime?: number
  time?: number
}

export interface MONITORXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any
  httpCollect?: HttpCollectedType
}
