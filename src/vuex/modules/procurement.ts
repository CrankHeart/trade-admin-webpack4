import {
  VuexClass,
  extractVuexModule,
  Mutation,
  Action,
  Getter,
  HasGetter
} from 'vuex-class-module'

import { getterConfig, http } from '../../utils/'
import API from '../../API'

let searchPurchasingTaskOrdinaryConf =
  localStorage.getItem( 'purchasingTaskOrdinaryConf' ) || ''
let searchCommonProcurementTableCon =
  localStorage.getItem( 'commonProcurementTableCon' ) || ''
let searchBuyingRequirementTableCon =
  localStorage.getItem( 'buyingRequirementTableCon' ) || ''
let searchOrderSkuTableConfig =
  localStorage.getItem( 'orderSkuTableConfig' ) || ''
let createCommonProcurementTableCon =
  localStorage.getItem( 'createCommonProcurementTableCon' ) || ''
let createDirectlyProcurementTableCon =
  localStorage.getItem( 'createDirectlyProcurementTableCon' ) || ''
let skuSupplierRelation = sessionStorage.getItem( 'skuSupplierRelation' ) || '{}'
let procurementReturnStore =
  localStorage.getItem( 'procurementReturnConfig' ) || '{}'

@VuexClass( {
  modules: {}
} )
class PurchaseStore {
  a = ''
  selectSupplier: any = {}
  isMonthSupplier: boolean = true
  commonSkuList: any[] = []
  wareHousesList: any[] = []
  buyingRequirementSkuList: any[] = [] //
  buyingRequirementSelectedSkuList: any[] = [] // 选中的采购需求,前端分页要用
  commonSelectedSkuList: any[] = [] // 普通视图被选中sku列表
  orderSelectedSkuList: any[] = [] // 订单视图被选中sku列表
  directlySelectedSkuList: any[] = [] // 直发视图被选中sku列表
  searchPurchasingTaskOrdinaryConf = ( searchPurchasingTaskOrdinaryConf && searchPurchasingTaskOrdinaryConf.split( ',' ) ) || []
  searchBuyingRequirementTableCon = ( searchBuyingRequirementTableCon && searchBuyingRequirementTableCon.split( ',' ) ) || []
  searchCommonProcurementTableCon = ( searchCommonProcurementTableCon && searchCommonProcurementTableCon.split( ',' ) ) || []
  searchOrderSkuTableConfig = ( searchOrderSkuTableConfig && searchOrderSkuTableConfig.split( ',' ) ) || []
  createCommonProcurementTableCon = ( createCommonProcurementTableCon && createCommonProcurementTableCon.split( ',' ) ) || []
  createDirectlyProcurementTableCon = ( createDirectlyProcurementTableCon && createDirectlyProcurementTableCon.split( ',' ) ) || []
  skuSupplierRelation = JSON.parse( skuSupplierRelation )



