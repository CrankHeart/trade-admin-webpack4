export const erpMonitorType = [
  { id: 0, name: '出入库单' },
  { id: 1, name: '应收单' },
  { id: 2, name: '订单' },
  { id: 3, name: '商品' },
  { id: 4, name: '供应商' },
  { id: 5, name: '业务员' }
]

export const erpMonitorStatus = [
  { id: 0, name: '推送失败' },
  { id: 1, name: '已推送' },
  { id: 2, name: '回调成功' },
  { id: 3, name: '回调失败' },
]

export const saasMonitorType = [
  { id: 0, name: '订单' },
  { id: 1, name: '支付单' },
  { id: 2, name: '服务单' },
  { id: 3, name: '对账单' }
]

export const saasMonitorStatus = [
  { id: 0, name: '推送失败' },
  { id: 1, name: '推送成功' },
  { id: 2, name: '已处理' }
]

export const operateTypes = [
  { id: 1, name: '增加' },
  { id: 2, name: '删除' },
  { id: 3, name: '修改' },
  { id: 4, name: '查询' }
]

export const modules = [
  { id: 1, name: '商品维护' },
  { id: 2, name: '协议商品' },
  { id: 3, name: '商家管理' },
  { id: 4, name: '品牌管理' },
  { id: 5, name: '订单管理' },
  { id: 6, name: '发票管理' },
  { id: 7, name: '付款凭证' },
  { id: 8, name: '促销管理' },
  { id: 9, name: '券码管理' },
  { id: 10, name: '主题活动' },
  { id: 11, name: '供应商管理' },
  { id: 12, name: '采购下单' },
  { id: 13, name: '采购退货' },
  { id: 14, name: '仓库管理' },
  { id: 15, name: '页面管理' },
  { id: 16, name: '客户管理' },
  { id: 17, name: '地推优惠' },
  { id: 18, name: '运费模板' },
  { id: 19, name: '服务单管理' },
  { id: 20, name: '对账单管理' },
  { id: 21, name: '系统中心' },
  { id: 22, name: '日志管理' },
  { id: 23, name: '支付模块' },
  { id: 24, name: '购物车' },
  { id: 25, name: 'WMS' },
  { id: 26, name: '消息中心' },
  { id: 27, name: '用户中心' },
  { id: 28, name: '工具类' },
  { id: 29, name: '财务系统' },
  { id: 30, name: '分期付款' },
  { id: 31, name: '内容管理' },
  { id: 32, name: '采购计划' },
  { id: 33, name: '数据中心' },
  { id: 34, name: '异步job操作' },
  { id: 35, name: '应收单' },
  { id: 36, name: '付款单' },
  { id: 37, name: '金蝶数据同步接口' },
  { id: 38, name: '采购需求' },
  { id: 39, name: '采购任务' },
  { id: 40, name: '采购单' }
]

export const logLevels = [
  { id: 1, name: 'INFO' },
  { id: 2, name: 'WARN' },
  { id: 3, name: 'ERROR' },
  { id: 4, name: 'DEBUG' }
]
export const invoiceOperateTypes = [
  { id: 1, name: '开票' },
  { id: 2, name: '红冲' },
  { id: 3, name: '查询' }
]
export const invoiceOperateStatus = [
  { id: 0, name: '失败' },
  { id: 1, name: '成功' },
]
export const stockTypes = [
  { id: 0, name: '虚拟库存' },
  { id: 1, name: '真实库存' }
]
export const stockStatus = [
  { id: 0, name: '临期' },
  { id: 1, name: '正品' }
]
// 入库回传/出库回传/库存同步（真实库存），下单锁定/入库回传/预留锁定/订单取消（虚拟库存）
export const changeReasons = [
  { id: 1, name: '入库回传' },
  { id: 2, name: '采购退货出库回传' },
  { id: 3, name: '订单出库回传' },
  { id: 4, name: '订单生成虚拟库存变化' },
  { id: 5, name: '同步库存' },
  { id: 6, name: '取消订单虚拟库存变化' },
  { id: 7, name: '锁定库存时虚拟库存变化' },
  { id: 8, name: '采购退货时虚拟库存变化' },
  { id: 9, name: '取消缺货单虚拟库存变化' },
  { id: 10, name: '退款缺货单虚拟库存变化' },
  { id: 11, name: '换货服务单虚拟库存变化' },
  { id: 12, name: '换货服务单被拒绝虚拟库存变化' },
  { id: 13, name: '退款服务单虚拟库存变化' },
  { id: 14, name: '采购退货取消时虚拟库存变化' },
  { id: 15, name: '换货服务单出库回传' }
]

export const kingdeeInterfaces = [
  { id: 0, name: '客户' },
  { id: 1, name: '物料' },
  { id: 2, name: '部门' },
  { id: 3, name: '员工' },
  { id: 4, name: '销售出库' },
  { id: 5, name: '销售退货' },
  { id: 6, name: '应收单' },
  { id: 7, name: '收款单' },
  { id: 8, name: '退款单' },
  { id: 9, name: '其他应付单' }
]