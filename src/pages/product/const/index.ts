export const goodStatuses = [
  { name: '上架', id: 0 },
  { name: '停售', id: 3 },
  { name: '下架', id: 1 },
  { name: '作废', id: 2 }
]

export const skuLableTypes = [
  { name: '赠品', id: 0 },
  { name: '正常采购', id: 1 }
]

// 是否必须现款 0：否，1：是
export const isCashs = [
  { name: '否', id: 0 },
  { name: '是', id: 1 }
]

export const quoteStatuses = [
  { name: '异常', id: 0 },
  { name: '正常', id: 1 }
]

export const goalStatuses = [
  { name: '失效', id: 0 },
  { name: '生效', id: 1 }
]

export const associationStatuses = [
  { name: '失效', id: 0 },
  { name: '生效', id: 1 }
]

export const associationApplyTypes = [
  { id: 1, name: '商品报价工具' },
  { id: 2, name: '运营维护单' },
  { id: 3, name: '订单协议价申请单' },
  { id: 4, name: '价格申诉单' },
  { id: 5, name: '商品报价单' },
  { id: 6, name: '客户采购申请单' }
]

export const associationAuditStatuses = [
  { id: 0, prop: 'TO_BE_SUBMITTED', name: '待提交' },
  { id: 1, prop: 'TO_BE_APPROVAL', name: '待审核' },
  { id: 2, prop: 'APPROVED', name: '已审核' },
  // 以下客户采购协议价申请单状态
  { id: 3, prop: 'REFUSE_SUBMITTED', name: '拒绝申请' },
  { id: 4, prop: 'TO_BE_QUOTE', name: '待报价' },
  { id: 5, prop: 'TO_BE_CONFIRMED', name: '待确认' },
  { id: 6, prop: 'REFUSE_CONFIRMED', name: '拒绝确认' },
  { id: 7, prop: 'FINISH_QUOTE', name: '确认报价' }
]

// export const associationAuditStatuses = [
//   { name: '待审核', id: 0 },
//   { name: '已通过', id: 1 },
//   { name: '已驳回', id: 2 },
//   { name: '失效', id: 3 }
// ]

export const catalogueType = [
  { id: 0, name: '否' },
  { id: 1, name: '是' },
]

// 商品详情资质类型新增【生产厂家三证】【消毒产品生产企业卫生许可证】【其他资质】3个字段，前端可选择该字段，后端记录资质类型。
export const medicalRegistTypeStatuses = [
  { name: '医疗器械注册证', id: 0 },
  { name: '医疗器械备案凭证', id: 1 },
  { name: '消毒产品卫生安全评价报告备案凭证', id: 2 },
  { name: '生产厂家三证', id: 3 },
  { name: '消毒产品生产企业卫生许可证', id: 4 },
  { name: '其他资质', id: 5 },
  { name: '不需要资质', id: 10 }
]

export const goodLabels = [
  { name: '订购商品', id: 0 },
  { name: '常备商品', id: 1 }
]

export const whileStocksLasts = [
  { name: '否', id: 0 },
  { name: '是', id: 1 }
]
export const needAptitudes = [
  { name: '不需要', id: 0 },
  { name: '需要', id: 1 }
]
export const negotiables = [
  { name: '否', id: 0 },
  { name: '是', id: 1 }
]
export const channelTypes = [
  { name: 'e看牙SaaS', id: 'SAAS' },
  { name: 'e看牙App', id: 'APP' },
  { name: '商城小程序', id: 'SAPP' },
]

export const skuTypes = [
  { id: 0, name: '正常' },
  { id: 1, name: '大包装' },
  { id: 2, name: '套装' },
  { id: 3, name: '初始值', disabled: true },
  { id: 4, name: '临期' }
]

export const isVirtuals = [
  { id: 1, name: '正常商品' },
  { id: 2, name: '虚拟商品' }
]

export const PricingTypes = [
  { id: 1, name: 'A类' },
  { id: 2, name: 'B类' },
  { id: 3, name: 'C类' }
]

// 订购商品:0  常备商品:1
// 常备商品:1==>超卖属性: 0不允许超卖，1允许有在途时超卖，2允许超卖至在途数量，3允许任何情况下超卖
export const oversolds = [
  { id: 0, name: '不允许超卖' },
  { id: 1, name: '允许有在途时超卖' },
  { id: 2, name: '允许超卖至在途数量' },
  { id: 3, name: '允许任何情况下超卖' }
]

export const spuStandardProps = [
  { label: '商品名称', prop: 'name' },
  { label: '副标题/描述', prop: 'subtitle' },
  { label: 'LC编码', prop: 'lcCode' },
  { label: '类目', prop: 'category3stId' },
  { label: '品牌', prop: 'brandId' },
  { label: '经销商', prop: 'storeId' },
  { label: '保质期', prop: 'qualityGuaranteePeriod' },
  { label: '包装', prop: 'boxBin' },
  { label: '生产企业', prop: 'enterprise' },
  { label: '生产企业许可证号', prop: 'enterpriseLicense' },
  { label: '关键词', prop: 'keyWords' }
]

