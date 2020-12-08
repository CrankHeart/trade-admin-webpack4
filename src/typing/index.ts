export interface UserMessage {
  userName: string
  memberId: string
  token: string
}
export interface State extends UserMessage {
  isCustomServer: boolean
}

export interface SelectOption {
  id: number | string
  name: string
}

export interface Condition {
  value: any
  key: string
  label: string
  type: string
  options?: SelectOption
}

export interface Echarts {
  showLoading?: any
  resize?: any
  hideLoading?: any
  [propName: string]: any
}

export interface Page {
  num: number
  cur: number
  total: number
  sizes?: number[]
}