import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

let store51 = localStorage.getItem( 'maintainConfig' ) || ''
let store52 = localStorage.getItem( 'spuConfig' ) || ''
let store53 = localStorage.getItem( 'skuConfig' ) || ''
let store54 = localStorage.getItem( 'priceMaintenanceConfig' ) || ''


import { getterConfig } from '../../utils/'
@VuexClass( {
  modules: {}
} )
class ProductModule {
  // 商品维护 列表
  store51 = store51 && store51.split( ',' ) || []
  config51 = [
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'name', label: '名称', width: '300' },
    { prop: 'lcCode', label: 'LC编码', width: '150' },
    { prop: 'categoryName', label: '类目', width: '' },
    { prop: 'brandName', label: '品牌', width: '' },
    // { prop: 'unit', label: '单位', width: '' },
    { prop: 'storeName', label: '经销商', width: '' },
    // { prop: 'medicalRegistNum', label: '械宇号', width: '' },
    { prop: 'salesStatus', label: '状态', width: '150' },
    { prop: 'detail', label: '详情', width: '' }
  ]

  @Getter maintainConfig ( state ) {
    return getterConfig( state.store51, state.config51 )
  }
  // 商品详情 spu
  store52 = store52 && store52.split( ',' ) || []
  config52 = [
    { prop: 'name', label: '名称', width: '180px' },
    { prop: 'subtitle', label: '副标题/描述', width: '180px' },
    { prop: 'lcCode', label: 'LC编码', width: '122px' },
    { prop: 'category3stId', label: '类目', width: '150px' },

    { prop: 'level0Price', label: '平台会员折算率', width: '150' },
    { prop: 'level1Price', label: '企采会员折算率', width: '150' },
    { prop: 'level2Price', label: '集团会员折算率', width: '150px' },

    { prop: 'label', label: '标签', width: '150px' },
    { prop: 'brand', label: '品牌', width: '120px' },
    { prop: 'store', label: '经销商', width: '240px' },
    // { prop: 'unit', label: '单位', width: '120px' },
    { prop: 'qualityGuaranteePeriod', label: '保质期', width: '130' },
    { prop: 'needAptitude', label: '资质管理', width: '130' },
    { prop: 'imgControl', label: '图片管理', width: '130' },
    { prop: 'affiliation', label: '商品归属', width: '130' },
    // { prop: 'medicalRegistNum', label: '械字号', width: '130' },
    { prop: 'attribute', label: '属性值', width: '130' },
    { prop: 'boxBin', label: '产品包装', width: '130' },
    { prop: 'negotiable', label: '面议支持', width: '130' },
    { prop: 'enterprise', label: '生产企业', width: '130' }
  ]

  @Getter spuConfig ( state ) {
    return getterConfig( state.store52, state.config52 )
  }
  // 商品详情 sku
  store53 = store53 && store53.split( ',' ) || []
  config53 = [
    { prop: 'specification', label: '规格', width: '180' },
    { prop: 'goodLabel', label: '商品标签', width: '140' },
    { prop: 'lcCode', label: 'LC编码', width: '122' },
    { prop: 'barcode', label: '条形码', width: '122' },
    { prop: 'code', label: '自有编码', width: '150' },
    { prop: 'kmCode', label: 'KM编码', width: '150' },
    { prop: 'kmLinkCode', label: 'KM链接码', width: '130' },
    { prop: 'lchCode', label: 'LCH编码', width: '150' },

    { prop: 'unit', label: '单位', width: '150' },
    // { prop: 'contrastingRelations', label: '单位', width: '120px' },
    { prop: 'skuType', label: 'sku类型', width: '150' },

    { prop: 'needAptitude', label: '资质管理', width: '130' },
    { prop: 'imgControl', label: '图片管理', width: '130' },
    { prop: 'validityFlag', label: '效期', width: '130' },
    { prop: 'stock', label: '库存', width: '130' },
    { prop: 'deliveryTime', label: '交期', width: '130' },
    { prop: 'expirationDate', label: '失效日期', width: '170' },
    { prop: 'saledNumber', label: '销量', width: '130' },
    { prop: 'settlePrice', label: '成本价', width: '130' },
    { prop: 'trialStatus', label: '活动', width: '130' },
    { prop: 'activityPrice', label: '活动价', width: '130' },
    { prop: 'activityEndTime', label: '活动结束时间', width: '170' },
    { prop: 'salesPrice', label: '售价', width: '130' },
    { prop: 'level0Price', label: '平台会员价', width: '130' },
    { prop: 'level1Price', label: '企采会员价', width: '130' },
    { prop: 'level2Price', label: '集团会员价', width: '130' },
    { prop: 'factoryLimitedPrice', label: '厂家限价', width: '130' },
    { prop: 'bottomPrice', label: '综合成本价', width: '130' },
    { prop: 'goodStatus', label: '上架状态', width: '130' },
    { prop: 'whileStocksLast', label: '是否售完即止', width: '130' },
    { prop: 'batchNumber', label: '起批数量', width: '130' },
    { prop: 'origin', label: '产地', width: '100' },
    { prop: 'weight', label: '单品毛重/KG', width: '130' },
    { prop: 'length', label: '长/CM', width: '130' },
    { prop: 'width', label: '宽/CM', width: '130' },
    { prop: 'height', label: '高/CM', width: '130' }
  ]

  @Getter skuConfig ( state ) {
    return getterConfig( state.store53, state.config53 )
  }

  store54 = store54 && store54.split( ',' ) || []
  config54 = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '150' },
    { prop: 'name', label: '名称', width: '200' },
    { prop: 'specification', label: '规格', width: '180' },
    { prop: 'unit', label: '单位', width: '150' },
    { prop: 'goodStatus', label: '状态', width: '150' },
    { prop: 'skuType', label: 'SKU类型', width: '150' },
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'purchasePrice', label: '采购进价', width: '150' },
    { prop: 'settlePrice', label: '库内成本价', width: '150' },
    { prop: 'factorySettlePrice', label: '厂家成本价', width: '150' },
    { prop: 'bottomPrice', label: '综合成本价', width: '150' },
    { prop: 'profitFactor', label: '利润因子', width: '150' },
    { prop: 'platformPrice', label: '商家限价', width: '150' },
    { prop: 'factoryLimitedPrice', label: '厂家限价', width: '150' },
    { prop: 'groundPrice', label: '地推限价', width: '150' },
    { prop: 'salesPrice', label: '市场价', width: '150' },
    { prop: 'factorySalesPrice', label: '厂家指导价', width: '150' },
    { prop: 'regionalGuidancePrice', label: '区域指导价', width: '150' },
    { prop: 'level0Price', label: 'A价', width: '150' },
    { prop: 'level1Price', label: 'B价', width: '150' },
    { prop: 'level2Price', label: 'C价', width: '150' },
    { prop: 'control', label: '详情', width: '100', fixed: 'right' }
  ]

  @Getter priceMaintenanceConfig ( state ) {
    return getterConfig( state.store54, state.config54 )
  }

  @Mutation setMaintainConf ( state, data ) {
    state.store51 = data
    localStorage.setItem( 'maintainConfig', data )
  }

  @Mutation setSpuConf ( state, data ) {
    state.store52 = data
    localStorage.setItem( 'spuConfig', data )
  }
  @Mutation setSkuConf ( state, data ) {
    state.store53 = data
    localStorage.setItem( 'skuConfig', data )
  }

  @Mutation setPriceMaintenanceConf ( state, data ) {
    state.store54 = data
    localStorage.setItem( 'priceMaintenanceConfig', data )
  }
}

const storeModule = extractVuexModule( ProductModule )
export default storeModule
