// 用户行为
import type { BreadcrumbTypes, EventTypes, StatusCode } from './event'

export interface RecordData {
  column: number
  line: number
  message: string
  fileName: string
  recordScreenId: string
  type: EventTypes
  status: StatusCode
}

export interface BreadcrumbData {
  type: EventTypes
  category: BreadcrumbTypes
  status: StatusCode
  time: number
  data: string | Partial<RecordData>
}