  // * 采购任务普通视图表格
  purchasingTasksCommonTableList = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '200px' },
    { prop: 'skuName', label: '商品名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '200px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
    { prop: 'goodLabel', label: '商品标签', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'supplierName', label: '供应商', width: '150px' },
    { prop: 'supplierDeliveryDate', label: '供应商预计交期', width: '150px' },
    { prop: 'buyerName', label: '负责买手', width: '150px' },
    { prop: 'purchaseNum', label: '总任务数量', width: '120px' },
    { prop: 'gapsNumber', label: '缺口数量', width: '100px' },
    { prop: 'deliveryDate', label: '最近交付日期', width: '150px' },
    { prop: 'riskLevel', label: '交付风险', width: '150px' },
    { prop: 'riskDeatil', label: '交付详情', width: '120px', fixed: 'right' },
    { prop: 'control', label: '操作', width: '65px', fixed: 'right' }
  ]

  // 补货助手 普通视图表格
  commonSkuTableConfig = [
    // { prop: 'check', label: '选择', width: '70px' },
    { prop: 'lcSkuCode', label: 'LC编码', width: '200px' },
    { prop: 'name', label: '商品信息', width: '200px' },
    { prop: 'specification', label: '规格', width: '200px' },
    { prop: 'supplierName', label: '供应商', width: '150px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'salesStatus', label: '上下架', width: '100px' },
    { prop: 'lable', label: '常备商品', width: '100px' },
    // { prop: 'calculate', label: '预测' },
    { prop: 'calculate', label: '未来30天预测销量', width: '110px' },
    { prop: 'stockWarning', label: '安全库存', width: '110px' },
    { prop: 'oStock', label: '在库(同步)', width: '120px' },
    { prop: 'oLock', label: '锁定' },
    { prop: 'outStockNum', label: '缺货' },
    { prop: 'onWay', label: '在途' },
    { prop: 'deliveryDate', label: '到货时间', width: '180px' },
    { prop: 'repNum', label: '智能补货', width: '95px', fixed: 'right' },
    // { prop: 'supplyNum', label: '补货', width: '170px', fixed: 'right' },
    { prop: 'control', label: '操作', width: '65px', fixed: 'right' }
  ]

  // 采购需求图表格 (这个跟额外采购计划又差几个字段不一致)
  buyingRequirementTableConfig = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '200px' },
    { prop: 'name', label: '商品名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '120px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'goodLabel', label: '商品标签', width: '100px' },
    { prop: 'safeStockNum', label: '安全库存补足数量', width: '100px' },
    { prop: 'planInNum', label: '计划内数量', width: '100px' },
    { prop: 'planOutNum', label: '计划外数量', width: '100px' },
    { prop: 'requireNum', label: '总需求数量', width: '100px' },
    { prop: 'supplyNum', label: '需求缺口数量', width: '100px' },
    { prop: 'missionLackingNum', label: '任务缺口数量', width: '100px' },
    { prop: 'recentDate', label: '最近交付日期', width: '120px' },
    { prop: 'riskLevel', label: '交付风险', width: '150px' },
    { prop: 'riskDeatil', label: '交付详情', width: '120px', fixed: 'right' },
    { prop: 'control', label: '操作', width: '65px', fixed: 'right' }
  ]

  // 采购需求(补货助手) 订购视图表格
  orderSkuTableConfig = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '200px' },
    { prop: 'name', label: '商品名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '120px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'lable', label: '是否常备', width: '100px' },
    // { prop: 'supplierName', label: '供应商', width: '150px' },
    // { prop: 'deliveryDate', label: '供应商预计交期', width: '150px' },
    { prop: 'requireNum', label: '总需求数量', width: '100px' },
    { prop: 'supplyNum', label: '需求缺口数量', width: '100px' },
    { prop: 'missionLackingNum', label: '任务缺口数量', width: '100px' },
    { prop: 'recentDate', label: '最近交付日期', width: '120px' },
    // { prop: 'goodLabel', label: '商品标签', width: '150px' },
    // { prop: 'lockedNum', label: '交付状态', width: '100px' },
    { prop: 'riskLevel', label: '交付风险', width: '260px' },
    // { prop: 'riskDeatil', label: '交付详情', width: '120px', fixed: 'right' },
    { prop: 'control', label: '操作', width: '65px', fixed: 'right' }
  ]




  // 普通采购单表格
  createTableConfig = [
    // { prop: 'check', label: '选择', width: '80px' },
    { prop: 'lcSkuCode', label: 'SKU编码', width: '200px' },
    { prop: 'skuLabel', label: '类型', width: '200px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '110px' },
    { prop: 'name', label: '名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '200px' },
    { prop: 'deliveryDate', label: '预计到货日期', width: '250px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'oStock', label: '库存', width: '100px' },
    { prop: 'onWay', label: '在途', width: '' },
    { prop: 'supplyNum', label: '采购数量', width: '200px' },
    { prop: 'price', label: '单价', width: '200px' },
    { prop: 'goodsAmount', label: '总金额', width: '100px' },
    { prop: 'skuDiscountAmount', label: '优惠总额', width: '200px' },
    { prop: 'skuDiscountPrice', label: '优惠单价', width: '100px' },
    { prop: 'pay_amount', label: '实付金额', width: '100px' },
    { prop: 'taxPoint', label: '税点', width: '200px' },
    // { prop: 'isLessGoods', label: '是否缺货采购', width: '150px' },
    // { prop: 'remark', label: '备注', width: '150px' },
    { prop: 'control', label: '操作', width: '', fixed: 'right' }
  ]

  // 直发采购单,商品明细表格
  directlyTableConfig = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '150px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '100px' },
    { prop: 'name', label: '商品名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '250px' },
    { prop: 'unit', label: '单位' },
    { prop: 'price', label: '价格', width: '180px' },
    { prop: 'oStock', label: '库存' },
    { prop: 'onWay', label: '在途' },
    { prop: 'number', label: '缺货数量', width: '180px' },
    // { prop: 'supplyNum', label: '额外补货数量', width: '220px' },
    { prop: 'goodsAmount', label: '小计' },
    { prop: 'deliveryDate', label: '供应商交期', width: '230px' },
    { prop: 'remark', label: '备注', width: '180px' },
    { prop: 'control', label: '操作', fixed: 'right' }
  ]
  @Mutation setA ( state, param ) {
    state.a = param
  }
  @Mutation setAllWareHouses ( state, list = [] ) {
    state.wareHousesList = list
  }
  @Action listWareHouses ( { commit, state } ) {
    if ( state.wareHousesList.length ) {
      return Promise.resolve( state.wareHousesList )
    }
    return http( API.mappingWarehouse ).then( ( { data } ) => {
      let list = data.data.map( v => {
        return {
          id: v.code,
          name: v.name
        }
      } )
      commit( 'setAllWareHouses', list )
      return list
    } )
  }

  @Mutation setSupplier ( state, supplier: any = {} ) {
    let { name = '', id = '', taxPoint = '', bankName = '', settlementAccounts = '', settlementMethod = '', invoiceType = '' } = supplier
    state.selectSupplier = { name, id, taxPoint, bankName, settlementAccounts, settlementMethod, invoiceType }
  }

  // 采购需求
  @Getter procurementBuyingRequirementConfig ( state ) {
    return getterConfig(
      state.searchBuyingRequirementTableCon,
      state.buyingRequirementTableConfig
    )
  }

  // 采购任务普通视图
  @Getter purchasingTaskOrdinarySkuConfig ( state ) {
    return getterConfig(
      state.searchPurchasingTaskOrdinaryConf,
      state.purchasingTasksCommonTableList
    )
  }

  // 补货助手 普通视图表格
  @Getter procurementSkuConfig ( state ) {
    return getterConfig(
      state.searchCommonProcurementTableCon,
      state.commonSkuTableConfig
    )
  }
  // 补货助手 订购视图表格
  @Getter refillOrderSkuTableConfig ( state ) {
    return getterConfig(
      state.searchOrderSkuTableConfig,
      state.orderSkuTableConfig
    )
  }
  // 普通采购单表格
  @Getter procurementCreateConfig ( state ) {
    return getterConfig(
      state.createCommonProcurementTableCon,
      state.createTableConfig
    )
  }
  // 直发采购单表格
  @Getter directlyProcurementConfig ( state ) {
    return getterConfig(
      state.createDirectlyProcurementTableCon,
      state.directlyTableConfig
    )
  }

  @Getter procurementSkuList ( state ) {
    return state.CommonSkuList
  }

  @Mutation setMonthSupplier ( state, value: number = 0 | 1 ) {
    state.isMonthSupplier = value === 1 ? true : false
  }

  @Mutation addCommonSkuListByImport ( state, items: any = [] ) {
    // state.commonSkuList = items
    state.commonSkuList = []
    items.forEach( element => {
      let {
        supplierName,
        supplierId,
        lcSkuCode,
        skuLabel,
        taxPoint,
        skuDiscountAmount,
        skuDiscountPrice,
        pay_amount,
        name,
        skuName,
        specification,
        storeSkuCode,
        deliveryDate,
        unit,
        price,
        storeId,
        storeName,
        supplyNum,
        onWay,
        oStock,
        skuId
      } = element
      if ( !taxPoint ) {
        taxPoint = 13
      }
      if ( !skuLabel ) {
        skuLabel = 1
      }

      let item = {
        remark: '',
        supplierName,
        supplierId,
        skuLabel,
        taxPoint,
        skuDiscountAmount,
        skuDiscountPrice,
        skuId,
        lcSkuCode,
        name,
        specification,
        storeSkuCode,
        deliveryDate,
        unit,
        price,
        storeId,
        storeName,
        supplyNum,
        onWay,
        oStock
      }

      state.commonSkuList.push( item )
    } );
  }



  @Mutation addBuyingRequirementSkuList ( state, data: any = {} ) {
    let item: any = data

    if ( data.isFormat ) {
      item = item.result
    }
    if ( data.isFirst ) {
      state.buyingRequirementSkuList.unshift( item )
    } else {
      state.buyingRequirementSkuList.push( item )
    }
  }

  @Mutation addCommonSkuList ( state, data: any = {} ) {
    let item: any = data

    if ( data.isFormat ) {
      let {
        supplierName,
        supplierId,
        lcSkuCode,
        skuLabel,
        taxPoint,
        skuDiscountAmount,
        skuDiscountPrice,
        pay_amount,
        name,
        skuName,
        specification,
        storeSkuCode,
        deliveryDate,
        unit,
        price,
        storeId,
        storeName,
        supplyNum,
        onWay,
        // oLock,
        // outStockNum,
        // calculate,
        oStock,
        skuId
      } = item.result
      if ( !taxPoint ) {
        taxPoint = 13
      }
      if ( !skuLabel ) {
        skuLabel = 1
      }
      // let skuNum = item.number
      item = {
        remark: '',
        // number: skuNum,
        supplierName,
        supplierId,
        skuLabel,
        taxPoint,
        skuDiscountAmount,
        skuDiscountPrice,
        skuId,
        lcSkuCode,
        name: name || skuName,
        specification,
        storeSkuCode,
        deliveryDate,
        unit,
        price,
        storeId,
        storeName,
        supplyNum,
        // oLock,
        onWay,
        // outStockNum,
        // calculate,
        oStock
      }
    }
    if ( data.isFirst ) {
      state.commonSkuList.unshift( item )
    } else {
      state.commonSkuList.push( item )
    }
  }

  @Mutation editCommonSkuList ( state, editInfo ) {
    let editFind: any = state.commonSkuList.find(
      v => v.lcSkuCode === editInfo.lcSkuCode
    )
    Object.assign( editFind, editInfo )
  }

  @Mutation editBuyingRequirementSkuList ( state, editInfo ) {
    let editFind: any = state.buyingRequirementSkuList.find(
      v => v.lcSkuCode === editInfo.lcSkuCode
    )
    console.log( state.buyingRequirementSkuList, editInfo )
    Object.assign( editFind, editInfo )
  }

  @Mutation delBuyingRequirementSkuList ( state, code: string | string[] ) {
    let lcSkuCodes: string[] = []
    if ( !Array.isArray( code ) ) {
      lcSkuCodes = [ code ]
    } else {
      lcSkuCodes = code
    }
    state.buyingRequirementSkuList = state.buyingRequirementSkuList.filter(
      v => lcSkuCodes.indexOf( v.lcSkuCode ) === -1
    )
  }

  @Mutation delCommonSkuList ( state, code: string | string[] ) {
    let lcSkuCodes: string[] = []
    if ( !Array.isArray( code ) ) {
      lcSkuCodes = [ code ]
    } else {
      lcSkuCodes = code
    }
    state.commonSkuList = state.commonSkuList.filter(
      v => lcSkuCodes.indexOf( v.lcSkuCode ) === -1
    )
  }

  @Mutation delCommonSkuListByIndex ( state, index: number ) {
    state.commonSkuList.splice( index, 1 )
  }

  @Mutation clearCommonSkuList ( state ) {
    state.commonSkuList = []
  }

  @Mutation clearBuyingRequirementkuList ( state ) {
    state.buyingRequirementSkuList = []
  }

  @Mutation changeSkuPrice ( state, { lcSkuCode, price } ) {
    state.commonSkuList.forEach( v => {
      if ( v.lcSkuCode === lcSkuCode ) {
        v.price = price
      }
    } )
  }

  @Mutation setProcurementBuyingRequirementConf ( state, data ) {
    state.searchBuyingRequirementTableCon = data
    localStorage.setItem( 'buyingRequirementTableCon', data )
  }
  @Mutation setPurchasingTaskOrdinaryConf ( state, data ) {
    state.searchPurchasingTaskOrdinaryConf = data
    localStorage.setItem( 'purchasingTaskOrdinaryConf', data )
  }
  @Mutation setProcurementConf ( state, data ) {
    state.searchCommonProcurementTableCon = data
    localStorage.setItem( 'commonProcurementTableCon', data )
  }
  @Mutation setOrderSkuConf ( state, data ) {
    state.searchOrderSkuTableConfig = data
    localStorage.setItem( 'orderSkuTableConfig', data )
  }
  @Mutation setCreateTableConf ( state, data ) {
    state.createCommonProcurementTableCon = data
    localStorage.setItem( 'createCommonProcurementTableCon', data )
  }
  @Mutation setDirectlySkuConf ( state, data ) {
    state.createDirectlyProcurementTableCon = data
    localStorage.setItem( 'createDirectlyProcurementTableCon', data )
  }

  @Mutation setSkuSupplierRelation ( state, { lcSkuCode, supplierName } ) {
    state.skuSupplierRelation[ lcSkuCode ] = supplierName
    sessionStorage.setItem(
      'skuSupplierRelation',
      JSON.stringify( state.skuSupplierRelation )
    )
  }

  @Mutation delSkuSupplierRelation ( state, lcSkuCode ) {
    delete state.skuSupplierRelation[ lcSkuCode ]
    state.skuSupplierRelation = Object.assign( {}, state.skuSupplierRelation )
    sessionStorage.setItem(
      'skuSupplierRelation',
      JSON.stringify( state.skuSupplierRelation )
    )
  }

  @Mutation clearSkuSupplierRelation ( state ) {
    // state.skuSupplierRelation = {}
    // sessionStorage.removeItem( 'skuSupplierRelation' )
  }
  // 添加采购需求 被选中的sku
  @Mutation setBuyingRequirementSelectedSkuList ( state, list ) {
    state.buyingRequirementSelectedSkuList = list
  }
  // u
  @Mutation clearBuyingRequirementSelectedSkuList ( state ) {
    state.buyingRequirementSelectedSkuList = []
  }


  @Mutation setBuyingRequirementSkuList ( state, list ) {
    state.buyingRequirementSkuList = list
  }

  // 添加 普通视图 被选中的sku
  @Mutation setCommonSelectedSkuList ( state, list ) {
    state.commonSelectedSkuList = list
  }
  // 删除采购需求
  @Mutation clearBuyingRequirementSkuList ( state ) {
    state.buyingRequirementSkuList = []
  }
  // 删除 普通视图 被选中的sku
  @Mutation clearCommonSelectedSkuList ( state ) {
    state.commonSelectedSkuList = []
  }
  // 添加 订购视图 被选中的sku
  @Mutation setOrderSelectedSkuList ( state, list ) {
    state.orderSelectedSkuList = list
  }
  // 清空 订购视图 被选中的sku
  @Mutation clearOrderSelectedSkuList ( state ) {
    state.orderSelectedSkuList = []
  }
  // 添加 直发视图 被选中的sku
  @Mutation setDirectlySelectedSkuList ( state, list ) {
    state.directlySelectedSkuList = list
  }
  // 清空 直发视图 被选中的sku
  @Mutation clearDirectlySelectedSkuList ( state ) {
    state.directlySelectedSkuList = []
  }

  // 直发采购单

  directlySkuMap: any = {}
  directlyDeliverySn: string[] = []
  memberOrder: any = {
    sn: '',
    member: '',
    memberName: '',
    addressDetail: '',
    createDate: {}
  }

  @Getter directlySkuList ( state ) {
    let o: any[] = []
    Object.keys( state.directlySkuMap ).forEach( v => {
      o.push( state.directlySkuMap[ v ] )
    } )
    return o
  }

  @Mutation setMemberOrder ( state, msg ) {
    state.memberOrder = msg
  }

  @Mutation setDirectlyDeliverySn ( state, deliverySn: string[] = [] ) {
    state.directlyDeliverySn = [ ...deliverySn ]
  }

  @Mutation setDirectlySkuMap ( state, sku ) {
    let o = state.directlySkuMap

    let {
      supplierName,
      supplierId,
      lcSkuCode,
      skuLabel,
      taxPoint,
      skuDiscountAmount,
      skuDiscountPrice,
      pay_amount,
      brandName,
      name,
      skuName,
      specification,
      storeSkuCode,
      deliveryDate,
      unit,
      price,
      storeId,
      storeName,
      onWay,
      // oLock,
      // outStockNum,
      // calculate,
      oStock,
      skuId,
      remark = ''
    } = sku
    if ( !taxPoint ) {
      taxPoint = 13
    }
    if ( !skuLabel ) {
      skuLabel = 1
    }
    // let skuNum = item.number
    // if ( data.isPrice ) {
    //   item.price = price
    // }
    let supplyNum = sku.number
    if ( !o[ sku.lcSkuCode ] ) {
      o[ sku.lcSkuCode ] = {
        supplierName,
        supplierId,
        lcSkuCode,
        skuLabel,
        taxPoint,
        skuDiscountAmount,
        skuDiscountPrice,
        pay_amount,
        brandName,
        name,
        skuName,
        specification,
        storeSkuCode,
        deliveryDate,
        unit,
        price,
        storeId,
        storeName,
        supplyNum,
        onWay,
        // oLock,
        // outStockNum,
        // calculate,
        oStock,
        skuId,
        remark
      }
    }
    state.directlySkuMap = Object.assign( {}, state.directlySkuMap )
  }
  @Mutation clearDirectlySkuMap ( state ) {
    state.directlySkuMap = {}
  }

  @Mutation delDirectlySku ( state, lcSkuCode ) {
    delete state.directlySkuMap[ lcSkuCode ]
    state.directlySkuMap = Object.assign( {}, state.directlySkuMap )
  }
  @Mutation changeDirectlySkuPrice ( state, { lcSkuCode, price } ) {
    state.directlySkuMap[ lcSkuCode ].price = price
  }

  procurementReturnStore =
  ( procurementReturnStore && procurementReturnStore.split( ',' ) ) || []
  procurementReturnConfigData = [
    { prop: 'procurementSn', label: '采购单号', width: '220px' },
    { prop: 'serviceSn', label: '服务单号', width: '210px' },
    { prop: 'applyTime', label: '申请日期', width: '120px' },
    { prop: 'lcSkuCode', label: 'lC编码', width: '150px' },
    { prop: 'name', label: '商品信息', width: '210px' },
    { prop: 'specification', label: '规格', width: '150px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '120px' },
    { prop: 'unit', label: '单位' },
    { prop: 'number', label: '退货数量', width: '100px' },
    { prop: 'applyReason', label: '退货原因', width: '200px' },
    { prop: 'price', label: '单价', width: '100px' },
    { prop: 'skuAmount', label: '退款金额', width: '100px' },
    { prop: 'serviceType', label: '退货类型', width: '120px' },
    { prop: 'returnStatus', label: '退货状态', width: '100px' },
    { prop: 'settleStatus', label: '结算状态', width: '100px' },
    { prop: 'control', label: '操作', fixed: 'right', width: '160px' }
  ]

  @Getter procurementReturnConfig ( state ) {
    return getterConfig(
      state.procurementReturnStore,
      state.procurementReturnConfigData
    )
  }

  @Mutation setProcurementReturnConf ( state, data ) {
    state.procurementReturnStore = data
    localStorage.setItem( 'procurementReturnConfig', data )
  }
}

export default extractVuexModule( PurchaseStore )