export const spuExtendProps = [
  {
    name: '基本属性',
    props: [
      { prop: 'needAptitude', label: '资质管理', editPermission: 701, visiblePermission: 735 },
      { prop: 'imgControl', label: '图片管理', editPermission: 702, visiblePermission: 736 },
      /*
         TODO：2020-07-16【商品模块】商家属性新增spu状态-是否存在有效资质
         http://jira.linkedcare.cn:8000/browse/ET-4453
      */
      // aptitudeStatus 商品资质是否有效：0 - 无效；1 - 有效
      { prop: 'aptitudeStatus', label: '是否存在有效资质', editPermission: 702, visiblePermission: 736 },
    ]
  },
  // {
  //   name: '价格属性',
  //   props: [
  //     { prop: 'level0Price', label: 'A价折算率', editPermission: 697, visiblePermission: 731 },
  //     { prop: 'level1Price', label: 'B价折算率', editPermission: 698, visiblePermission: 732 },
  //     { prop: 'level2Price', label: 'C价折算率', editPermission: 699, visiblePermission: 733 },
  //   ]
  // },
  {
    name: '运营属性',
    props: [
      { prop: 'negotiable', label: '面议支持', editPermission: 705, visiblePermission: 739 },
      { prop: 'channelType', label: '上架渠道', editPermission: process.env.NODE_ENV === 'production' ? 1227 : 1231, visiblePermission: process.env.NODE_ENV === 'production' ? 1228 : 1232 },
    ]
  }
]

export const skuStandardProps = [
  { label: '规格', prop: 'specification' },
  { label: 'LC编码', prop: 'lcCode' },
  { label: '条形码', prop: 'barcode' },
  { label: '商品类型', prop: 'isVirtual' },
  { label: '单位', prop: 'unit', width: '150' },
  { label: '单品毛重/KG', prop: 'weight' },
  { label: '长/CM', prop: 'length' },
  { label: '宽/CM', prop: 'width' },
  { label: '高/CM', prop: 'height' },
  { label: '产地', prop: 'origin' },
  { label: '备注', prop: 'remark' }
]

export const skuExtendProps = [
  {
    name: '基本属性',
    props: [
      [
        { prop: 'skuType', label: 'sku类型', editPermission: 720, visiblePermission: 750 },
        { prop: 'needAptitude', label: '资质管理', editPermission: 713, visiblePermission: 744 },
        { prop: 'imgControl', label: '图片管理', editPermission: 714, visiblePermission: 745 },
      ],
      [
        { prop: 'code', label: '自有编码', visiblePermission: 753 }
      ]
    ]
  },
  // {
  //   name: '价格属性',
  //   props: [
  //     [
  //       { prop: 'salesPrice', label: '市场价', editPermission: 707, visiblePermission: 507 },
  //       { prop: 'factorySalesPrice', label: '厂家建议售价', editPermission: 1111, visiblePermission: 1110 }
  //       // { prop: '', label: '首付款比例', editPermission: '1113', visiblePermission: '1112' }
  //     ],
  //     [
  //       { prop: 'level0Price', label: 'A价', visiblePermission: 504 },
  //       { prop: 'level1Price', label: 'B价', visiblePermission: 505 },
  //       { prop: 'level2Price', label: 'C价', visiblePermission: 506 }
  //     ],
  //     [
  //       { prop: 'settlePrice', label: '库内成本价', editPermission: 706, visiblePermission: 508 },
  //       { prop: 'factorySettlePrice', label: '厂家成本价', editPermission: 1115, visiblePermission: 1114 },
  //       { prop: 'bottomPrice', label: '综合成本价', editPermission: 708, visiblePermission: 509 },
  //     ],
  //     [
  //       { prop: 'platformPrice', label: '商家限价', editPermission: 1109, visiblePermission: 1108 },
  //       { prop: 'factoryLimitedPrice', label: '厂家限价', editPermission: 718, visiblePermission: 510 }
  //     ]
  //   ]
  // },
  {
    name: '运营属性',
    props: [
      [
        { prop: 'goodLabel', label: '商品标签', editPermission: 712, visiblePermission: 743 },
        { prop: 'oversold', label: '设置超卖属性', editPermission: 712, visiblePermission: 743 },
        { prop: 'purchaseLimit', label: '是否限量', editPermission: 712, visiblePermission: 743 },
        { prop: 'isInCatalogue', label: '是否入册', editPermission: 722, visiblePermission: 752 },
      ],
      [
        { prop: 'isCash', label: '必须现款购买', editPermission: process.env.NODE_ENV === 'production' ? 1230 : 1234, visiblePermission: process.env.NODE_ENV === 'production' ? 1229 : 1233 },
        { prop: 'batchNumber', label: '起批数量', editPermission: 721, visiblePermission: 751 },
        { prop: 'saledNumber', label: '销量', editPermission: 709, visiblePermission: 740 }
      ],
      [
        { prop: 'stock', label: '可销售库存', editPermission: 710, visiblePermission: 741 },
        { prop: 'goodStatus', label: '上架状态', editPermission: 711, visiblePermission: 742 },
        { prop: 'whileStocksLast', label: '是否售完即止', editPermission: 719, visiblePermission: 749 }
      ]
    ]
  }
]


export function findItem ( id: any, arr: Array<any> ): any {
  return arr.find( item => item.id === id )
}
