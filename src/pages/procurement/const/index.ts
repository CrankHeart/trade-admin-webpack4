export const deliverySources = [
  { name: '仓库发货', id: 0 },
  { name: '供应商直发', id: 1 }
]
export const planStates = [
  { id: 0, name: '待提交' },
  { id: 1, name: '待入库' },
  // { id: 2, name: '待发货' },
  { id: 2, name: '部分入库' },
  { id: 3, name: '已完成' },
  { id: 4, name: '已取消' },
  { id: 5, name: '待审核' },
  { id: 6, name: '取消待审核' },
  { id: 7, name: '审核驳回' }
]

export const supplierProcessStatus = [
  { id: 1, name: '待提交' },
  { id: 2, name: '待业务部门审核' },
  { id: 3, name: '待质管部门审核' },
  { id: 4, name: '待总经理审核' },
  { id: 5, name: '审核通过' }
]


export const wareHouses = [ { id: 'LJ001', name: '上海怒江北路' } ]
export const settlementMethods = [
  // { id: 0, name: '预付款（一次性）' },
  // { id: 1, name: '预付款（分期）' },
  // { id: 2, name: '月结' }
  { id: 0, name: '现结' },
  { id: 1, name: '月结' }
]

export const invoiceTypes = [
  { id: 0, name: '增值税普通发票' },
  { id: 1, name: '增值税专用发票' }
]

export const supplierCategoryTypes = [
  { id: 1, name: '器械生产企业' },
  { id: 2, name: '器械经营企业' }
]

export const supplierType = [
  { id: 0, name: '厂家' },
  { id: 1, name: '一级经销商' },
  { id: 2, name: '国内总代' },
  { id: 3, name: '应急调货' },
  { id: 50, name: '无采购关系' }
]

export const payStates = [
  { id: 0, name: '未付款' },
  { id: 1, name: '待付尾款' },
  { id: 2, name: '待月结' },
  { id: 3, name: '已付款' }
]

export const serviceStatus = [
  { id: 10, name: '待退货' },
  { id: 11, name: '退货已出库' },
  { id: 12, name: '退货已退款' },
  { id: 19, name: '退货已完成' },
  { id: 20, name: '待退款' },
  { id: 21, name: '已退款' },
  { id: 29, name: '退款已完成' }
]

export const supplierEnables = [
  { id: 0, name: '启用' },
  { id: 1, name: '未启用' }
]

// export const serviceTypes = [
//   { id: 1, name: '退货' },
//   { id: 2, name: '退款' }
// ]
export const returnStates = [
  { id: 0, name: '处理中' },
  { id: 1, name: '待退款' },
  { id: 2, name: '已退款' }
]
// 上下架
export const salesStatus = [
  { id: 0, name: '上架 ' },
  { id: 1, name: '下架' },
  { id: 2, name: '作废' },
  { id: 3, name: '停售' }
]

export const goodsLabel = new Map( [ [ 0, '否' ], [ 1, '是' ] ] )
export const isSyncPrice = new Map( [ [ false, 0 ], [ true, 1 ] ] )
export const preferSupplier = new Map( [ [ false, 0 ], [ true, 1 ] ] )

