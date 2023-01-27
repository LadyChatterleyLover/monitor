// 错误类型
export enum ErrorTypes {
  Unknown = 'unknown',
  Unknown_function = 'unknown_function',
  Javascript_error = 'javascript_error',
  Log_error = 'log_error',
  Fetch_error = 'http_error',
  Vue_error = 'vue_error',
  React_error = 'react_error',
  Resource_error = 'resource_error',
  Promise_error = 'promise_error',
  Route_error = 'route_error',
}

// 用户行为类型
export enum BreadcrumbTypes {
  Http = 'Http',
  Click = 'Click',
  Resource = 'ResourceError',
  CodeError = 'CodeError',
  Route = 'Route',
  Custom = 'Custom',
}

// 用户事件类型
export enum EventTypes {
  Xhr = 'xhr',
  Fetch = 'fetch',
  Click = 'click',
  History = 'history',
  Error = 'error',
  Hashchange = 'hashchange',
  Unhandledrejection = 'unhandledrejection',
  Resource = 'resource',
  Dom = 'dom',
  Vue = 'vue',
  React = 'react',
  Custom = 'custom',
  Performance = 'performance',
  Recordscreen = 'recordscreen',
  Whitescreen = 'whitescreen',
}

// 状态
export enum StatusCode {
  Error = 'error',
  Ok = 'ok',
}

// http类型
export enum HttpType {
  Xhr = 'xhr',
  Fetch = 'fetch',
}

// 状态码
export enum HttpCode {
  Bad_request = 400,
  Unauthorized = 401,
}

// 请求方法
export enum Methods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
}
