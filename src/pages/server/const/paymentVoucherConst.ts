export const voucherStatuses = [
  { id: 0, name: '审批待提交' },
  { id: 1, name: '待审批' },
  { id: 2, name: '审批已退回' },
  { id: 3, name: '已审批' },
  { id: 4, name: '核销待提交' },
  { id: 5, name: '待核销' },
  { id: 6, name: '部分核销' },
  { id: 7, name: '已核销' },
  { id: 8, name: '已作废' }
]
export const refundApplicationStatus = [
  { id: 10, name: '待退款' },
  { id: 11, name: '待确认' },
  { id: 12, name: '已退款' },
  { id: 13, name: '已作废' }
]

// 线下
export const paymentTypes = [
  { id: -1, name: '未分配' },
  { id: 1, name: '银行' },
  { id: 2, name: '支付宝' },
  { id: 3, name: '微信' },
  { id: 4, name: '账务调整' }
]
// 线上
export const orderPaymentTypes = [
  { id: -1, name: '未分配' },
  { id: 0, name: '微信' },
  { id: 1, name: '支付宝' },
  { id: 2, name: '银联' },
  { id: 3, name: '线下转账' },
  { id: 4, name: '账务调整' }
]
// 收款渠道
export const tradePaymentTypes = [
  { id: 0, name: '在线支付' },
  { id: 1, name: '线下转账' }
]
// 银行
export const lcBanks = [
  { id: 1, name: '建设银行龙漕路支行' },
  { id: 2, name: '浦发银行龙阳支行' },
  { id: 3, name: '浦发银行张江科技支行' },
  { id: 4, name: '招商银行张江支行' },
  { id: 5, name: '浦发硅谷银行' },
  { id: 6, name: '南京银行' },
  { id: 7, name: '上海银行浦西支行' },
  { id: 8, name: '农商银行虹口支行' }
]
// 支付宝
export const lcAllipays = [
  { id: 21, name: '支付宝admin@linkedcare.cn' },
  { id: 22, name: '支付宝haocai@linkedcare.cn' }
]
// 微信
export const lcWechats = [
  { id: 31, name: '微信1481105022' },
  { id: 32, name: '微信1415822102' }
]
// 账务调整
export const lcFinAdjust = [
  { id: 41, name: '账务调整' }
]
export const voucherTypes = [
  { id: 1, name: '线下支付' },
  { id: 2, name: '抹平差额' },
  { id: 3, name: '内部支付' },
  { id: 4, name: '退款转结' }
]
export const onLinePaymentTypes = [
  { id: 1, name: '支付宝' },
  { id: 0, name: '微信' }
]