export const supplierAddConfig = [
  { prop: 'check', label: '选择', width: '70px' },
  { prop: 'brandName', label: '品牌', width: '100px' },
  { prop: 'name', label: 'spu名称' },
  { prop: 'lcSpuCode', label: 'lc编码', width: '100px' },
  { prop: 'lcSkuCode', label: 'sku编码', width: '100px' },
  { prop: 'storeName', label: '商家', width: '100px' },
  // { prop: 'storeSkuCode', label: '自有编码', width: '100px' },
  { prop: 'sku', label: '自有编码', width: '100px' },
  { prop: 'specification', label: '规格' },
  { prop: 'unit', label: '单位', width: '80px' },
  { prop: 'price', label: '协议价格', width: '100px' }
]
export const supplierResConfig = [
  { prop: 'lcSpuCode', label: 'lc编码', width: '150px' },
  { prop: 'lcCode', label: 'sku编码', width: '150px' },
  { prop: 'spuName', label: 'spu名称', width: '200px' },
  { prop: 'specification', label: '规格', width: '300px' },
  { prop: 'preferredSupplier', label: '首选供应商', width: '120px' },
  { prop: 'agreePrice', label: '当前报价', width: '120px' },
  // { prop: 'factoryGuidePrice', label: '厂商指导价', width: '120px' },
  { prop: 'deliveryPeriod', label: '默认交期', width: '150px' },
  { prop: 'recentDelivery', label: '最近一次交期', width: '200px' },
  // { prop: 'storeSkuCode', label: '自有编码', width: '150px' },
  { prop: 'sku', label: '自有编码', width: '150px' },
  { prop: 'unit', label: '单位' },
  { prop: 'competitive', label: '常备商品', width: '100px' },
  // { prop: 'putaway', label: '是否上架', width: '100px' },
  { prop: 'goodStatus', label: '上下架', width: '100px' },
  { prop: 'recentPrice', label: '最近一次采购价', width: '150px' },
  { prop: 'lowestPrice', label: '历史最低采购价', width: '150px' },
  { prop: 'ctrl', label: '操作', width: '200px', fixed: 'right' }
]

export const procurementListConfig = [
  { prop: 'procurementSn', label: '采购单编号', width: '250px' },
  { prop: 'sourceOrderSn', label: '来源单号', width: '250px' },
  { prop: 'suppliers', label: '供应商', width: '170px' },
  { prop: 'totalAmount', label: '订单金额（元）', width: '140px' },
  { prop: 'wareHouse', label: '入库仓', width: '170px' },
  { prop: 'deliverySource', label: '发货方式', width: '170px' },
  { prop: 'planState', label: '采购状态', width: '120px' },
  { prop: 'payState', label: '付款状态', width: '120px' },
  { prop: 'createPerson', label: '采购员', width: '120px' },
  { prop: 'createDate', label: '采购日期', width: '150px' },
  { prop: 'control', label: '操作', width: '150px', fixed: 'right' }
]

/*
 * calculate ： 预测
 * oStock： 在库
 * onWay：  在途(当前sku总的在途数)
 * repNum：智能补货
 * supplyNum： 额外补货
 * oLock： 锁定
 * outStockNum： 缺货
 * number：直发采购单中的 缺货数量， 普通采购单中为0
 */

// 缺货单表格
export const deliveryTableConfig = [
  { prop: 'lcSkuCode', label: 'lc编码', width: '160px' },
  { prop: 'skuName', label: '商品信息' },
  { prop: 'specification', label: '规格' },
  { prop: 'storeSkuCode', label: '自有编码', width: '120px' },
  { prop: 'unit', label: '单位', width: '70px' },
  { prop: 'goodsLabel', label: '常备商品', width: '100px' },
  { prop: 'number', label: '缺货数量', width: '100px' }
]

// 切换供应商表格
export const supplierConfig = [
  { prop: 'supplierName', label: '供应商名称' },
  { prop: 'supplierType', label: '供应商类型' },
  { prop: 'purchaseRelation', label: '采购关系' },
  { prop: 'agreePrice', label: '报价' },
  { prop: 'lowestPrice', label: '历史最低采购价' },
  { prop: 'recentPrice', label: '最近一次采购价' },
  { prop: 'deliveryPeriod', label: '配置交期' },
  { prop: 'deliveryDate', label: '历史交期' },
  { prop: 'control', label: '操作' }
]

