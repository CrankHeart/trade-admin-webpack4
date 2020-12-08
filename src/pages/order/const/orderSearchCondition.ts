import { userTypes as myUserTypes } from '../../../const'
export let orderTypes = [
  { name: '全部', id: -1 },
  { name: '普通订单', id: 0 },
  { name: '月结订单', id: 1 }
]

export const userTypeObj = myUserTypes.reduce( ( prev, next ) => {
  prev[ next.id ] = next
  return prev
}, {} )

export let userTypes = myUserTypes

export let settlementStatus = [
  // { id: -1, name: '全部' },
  { id: 0, name: '未发起核对' },
  { id: 1, name: '已发起核对' },
  { id: 2, name: '已核对' },
  { id: 4, name: '部分结算' },
  { id: 3, name: '已结算' }
]

export let deliverySettlementStatus = [
  // { id: -1, name: '全部' },
  { id: 0, name: '未结算' },
  { id: 1, name: '部分结算' },
  { id: 2, name: '已结算' }
]

export let checkStatusList = [
  // { id: -1, name: '全部' },
  { id: 0, name: '未结算' },
  { id: 1, name: '部分结算' },
  { id: 2, name: '已结算' }
]


export let orderStatus = [
  { id: 'booleanUnpay', name: '待确认' },
  { id: 'booleanWaitDelivery', name: '待发货' },
  { id: 'booleanPartPostDelivery', name: '部分发货' },
  { id: 'booleanPostDelivery', name: '已发货' },
  { id: 'booleanClosed', name: '已完成' },
  { id: 'booleanCancelled', name: '已取消' }
]

export let shoppingTypes = [
  { id: 0, name: '订单' },
  { id: 1, name: '订购单' }
]

export const deliveryStates = [
  { id: 0, name: '未出库' },
  { id: 1, name: '待出库' },
  { id: 2, name: '已出库' },
  { id: 3, name: '已取消' },
  { id: 4, name: '提交失败' },
  { id: void 0, name: '已退款' }
]

export const allocationStatus = [
  { id: 1, name: '延迟配货' },
  { id: 2, name: '待配货' },
  { id: 3, name: '配货中' },
  { id: 4, name: '已完成' },
  { id: 5, name: '已退款' },
  { id: 6, name: '已取消' }
]

// export let orderAllStatus = ['未付款', '待发货', '已发货', '已收货', '已评价', '已完成', '已取消', '退货申请', '待退货', '待退款', '已退款', '审核不通过', '部分发货']
export let orderAllStatus = [ '待确认', '待发货', '已发货', '已收货', '已评价', '已完成', '已取消', '部分发货' ]

export const refundStates = [ '未申请', '已退款', '已完成' ]

export const firstOrderStatus = [
  { id: 1, name: '是' },
  { id: 0, name: '否' }
]

export const agreePriceTypes = [
  { id: 0, name: '折扣' },
  { id: 1, name: '满减' },
  { id: 2, name: '满赠' },
  { id: 3, name: '会员价' },
  { id: 4, name: '协议价' },
  { id: 5, name: '原价' },
  { id: 6, name: '限时特价' }
]

export const labelStatus = [
  { name: '耗材订单', id: 0 },
  { name: '设备订单', id: 1 },
]
export const paymentMethods = [
  { name: '微信', id: 0 },
  { name: '支付宝', id: 1 },
  { name: '银联', id: 2 },
  { name: '线下转账', id: 3 }
]
export const isFirstOrder = [
  { name: '非首单', id: 0 },
  { name: '首单', id: 1 }
]
export const customerIdentitys = [
  { name: '内部员工', id: 0 },
  { name: '诊所员工', id: 1 },
  { name: '个人用户', id: 2 }
]
