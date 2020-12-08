module.exports = [ {
  name: '数据中心',
  icon: 'tuxing',
  permission: '379',
  children: [ {
    name: '交易数据',
    isHome: true,
    permission: '392',
    path: '/data/gmv',
    component: () => import( '@/pages/data/gmv.vue' )
  },
  {
    name: '企业数据',
    permission: '393',
    path: '/data/tenant',
    component: () => import( '@/pages/data/tenant.vue' )
  },
  // {
  //   name: '商品数据',
  //   path: '/data/product',
  //   component: () => import( '@/pages/data/product.vue' )
  // },
  // {
  //   name: '企业数据',
  //   path: '/data/office',
  //   component: () => import( '@/pages/data/office.vue' )
  // },
  {
    name: '商品数据',
    permission: '394',
    path: '/data/product',
    component: () => import( '@/pages/data/product.vue' )
  },
  {
    name: '活动看板',
    permission: '681',
    path: '/data/operator',
    component: () => import( '@/pages/data/operator.vue' )
  },
  {
    name: '虚拟sku看板',
    permission: '761',
    path: '/data/virtualSkuBoard',
    component: () => import( '@/pages/data/virtualSkuBoard.vue' )
  }
  ]
},
{
  name: '商品管理',
  icon: 'shangpin',
  permission: '380',
  children: [ {
    name: '批量导入',
    permission: '395',
    path: '/product/import',
    component: () => import( '@/pages/product/import.vue' )
  },
  {
    name: '商品维护',
    isHome: true,
    permission: '396',
    path: '/product/maintain',
    component: () => import( '@/pages/product/maintain.vue' )
  },
  {
    name: '商品定价',
    permission: process.env.NODE_ENV === 'production' ? '1246' : '1250',
    path: '/product/setPrice',
    component: () => import( '@/pages/product/setPrice.vue' )
  },
  {
    name: '协议商品',
    permission: '397',
    path: '/product/association',
    component: () => import( '@/pages/product/association.vue' )
  },
  {
    name: '标品管理',
    permission: '436',
    path: '/product/standard',
    component: () => import( '@/pages/product/standard.vue' )
  },
  {
    name: '商品分期',
    permission: '1126',
    path: '/product/instalment',
    component: () => import( '@/pages/product/instalment.vue' )
  }
  ]
},
{
  name: '商家管理',
  icon: 'shangjia',
  permission: '381',
  children: [ {
    name: '商家列表',
    isHome: true,
    permission: '435',
    path: '/business/business',
    component: () => import( '@/pages/business/business.vue' )
  },
  {
    name: '品牌管理',
    permission: '398',
    path: '/business/brands',
    component: () => import( '@/pages/business/brands.vue' )
  }
  ]
},
{
  name: '订单管理',
  icon: 'dingdan',
  permission: '382',
  children: [ {
    name: '订单查询',
    isHome: true,
    permission: '390',
    path: '/order/search',
    component: () => import( '@/pages/order/search.vue' )
  },
  {
    name: '订单配货表',
    permission: '1099',
    path: '/order/distribute',
    component: () => import( '@/pages/order/orderDistribute.vue' )
  },
  {
    name: '地推优惠申请',
    permission: process.env.NODE_ENV === 'production' ? '1175' : '1179',
    path: '/vip/groundDiscountApply',
    component: () => import( '@/pages/vip/groundDiscountApply.vue' )
  },
  {
    name: '地推优惠配置',
    permission: process.env.NODE_ENV === 'production' ? '1179' : '1183',
    path: '/vip/groundDiscountConfigList',
    component: () => import( '@/pages/vip/groundDiscountConfigList.vue' )
  }
    // {
    //   name: '发票管理',
    //   permission: '391',
    //   path: '/order/invoice',
    //   component: () => import('@/pages/order/invoice.vue')
    // }
    // {
    //   name: '付款凭证列表',
    //   permission: '993',
    //   path: '/order/paymentVoucherList',
    //   component: () => import('@/pages/order/paymentVoucherList.vue')
    // }
  ]
},
{
  name: '清结算中心',
  icon: 'qian',
  permission: process.env.NODE_ENV === 'production' ? '1182' : '1186',
  children: [ {
    name: '客户应收欠款',
    permission: process.env.NODE_ENV === 'production' ? '1199' : '1203',
    isHome: true,
    path: '/receivable/receivableArrears',
    component: () => import( '@/pages/receivable/receivableArrears.vue' )
  },
  {
    name: '客户资金流水',
    permission: process.env.NODE_ENV === 'production' ? '1205' : '1209',
    path: '/receivable/customerSettlement',
    component: () => import( '@/pages/receivable/customerSettlement.vue' )
  },
  {
    name: '对账单管理',
    permission: process.env.NODE_ENV === 'production' ? '1204' : '1208',
    path: '/server/accountManage',
    component: () => import( '@/pages/server/accountManage.vue' )
  },
  {
    name: '发票管理',
    permission: process.env.NODE_ENV === 'production' ? '1183' : '1187',
    path: '/invoice/manage',
    component: () => import( '@/pages/invoice/invoiceManage.vue' )
  }
  ]
},
{
  name: '促销管理',
  permission: '383',
  icon: 'cuxiao',
  children: [ {
    name: '促销列表',
    permission: '399',
    isHome: true,
    path: '/promotion/list',
    component: () => import( '@/pages/promotion/list.vue' )
  },
  {
    name: '促销创建',
    permission: '400',
    path: '/promotion/create',
    component: () => import( '@/pages/promotion/create.vue' )
  }
  ]
},
{
  name: '券码管理',
  icon: 'quan',
  permission: '384',
  children: [ {
    name: '券码列表',
    permission: '401',
    isHome: true,
    path: '/coupon/list',
    component: () => import( '@/pages/coupon/list.vue' )
  },
  {
    name: '券码创建',
    permission: '402',
    path: '/coupon/create',
    component: () => import( '@/pages/coupon/create.vue' )
  }
  ]
},
{
  name: '主题活动',
  permission: '423',
  icon: 'huodong',
  children: [ {
    name: '活动列表',
    permission: '424',
    isHome: true,
    path: '/themeEvent/themeEventList',
    component: () => import( '@/pages/themeEvent/themeEventList.vue' )
  },
  {
    name: '创建活动',
    permission: '425',
    path: '/themeEvent/themeEventCreate',
    component: () => import( '@/pages/themeEvent/themeEventCreate.vue' )
  },
  {
    name: '商品目录册',
    permission: '682',
    path: '/book/productCatalogue',
    component: () => import( '@/pages/book/productCatalogue.vue' )
  }
  ]
},
{
  name: '采购中心',
  icon: 'caigou',
  permission: '411',
  children: [
    // {
    //   name: '补货助手',
    //   permission: '444',
    //   path: '/procurement/refillGoods',
    //   component: () => import('@/pages/procurement/refillGoods.vue')
    // },
    {
      name: '采购需求',
      permission: process.env.NODE_ENV === 'production' ? '1158' : '1162',
      path: '/procurement/buyingRequirement',
      component: () => import( '@/pages/procurement/buyingRequirement.vue' )
    },
    {
      name: '采购计划',
      permission: process.env.NODE_ENV === 'production' ? '1143' : '1146',
      path: '/procurement/purchasingPlanTypeList',
      component: () => import( '@/pages/procurement/purchasingPlanTypeList.vue' )
    },
    {
      name: '采购任务',
      permission: process.env.NODE_ENV === 'production' ? '1148' : '1150',
      path: '/procurement/purchasingTasks',
      component: () => import( '@/pages/procurement/purchasingTasks.vue' )
    },
    {
      name: '采购单列表',
      permission: '412',
      isHome: true,
      path: '/procurement/list',
      component: () => import( '@/pages/procurement/list.vue' )
    },
    {
      name: '采购退货单',
      permission: process.env.NODE_ENV === 'production' ? '1279' : '1290',
      path: '/procurement/procurementReturn',
      component: () => import( '@/pages/procurement/returnGoods/list.vue' )
    },
    // {
    //   name: '采购换货单',
    //   permission: process.env.NODE_ENV === 'production' ? '1289' : '1300',
    //   path: '/procurement/procurementChange',
    //   component: () => import( '@/pages/procurement/changeGoods/list.vue' )
    // },
    {
      name: '供应商管理',
      permission: '430',
      path: '/procurement/supplier',
      component: () => import( '@/pages/procurement/supplier.vue' )
    },
    {
      name: '仓库管理',
      permission: '760',
      path: '/procurement/wareHouse',
      component: () => import( '@/pages/procurement/wareHouses.vue' )
    },
    {
      name: '采购分配规则',
      permission: process.env.NODE_ENV === 'production' ? '1265' : '1274',
      path: '/procurement/distributionRules',
      component: () => import( '@/pages/procurement/distributionRules.vue' )
    }
  ]
},
// {
//   "name": "仓配管理",
//   "permission": "389",
//   "icon": "cangku",
//   "children": [ {
//       "name": "库存总表",
//       "permission": "407",
//       "isHome": true,
//       "path": "/warehouse/stockTotal",
//       "component": () => import( '@/pages/warehouse/stockTotal/list.vue' )
//     },
//     {
//       "name": "库存明细表",
//       "permission": "408",
//       "path": "/warehouse/stockDetail",
//       "component": () => import( '@/pages/warehouse/stockDetail/list.vue' )
//     },
//     {
//       "name": "入库记录",
//       "permission": "409",
//       "path": "/warehouse/inHouseHistory",
//       "component": () => import( '@/pages/warehouse/inHouseHistory/list.vue' )
//     },
//     {
//       "name": "出库记录",
//       "permission": "489",
//       "path": "/warehouse/outHouseHistory",
//       "component": () => import( '@/pages/warehouse/outHouseHistory/list.vue' )
//     }
//   ]
// },
{
  name: '用户触达',
  permission: '385',
  icon: 'chuda',
  children: [ {
    name: '找货助手',
    permission: '403',
    isHome: true,
    path: '/helper/findGoods',
    component: () => import( '@/pages/helper/findGoods.vue' )
  } ]
},
{
  name: '页面管理',
  permission: '386',
  icon: 'yemian',
  children: [ {
    name: 'banner管理',
    permission: '405',
    isHome: true,
    path: '/page/banner',
    component: () => import( '@/pages/page/banner.vue' )
  },
  {
    name: '内容页列表',
    permission: process.env.NODE_ENV === 'production' ? '1134' : '1131',
    path: '/article/lists',
    component: () => import( '@/pages/article/lists.vue' )
  }
  ]
},
{
  name: '客户中心',
  permission: '387',
  icon: 'yonghu',
  children: [ {
    name: '用户画像',
    permission: '418',
    isHome: true,
    path: '/vip/portrait/list',
    component: () => import( '@/pages/vip/portraitList.vue' )
  },
    // {
    //   name: '大客户报价',
    //   permission: '441',
    //   path: '/vip/quoteList',
    //   component: () => import( '@/pages/vip/quoteList.vue' )
    // },
    // {
    //   name: '地推优惠申请',
    //   permission: '437',
    //   path: '/vip/groundDiscountApply',
    //   component: () => import( '@/pages/vip/groundDiscountApply.vue' )
    // },
    // {
    //   name: '地推优惠配置',
    //   permission: '1042',
    //   path: '/vip/groundDiscountConfigList',
    //   component: () => import( '@/pages/vip/groundDiscountConfigList.vue' )
    // }
    // {
    //   name: '协议价申请',
    //   permission: '438',
    //   path: '/vip/skuAgreePriceApply',
    //   component: () => import( '@/pages/vip/skuAgreePriceApply' )
    // }
  ]
},
{
  name: '物流管理',
  permission: '428',
  icon: 'wuliu',
  children: [ {
    name: '运费模板',
    permission: '429',
    isHome: true,
    path: '/freight/list',
    component: () => import( '@/pages/freight/list.vue' )
  }
    // {
    //   name: '运费查询',
    //   path: '/freight/query',
    //   component: () => import( '@/pages/freight/query.vue' )
    // }
  ]
},
{
  name: '服务中心',
  permission: '388',
  icon: 'fuwu',
  children: [ {
    name: '服务单',
    permission: '406',
    isHome: true,
    path: '/server/refunding',
    component: () => import( '@/pages/server/refunding.vue' )
  },
    // {
    //   name: '核对订单列表',
    //   permission: '426',
    //   path: '/server/checkOrderList',
    //   component: () => import('@/pages/server/checkOrderList.vue')
    // },
    // {
    //   name: '按订单对账',
    //   permission: process.env.NODE_ENV == 'production' ? '1172' : '1176',
    //   path: '/server/orderAccount',
    //   component: () => import( '@/pages/server/orderAccount.vue' )
    // },
    // {
    //   name: '按出库单对账',
    //   permission: process.env.NODE_ENV == 'production' ? '1169' : '1173',
    //   path: '/server/deliveryAccount',
    //   component: () => import( '@/pages/server/deliveryAccount.vue' )
    // },
    // {
    //   name: '月结客户对账',
    //   permission: '426',
    //   path: '/server/monthCustomerAccount',
    //   component: () => import( '@/pages/server/monthCustomerAccount.vue' )
    // },
    // {
    //   name: '托管商家对账',
    //   permission: process.env.NODE_ENV == 'production' ? '1131' : '1132',
    //   path: '/server/trusteeshipAccount',
    //   component: () => import( '@/pages/server/trusteeshipAccount.vue' )
    // },
    // {
    //   name: '客户线下付款',
    //   permission: '1066',
    //   path: '/server/paymentVoucherList',
    //   component: () => import( '@/pages/server/paymentVoucherList.vue' )
    // }
    // 纸质发票路由去掉了
    // {
    //   name: '开具纸质发票',
    //   permission: '1076',
    //   path: '/server/paperInvoiceList',
    //   component: () => import( '@/pages/server/paperInvoiceList.vue' )
    // }
  ]
},
{
  name: '消息中心',
  permission: '419',
  icon: 'message',
  children: [ {
    name: '资质提醒',
    permission: '420',
    isHome: true,
    path: '/message/aptitudeRemind',
    component: () => import( '@/pages/message/aptitudeRemind.vue' )
  },
  {
    name: '主图提醒',
    permission: '431',
    path: '/message/mainPicRemind',
    component: () => import( '@/pages/message/mainPicRemind.vue' )
  },
  {
    name: '限时未付款提醒',
    permission: '432',
    path: '/message/nonPaymentRemind',
    component: () => import( '@/pages/message/nonPaymentRemind.vue' )
  },
  {
    name: '价格倒挂提醒',
    permission: '433',
    path: '/message/priceInversionRemind',
    component: () => import( '@/pages/message/priceInversionRemind.vue' )
  },
  {
    name: '折扣率异常提醒',
    permission: '434',
    path: '/message/abnormalDiscountRateRemind',
    component: () => import( '@/pages/message/abnormalDiscountRateRemind.vue' )
  },
  {
    name: '今日活动过期提醒',
    permission: '667',
    path: '/message/activityExpired',
    component: () => import( '@/pages/message/activityExpired.vue' )
  },
  {
    name: '缺货提醒',
    permission: '758',
    path: '/message/outStockRemind',
    component: () => import( '@/pages/message/outStockRemind.vue' )
  },
  {
    name: '临期库存提醒',
    permission: '759',
    path: '/message/expireStockRemind',
    component: () => import( '@/pages/message/expireStockRemind.vue' )
  },
  {
    name: '待发货订单提醒',
    permission: '1097',
    path: '/message/unfilledOrder',
    component: () => import( '@/pages/message/unfilledOrder.vue' )
  },
  {
    name: '待处理服务单提醒',
    permission: '1098',
    path: '/message/unprocessedServiceOrder',
    component: () => import( '@/pages/message/unprocessedServiceOrder.vue' )
  }
  ]
},
{
  name: '调度中心',
  permission: '1035',
  icon: 'diaodu',
  children: [
    // 下边的内容是内嵌的调度中心的东西. 每次新增 二级菜单的时候需要新增权限
    {
      // 管理员和商户都可访问
      name: '调度任务',
      permission: '1036',
      isHome: true,
      path: '/dispatch/task',
      component: () => import( '@/pages/dispatch/dispatch.vue' )
    },
    {
      // 管理员和商户都可访问
      name: '终端管理',
      permission: '1037',
      path: '/dispatch/terminal',
      component: () => import( '@/pages/dispatch/dispatch.vue' )
    },
    {
      // 管理员和商户都可访问
      name: '前置仓管理',
      permission: '1038',
      path: '/dispatch/warehouse',
      component: () => import( '@/pages/dispatch/dispatch.vue' )
    },
    {
      // 仅管理员可访问
      name: '寄售商家管理',
      permission: '1039',
      path: '/dispatch/store',
      component: () => import( '@/pages/dispatch/dispatch.vue' )
    }
  ]
},
{
  name: '监控中心',
  permission: '421',
  icon: 'jiankong',
  children: [ {
    name: 'erp监控',
    permission: '422',
    isHome: true,
    path: '/monitor/erpMonitor',
    component: () => import( '@/pages/monitor/erpMonitor.vue' )
  },
  {
    name: 'saas推送监控',
    permission: '427',
    path: '/monitor/saasPushMonitor',
    component: () => import( '@/pages/monitor/saasPushMonitor.vue' )
  },
  // {
  //   name: '日志查询',
  //   permission: '440',
  //   path: '/monitor/userLogQuery',
  //   component: () => import( '@/pages/monitor/userLogQuery.vue' )
  // },
  {
    name: '操作日志',
    permission: '440',
    path: '/monitor/operationLog',
    component: () => import( '@/pages/monitor/operationLog.vue' )
  },
  {
    name: '库存监控',
    path: '/monitor/stockLog',
    permission: process.env.NODE_ENV == 'production' ? '1233' : '1237',
    component: () => import( '@/pages/monitor/stockLog.vue' )
  },
  {
    name: '系统日志',
    permission: '440',
    path: '/monitor/systemLog',
    component: () => import( '@/pages/monitor/systemLog.vue' )
  },
  {
    name: '发票日志',
    permission: '1116',
    path: '/monitor/invoiceLog',
    component: () => import( '@/pages/monitor/invoiceLog.vue' )
  },
  {
    name: '金蝶日志',
    permission: process.env.NODE_ENV == 'production' ? '1262' : '1271',
    path: '/monitor/kingdeeLog',
    component: () => import( '@/pages/monitor/kingdeeLog.vue' )
  }
  ]
},
{
  name: '系统中心',
  permission: '389',
  icon: 'zhanghu',
  children: [ {
    name: '账户信息',
    permission: '407',
    isHome: true,
    path: '/user/info',
    component: () => import( '@/pages/user/info.vue' )
  },
  {
    name: '账户管理',
    permission: '408',
    path: '/user/manage',
    component: () => import( '@/pages/user/manage.vue' )
  },
  {
    name: '角色管理',
    permission: '409',
    path: '/user/role',
    component: () => import( '@/pages/user/role.vue' )
  },
  {
    name: '组织结构',
    permission: '489',
    path: '/user/group',
    component: () => import( '@/pages/user/group.vue' )
  },
  {
    name: '菜单管理',
    permission: '443',
    path: '/user/menu',
    component: () => import( '@/pages/user/menu.vue' )
  },
  // {
  //   name: '权限管理',
  //   path: '/user/permission',
  //   component: () => import( '@/pages/user/permission2.vue' )
  // },
  {
    name: '权限管理',
    permission: '410',
    path: '/user/permission',
    component: () => import( '@/pages/user/permission.vue' )
  }
  ]
}
]
