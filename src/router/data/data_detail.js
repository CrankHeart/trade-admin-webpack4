module.exports = [ {
  name: '商品详情',
  permission: '459',
  // require: '商品维护',
  path: '/product/detail/:id',
  component: () => import( '@/pages/product/detail.vue' )
},
{
  name: '商家详情',
  permission: '478',
  // require: '商家管理',
  path: '/business/detail/:id',
  component: () => import( '@/pages/business/detail.vue' )
},
{
  name: '订单详情',
  permission: '461',
  // require: '订单查询',
  path: '/order/detail/:sn',
  component: () => import( '@/pages/order/detail.vue' )
},
{
  name: '促销详情',
  permission: '462',
  // require: '促销列表',
  path: '/promotion/detail/:discountId',
  component: () => import( '@/pages/promotion/detail.vue' )
},
{
  name: '编辑供应商',
  permission: '692',
  // require: '供应商管理',
  path: '/procurement/editSupplier/:id',
  component: () => import( '@/pages/procurement/editSupplierInfo.vue' )
},
{
  name: '新建供应商',
  permission: '416',
  // require: '供应商管理',
  path: '/procurement/createSupplier',
  component: () => import( '@/pages/procurement/createSupplier.vue' )
},
{
  name: '供应商详情',
  permission: '468',
  // require: '供应商管理',
  path: '/procurement/supplierDetail/:id',
  component: () => import( '@/pages/procurement/supplierDetail.vue' )
},

{
  name: '券码详情',
  permission: '463',
  // require: '券码列表',
  path: '/coupon/detail/:id',
  component: () => import( '@/pages/coupon/detail.vue' )
},
{
  name: '编辑采购单',
  permission: '465',
  // require: '采购列表',
  path: '/procurement/edit/:procurementSn',
  component: () => import( '@/pages/procurement/editProcurement.vue' )
},
// {
//   name: '新建采购单',
//   permission: '492',
//   path: '/procurement/create',
//   component: () => import( '@/pages/procurement/editProcurement.vue' )
// },
{
  name: '新建计划',
  permission: '486',
  // require: '采购列表',
  path: '/procurement/createPurchasingPlan',
  component: () => import( '@/pages/procurement/createPurchasingPlan.vue' )
},
{
  name: '新建普通采购单',
  permission: '486',
  // require: '采购列表',
  path: '/procurement/commomProcurement',
  component: () => import( '@/pages/procurement/createCommonProcurement.vue' )
},
{
  name: '新建直发采购单',
  permission: '631',
  // require: '采购列表',
  path: '/procurement/directlyProcurement',
  component: () => import( '@/pages/procurement/createDirectlyProcurement.vue' )
},
{
  name: '采购单详情',
  permission: '466',
  // require: '采购列表',
  path: '/procurement/detail/:procurementSn',
  component: () => import( '@/pages/procurement/detailProcurement.vue' )
},
{
  name: '直发采购单',
  // require: '采购列表',
  path: '/procurement/supplierProcurement',
  component: () => import( '@/pages/procurement/createDirectlyProcurement.vue' )
},
{
  name: '采购计划详情',
  permission: process.env.NODE_ENV === 'production' ? '1145' : '1148',
  // require: '采购列表',
  path: '/procurement/purchasingPlanDetails',
  component: () => import( '@/pages/procurement/purchasingPlanDetails.vue' )
},
{
  name: '采购退货详情',
  permission: process.env.NODE_ENV === 'production' ? '1280' : '1296',
  path: '/procurement/returnGoodsDetail',
  component: () => import( '@/pages/procurement/returnGoods/detail.vue' )
},
// {
//   name: '采购换货详情',
//   permission: process.env.NODE_ENV === 'production' ? '1290' : '1301',
//   path: '/procurement/changeGoodsDetail',
//   component: () => import( '@/pages/procurement/changeGoods/detail.vue' )
// },
{
  name: '预留锁定库存详情',
  permission: process.env.NODE_ENV === 'production' ? '1145' : '1148',
  path: '/warehouse/stockTotalDetail',
  component: () => import( '@/pages/warehouse/stockTotal/detail.vue' )
},
{
  name: '用户画像详情',
  permission: '469',
  // require: '用户画像',
  path: '/vip/portrait/detail/:id',
  component: () => import( '@/pages/vip/portraitDetail.vue' )
},
{
  name: '活动详情',
  permission: '464',
  // require: '活动列表',
  path: '/themeEvent/:id',
  component: () => import( '@/pages/themeEvent/themeEventCreate.vue' )
},
{
  name: '在册商品详情',
  permission: '494',
  // require: '活动列表',
  path: '/themeEvent/productDetail/:id',
  component: () => import( '@/pages/book/productDetail.vue' )
},
// {
//   name: '核对订单详情',
//   permission: '472',
//   // require: '服务中心',
//   path: '/server/checkOrder/detail/:orderSn',
//   component: () => import('@/pages/server/checkOrderDetail.vue')
// },
{
  name: '对账单详情',
  permission: '472',
  path: '/server/statementDetail/:id',
  component: () => import( '@/pages/server/statementDetail.vue' )
},
{
  name: '编辑运费模板',
  permission: '480',
  // require: '物流管理',
  path: '/freight/edit/:id',
  component: () => import( '@/pages/freight/edit.vue' )
},
{
  name: '查看运费模板',
  permission: '473',
  // require: '物流管理',
  path: '/freight/detail/:id',
  component: () => import( '@/pages/freight/detail.vue' )
},
{
  name: '新增运费模板',
  permission: '470',
  // require: '物流管理',
  path: '/freight/create',
  component: () => import( '@/pages/freight/create.vue' )
},
{
  name: '标品管理详情',
  permission: '460',
  // require: '标品管理',
  path: '/product/standardDetail/:id',
  component: () => import( '@/pages/product/standardDetail.vue' )
},
{
  name: '报价详情',
  permission: '442',
  // require: '大客户报价',
  path: '/vip/quoteDetail/:id',
  component: () => import( '@/pages/vip/quoteDetail.vue' )
},
{
  name: '协议申请单审核',
  permission: '1014',
  path: '/association/audit/:applySn',
  component: () => import( '@/pages/product/associationAuditDetail.vue' )
},
{
  name: '协议申请单详情',
  permission: '1018',
  path: '/association/detail/:applySn',
  component: () => import( '@/pages/product/associationAuditDetail.vue' )
},
{
  name: '客户申请采购协议价',
  // permission: '1018',
  path: '/vip/quoteDetailCustomerApply/',
  component: () => import( '@/pages/vip/quoteDetailCustomerApply.vue' )
},
/** 内容管理系统路由 */
{
  name: '内容页编辑',
  permission: '1135',
  path: '/article/edit/:id',
  component: () => import( '@/pages/article/edit.vue' )
},
{
  name: '内容页新增',
  permission: '1137',
  path: '/article/create',
  component: () => import( '@/pages/article/create.vue' )
},
{
  name: '内容页详情',
  permission: '1136',
  path: '/article/detail/:id',
  component: () => import( '@/pages/article/detail.vue' )
},
{
  name: 'bms新建报价单',
  // permission: '1136',
  path: '/bmsQuote/apply',
  component: () => import( '@/pages/bmsQuote/bmsQuoteApply.vue' )
},
{
  name: 'bms报价单像详情',
  // permission: '1136',
  path: '/bmsQuote/detail',
  component: () => import( '@/pages/bmsQuote/bmsQuoteDetail.vue' )
},
{
  name: 'bms协议价',
  path: '/bmsAssociation',
  component: () => import( '@/pages/product/bmsAssociation.vue' )
},
{
  name: '计划外采购任务',
  permission: process.env.NODE_ENV === 'production' ? '1162' : '1165',
  path: '/procurement/buyingRequirementExt',
  component: () => import( '@/pages/procurement/buyingRequirementExt.vue' )
},
{
  name: '供应商审核',
  path: '/procurement/supplierConfirm',
  component: () => import( '@/pages/procurement/supplierConfirm.vue' )
},
{
  name: '客户应收欠款详情',
  path: '/receivable/customerReceivables/:id',
  component: () => import( '@/pages/receivable/customerReceivables.vue' )
},
{
  name: '新建付款凭证',
  path: '/receivable/searchPayment',
  component: () => import( '@/pages/receivable/searchPayment.vue' )
},
{
  name: '提交退款申请',
  path: '/receivable/submitRefundApply',
  component: () => import( '@/pages/receivable/submitRefundApply.vue' )
}]