// * 待盘点计划表格
export const toBeCountedConfig = [
  { prop: 'planNo', label: '计划编号', width: '160px' },
  { prop: 'startAndEndDate', label: '时间周期', width: '300px' },
  { prop: 'planName', label: '计划名称', width: '160px' },
  { prop: 'deliveryCompletionRate', label: '交付完成率', width: '120px' },
  { prop: 'deliveryTimelyRate', label: '交付及时率', width: '120px' },
  { prop: 'control', label: '操作', width: '100px' }
]
// * 历史计划表格
export const historyPlanConfig = [
  { prop: 'planNo', label: '计划编号', width: '160px' },
  { prop: 'startAndEndDate', label: '时间周期', width: '300px' },
  { prop: 'planName', label: '计划名称', width: '160px' },
  { prop: 'deliveryCompletionRate', label: '交付完成率', width: '120px' },
  { prop: 'deliveryTimelyRate', label: '交付及时率', width: '120px' },
  { prop: 'control', label: '操作', width: '100px' }
]

// * 未开始计划详情表格
export const unStartedPlanDetailsConfig = [
  { prop: 'lcSkuCode', label: 'LC编码', width: '160px' },
  { prop: 'skuName', label: '商品名称', width: '200px' },
  { prop: 'specification', label: '规格', width: '110px' },
  { prop: 'storeSkuCode', label: '自有编码', width: '120px' },
  { prop: 'unit', label: '单位', width: '70px' },
  { prop: 'taskGapNum', label: '任务缺口数量', width: '100px' },
  { prop: 'taskYingYu', label: '任务盈余数量', width: '100px' },
  { prop: 'calculateNum', label: '30天预测销量', width: '100px' },
  { prop: 'currDeliveryDetails', label: '当前交付情况', width: '120px', fixed: 'right' },
  { prop: 'deliveryDate', label: '交付日期', width: '120px' },
  { prop: 'recommendPurchaseNum', label: '推荐采购数', width: '120px' },
  { prop: 'purchaseNum', label: '实际采购数', width: '120px' },
  { prop: 'changeReasons', label: '变更原因', width: '180px' },
  { prop: 'buyerName', label: '采购员', width: '180px' },
  { prop: 'control', label: '操作', width: '120px' }
]

