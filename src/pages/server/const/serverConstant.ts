export const serviceStatus = [
  { id: '10', name: '退货申请中' },
  { id: '12', name: '退货审核不通过' },
  { id: '11', name: '退货审核通过,待客户退货' },
  { id: '13', name: '退货处理中' },
  { id: '14', name: '待退款/退货退款' },
  { id: '15', name: '已退款/退货退款' },
  { id: '19', name: '已完成/退货退款' },
  { id: '20', name: '换货申请中' },
  { id: '21', name: '换货审核通过,待客户退货' },
  { id: '22', name: '换货审核不通过' },
  { id: '23', name: '换货处理中' },
  { id: '24', name: '待换货/退货商品不存在问题' }, // 退货商品无问题,直接从wms中完成后续操作
  { id: '25', name: '已换货' },
  { id: '26', name: '待换货/退货商品存在问题' }, // 退货商品有问题
  { id: '29', name: '换货已完成' },
  { id: '30', name: '退款申请中' }, // { id: '30', name: ' 已申请，待审批' },
  { id: '38', name: '退款审核不通过' }, // 已拒绝
  { id: '31', name: '待退款/未发货退款' },
  { id: '32', name: '已退款/未发货退款' },
  { id: '39', name: '已完成/未发货退款' }
]

export const serviceType = [
  { id: '1', name: '退货 ' },
  { id: '2', name: '换货' },
  { id: '3', name: '退款' }
]

export const serviceStatusObj = ( function () {
  let o: any = {}
  serviceStatus.forEach( status => {
    o[ status.id ] = status.name
  } )
  return o
} )()

export const serviceTypeObj = ( function () {
  let o: any = {}
  serviceType.forEach( type => {
    o[ type.id ] = type.name
  } )
  return o
} )()

// * 对账单结算状态
export const settlementStatus = [
  // { id: -1, name: '全部' },
  { id: 0, name: '未结算' },
  { id: 1, name: '部分结算' },
  { id: 2, name: '已结算' }
]
// * 对账单对账状态
export const checkStatus = [
  // { id: -1, name: '全部' },
  { id: 0, name: '未发起核对' },
  { id: 1, name: '已发起核对' },
  { id: 2, name: '已完成核对' }
]
// * 欠款类型
export const arrearsStatus = [
  { id: 0, name: '本期欠款' },
  { id: 1, name: '逾期欠款' },
  { id: 2, name: '未到期欠款' },
  { id: 3, name: '到期应核对欠款' }
]
export const receiptTypes = [
  { id: 1, name: '出库单' },
  { id: 2, name: '退库单' },
  { id: 3, name: '服务单' }
]
export const orderCheckStatus = [
  { id: 0, name: '未核对' },
  { id: 1, name: '已核对' },
  { id: 2, name: '已作废' },
  { id: 3, name: '已结算' }
]
export const statementStatus = [
  { id: 0, name: '未核对' },
  { id: 1, name: '已核对' },
  { id: 2, name: '部分结算' },
  { id: 3, name: '已结算' },
  { id: 4, name: '已作废' }
]
export const skuTypes = [ { id: 0, name: '正常' }, { id: 1, name: '临期' } ]
export const purchasePropertys = [
  { id: 0, name: '正常' },
  { id: 1, name: '赠品' },
  { id: 2, name: '试用品' }
]
export const applyTypes = [ { id: 1, name: '订单' }, { id: 2, name: '对账单' }, { id: 3, name: '服务单' }, { id: 4, name: '付款凭证' } ]
