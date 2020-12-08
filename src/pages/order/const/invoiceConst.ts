
export const invoiceKind = [
  { id: 0, name: '电子发票' },
  { id: 1, name: '纸质发票' }
]

export const invoiceType = [
  { id: 0, name: '增值税普通发票' },
  { id: 1, name: '增值税专用发票' }
]

export const defaultInvoiceKind = 1
export const defaultInvoiceType = 0
export const maxInvoiceCount = 3

export const invoiceProgress = [
  { name: '未审核', id: 'unVerify' },
  { name: '已审核', id: 'verified' },
  { name: '待开票', id: 'toInvoiced' },
  { name: '已开票', id: 'invoiced' },
  { name: '已打回', id: 'returned' },
  { name: '开票失败', id: 'invoiceFailed' }
]

export const invoiceStatus = [
  { name: '正常', id: 0 },
  { name: '已红冲', id: 1 },
  { name: '已重开', id: 2 }
]

export const mailStatus = [
  { name: '未邮寄', id: 0 },
  { name: '已邮寄', id: 1 },
  { name: '无需邮寄', id: 2 }
]

export const withGoods = [
  { name: '随货发票', id: 1 },
  { name: '普通发票', id: 2 }
]

// 客户开票状态
export const khInvoiceStatus = [
  { name: '无需开票', id: 0 },
  { name: '待开票', id: 1 },
  { name: '已开票', id: 2 }
]
// export const invoiceReIssueModule = [
//   { prop: 'model', type: 'radio', label: '开票方式', options: invoiceKind },
//   { prop: 'type', type: 'radio', label: '发票类型', options: invoiceType },
//   { prop: 'title', type: 'text', label: '发票抬头' },
//   { prop: 'code', type: 'text', label: '纳税人识别号' },
//   { prop: 'address', type: 'cascader', label: '地址' },
//   { prop: 'phone', type: 'text', label: '电话' },
//   { prop: 'bank', type: 'text', label: '开户行' },
//   { prop: 'account', type: 'text', label: '开户行账号' }
// ]

export const deliveryTypes = [
  { id: 0, name: '出库单' },
  { id: 1, name: '缺货单' },
  { id: 2, name: '退换货入库单' },
  { id: 3, name: '采购计划退货出库' }
]

// receivableType   '单据类型 1：出库单，2：退库单，3：退款服务单',
export const receivableTypes = [
  { id: 0, name: '' },
  { id: 1, name: '出库单' },
  { id: 2, name: '退库单' },
  { id: 3, name: '退款服务单' }
]

export const haveReturnOrders = [
  { id: 0, name: '已完成' },
  { id: 1, name: '申请中' },
  { id: 2, name: '未申请' }
]