// 额外采购计划 (这个跟未开始计划详情表格就差两个字段不一样,skuName:name,recommendPurchaseNum:outPlanRecommend)
export const orderSkuExtTableConfig = [
  { prop: 'lcSkuCode', label: 'LC编码', width: '200px' },
  { prop: 'name', label: '商品名称', width: '200px' },
  { prop: 'specification', label: '规格', width: '120px' },
  { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
  { prop: 'unit', label: '单位', width: '100px' },
  { prop: 'taskGapNum', label: '任务缺口数量', width: '100px' },
  { prop: 'taskYingYu', label: '任务盈余数量', width: '100px' },
  { prop: 'calculateNum', label: '30天预测销量', width: '100px' },
  { prop: 'currDeliveryDetails', label: '当前交付情况', width: '120px', fixed: 'right' },
  { prop: 'deliveryDate', label: '交付日期', width: '120px' },
  { prop: 'recommendNum', label: '推荐采购数', width: '120px' },
  { prop: 'purchaseNum', label: '实际采购数', width: '120px' },
  { prop: 'changeReasons', label: '变更原因', width: '180px' },
  { prop: 'buyerName', label: '负责买手', width: '150px' },
  { prop: 'control', label: '操作', width: '65px', fixed: 'right' }
]

// * 进行中计划详情表格
export const ongoingPlanDetailsConfig = [
  { prop: 'lcSkuCode', label: 'LC编码', width: '160px' },
  { prop: 'skuName', label: '商品名称', width: '200px' },
  { prop: 'specification', label: '规格', width: '110px' },
  { prop: 'storeSkuCode', label: '自有编码', width: '120px' },
  { prop: 'goodLabel', label: '是否常备', width: '120px' },
  { prop: 'unit', label: '单位', width: '70px' },
  { prop: 'currDeliveryDetails', label: '当前交付情况', width: '160px' },
  { prop: 'deliveryResult', label: '交付风险', width: '150px' },
  { prop: 'purchasePlanNum', label: '计划采购数', width: '400px' },
  { prop: 'control', label: '操作', width: '120px' }
]
// * 待盘点和已结束计划详情表格
export const endPlanDetailsConfig = [
  { prop: 'lcSkuCode', label: 'LC编码', width: '160px' },
  { prop: 'skuName', label: '商品名称', width: '200px' },
  { prop: 'specification', label: '规格', width: '110px' },
  { prop: 'storeSkuCode', label: '自有编码', width: '120px' },
  { prop: 'unit', label: '单位', width: '70px' },
  { prop: 'currDeliveryDetails', label: '交付结果快照', width: '160px' },
  { prop: 'deliveryResult', label: '交付结果', width: '150px' },
  { prop: 'purchasePlanNum', label: '计划采购数', width: '120px' },
  { prop: 'storedNum', label: '实际入库数', width: '120px' },
  { prop: 'inventoryRemarks', label: '盘点原因', width: '200px' }
]
export const serviceTypes = [
  { id: 1, name: '已入库物品退货' }, // 退货
  { id: 2, name: '未入库物品退货' } // 退款
]
// 采购退货商品类型：0-正品，1-临期，2-次品
export const skuTypes = [ // 退货库存类型
  { id: 0, name: '正品' },
  { id: 1, name: '临期' },
  { id: 2, name: '次品' }
]
// 退换货的出库状态
export const returnStatuses = [
  { id: 0, name: '待出库' },
  { id: 1, name: '已完成' },
  { id: 2, name: '已取消' }
]
// 退换货的结算状态
export const settleStatuses = [
  { id: 0, name: '未结算' },
  { id: 1, name: '已结算' }
]
export const credentialsTypes = [
  { name: '公司三证', id: 1 },
  { name: '一般纳税人证明', id: 2 },
  { name: '生产许可证（厂家）', id: 3 },
  { name: '医疗器械经营许可证', id: 4 },
  { name: '消毒产品生产企业卫生许可证', id: 5 },
  { name: '辐射安全证', id: 6 }
]
export const businessTypes = [
  {
    name: '进货',
    id: 1,
    deliveryStatus: [
      { name: '待入库', id: 1 },
      { name: '部分入库', id: 2 },
      { name: '已完成', id: 3 }
    ]
  },
  {
    name: '退货',
    id: 2,
    deliveryStatus: [ { name: '待出库', id: 0 }, { name: '已完成', id: 1 } ]
  }
]
export const accountSettlementMethods = [
  { name: '预付款（一次性）', id: 0 },
  { name: '预付款（分期）', id: 1 },
  { name: '月结', id: 2 }
]
// 交付风险
export const riskLevels = [
  { name: '交付不足风险', id: 1 },
  { name: '交付延期风险', id: 2 },
  { name: '无交付风险', id: 3 },
  { name: '已交付', id: 4 }
]
// 交付结果
export const deliveryResults = [
  { name: '交付不足', id: 1 },
  { name: '交付延期', id: 2 },
  { name: '交付过量', id: 3 },
  { name: '完成交付', id: 4 }
]
// 交付风险
export const metaTypes = [
  { name: '计划内任务', id: 1 },
  { name: '计划外任务', id: 2 },
  { name: '订购任务', id: 3 },
  { name: '锁定', id: 99 },
  { name: '实际库存(可销售)', id: 100 }
]

// * 采购计划状态
export const purchasePlanStatus = [
  { name: '未开始', id: 1 },
  { name: '进行中', id: 2 },
  { name: '待盘点', id: 3 },
  { name: '已结束', id: 4 }
]

// * 交付的需求类型
export const requireTypes = [
  { name: '订购', id: 0 }
]

// * 交付的供应状态（进度）
export const supplyStates = [
  { name: '采购中', id: 0 },
  { name: '锁定', id: 99 }
]