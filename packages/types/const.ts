import pkg from '../../package.json'

export const enum ToStringTypes {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  RegExp = 'RegExp',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol',
  Object = 'Object',
  Array = 'Array',
  process = 'process',
  Window = 'Window',
  Function = 'Function',
}

export interface AuthInfo {
  trackerId: string
  sdkVersion: string
  sdkName: string
  appKey: string
}

export const SDK_VERSION = pkg.version
export const SDK_NAME = 'dd-monitor'

const local = localStorage.getItem('userInfo')
export const username = local ? JSON.parse(local).real_name : ''
export const roleName = local ? JSON.parse(local).role_name : ''
