import { orderTypes as myOrder } from '../../order/const/orderSearchCondition'

import { associationAuditStatuses as myAssociationAuditStatuses, associationApplyTypes as myAssociationApplyTypes, quoteStatuses as myQuoteItemStatuses } from '../../product/const'


import { userTypes as myUser, memberLevels as myPriceLevels, roundingTypes as myRoundingTypes, isPrintPrice as myIsPrintPrice } from '../../../const/index'

export const orderTypes = myOrder

export const associationAuditStatuses = myAssociationAuditStatuses

export const associationApplyTypes = myAssociationApplyTypes

export const userTypes = myUser

export const priceLevels = myPriceLevels

export const creditLevels = [
  { id: 0, name: '优质' },
  { id: 1, name: '良好' },
  { id: 2, name: '正常' },
  { id: 3, name: '黑名单' }
]

export const sourceTypes = [
  { id: 0, name: 'BMS' },
  { id: 1, name: '运营后台' }
]

export const quoteItemStatuses = myQuoteItemStatuses
// export const associationAuditStatuses = [
//   { id: 0, name: '待审批' },
//   { id: 1, name: '已审批' }
// ]

export const roundingTypes = myRoundingTypes

export const isPrintPrice = myIsPrintPrice

// export const settlementMethods = [
//   { id: 30, name: '30天' },
//   { id: 60, name: '60天' },
//   { id: 0, name: '固定期限' },
// ]

export const settlementStatus = [
  { id: 1, name: '月结' },
  { id: 0, name: '普通' },
  { id: void 0, name: '全部' },
  { id: 4, name: '部分结算' }
]

export const activeStatus = [
  { id: 0, name: '活跃' },
  { id: 2, name: '停滞' },
  { id: 3, name: '安装培训' },
  { id: 4, name: '已关闭' },
  { id: 11, name: '高风险' },
  { id: 12, name: '低风险' },
  { id: 99, name: '未标记' }
]

export const customerLevels = [
  { id: 'A标杆客户', name: '标杆客户' },
  { id: 'B重点客户', name: '重点客户' },
  { id: 'C标准客户', name: '标准客户' },
  { id: 'D风险客户', name: '风险客户' }
]
export const purchasingFrequencys = [
  { id: 0, name: '周' },
  { id: 1, name: '半月' },
  { id: 2, name: '月' },
  { id: 3, name: '隔月' },
  { id: 4, name: '季度' },
  { id: 5, name: '半年' }
]
// 随货发票 invoiceWithGoods
export const invoiceWithGoods = [
  { id: 0, name: '不需要' },
  { id: 1, name: '需要' }
]
// 发票 invoiceKind
export const invoiceKinds = [
  { id: 0, name: '电子发票' },
  { id: 1, name: '纸质发票' }
]
export const validityFlags = [
  { id: 0, name: '正常效期' },
  { id: 1, name: '长效期' }
]
export const agreementGoods = [
  { id: 0, name: '否' },
  { id: 1, name: '是' }
]

export const salesDepartmentss = [
  { id: 0, name: 'KA销售部' },
  { id: 1, name: '城市直销部' },
  { id: 2, name: '在线销售部' },
  { id: 3, name: '渠道销售部' },
  { id: 50, name: '无' }
]

export const monthlyServers = [
  { id: 0, name: '未开通' },
  { id: 1, name: '已开通' }
]

export const tradeStatuss = [
  { id: 0, name: '无交易' },
  { id: 1, name: '当月无交易' },
  { id: 2, name: '当月新增' },
  { id: 3, name: '当月复购' }
]

export const auditStatus = [
  { id: 0, name: '审核中' },
  { id: 1, name: '已通过' },
  { id: 2, name: '已驳回' },
  { id: 3, name: '已取消' }
]

export const agreePriceStatuses = [
  { id: 0, name: '待提交' },
  { id: 1, name: '待审批' },
  { id: 2, name: '已拒绝' },
  { id: 3, name: '生效' },
  { id: 4, name: '失效' }
]

export const quoteStatuses = [
  { id: 0, name: '待提交' },
  { id: 1, name: '待审批' },
  { id: 2, name: '已导入' },
  { id: 3, name: '已拒绝' }
]

export const isOriginalSku = [
  { id: 0, name: '否' },
  { id: 1, name: '是' }
]

// export const isTicketOpenings = [
//   { id: 0, name: '未开票' },
//   { id: 1, name: '已开票' },
// ]
export const isTicketOpenings = [
  { id: 1, name: '未开票' },
  { id: 2, name: '已开票' },
  { id: 3, name: '未申请' },
]
// 会员等级
export const memberTypes = [
  { id: 0, name: '非会员', price: 1 },
  // { id: 1, name: '白银会员', price: 1 },
  // { id: 2, name: '黄金会员', price: 2 },
  // { id: 3, name: '钻石会员', price: 2 }
  { id: 1, name: '会员', price: 2 }
]
// 会员价格
export const memberPrices = [
  { id: 0, name: 'A价' },
  { id: 1, name: 'B价' },
  { id: 2, name: 'C价' }
]
// 返现条件类型
export const cashBackTypes = [
  { id: 1, name: '单店采购' },
  // { id: 2, name: '集团采购'}
]
// 供应链服务版本
export const chainServiceTypes = [
  { id: 1, name: 'SaaS进销存（单店版）' },
  { id: 2, name: 'SaaS进销存（集采版）' }
]
