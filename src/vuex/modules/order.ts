import {
  VuexClass,
  extractVuexModule,
  Mutation,
  Action,
  Getter,
  HasGetter
} from 'vuex-class-module'

let store11 = localStorage.getItem( 'orderConfig' ) || ''

let store12 = localStorage.getItem( 'invoiceConfig' ) || ''

let store13 = localStorage.getItem( 'orderDetailDeliverListConfig' ) || ''

let store14 = localStorage.getItem( 'paymentVoucherListConfig' ) || ''


import { getterConfig } from '../../utils/'
@VuexClass( {
  modules: {}
} )
class OrderModule {
  store11 = ( store11 && store11.split( ',' ) ) || []
  // 订单查询 列表
  config11 = [
    { prop: 'name', label: '商品名称', width: '150px' },
    { prop: 'number', label: '数量', width: '100px' },
    { prop: 'lcCode', label: 'LC编码', width: '150px' },
    { prop: 'code', label: '自有编码', width: '110px' },
    { prop: 'categoryName', label: '类目', width: '100px' },
    { prop: 'brandName', label: '品牌', width: '130px' },
    { prop: 'deliverySns', label: '出库单', width: '500px' },
    { prop: 'addressDetail', label: '收货人信息', width: '180px' },
    { prop: 'orderStatus', label: '状态', width: '150px' },
    { prop: 'paymentAmountString', label: '实收款', width: '100px' },
    { prop: 'control', label: '操作', width: '100px' }
  ]

  // 发票查询 列表
  store12 = ( store12 && store12.split( ',' ) ) || []
  config12 = [
    { prop: 'orderSn', label: '订单', width: '180px' },
    // { prop: 'storeName', label: '经销商' },
    { prop: 'applyMember', label: '用户', width: '280px' },
    { prop: 'taxpayerId', label: '纳税人税号', width: '180px' },
    { prop: 'haveReturnOrder', label: '退换货状态', width: '180px' },
    { prop: 'invoiceProgress', label: '进度', width: '180px' },

    { prop: 'invoiceType', label: '发票类型', width: '110px' },
    { prop: 'invoiceKind', label: '开票方式', width: '110px' },

    { prop: 'bankDeposit', label: '开户银行', width: '180px' },
    { prop: 'bankAccount', label: '银行账户', width: '180px' },
    { prop: 'companyAddress', label: '申请人公司所在地址', width: '180px' },
    { prop: 'invoiceMobile', label: '电话', width: '180px' },

    { prop: 'invoiceApplyTime', label: '申请时间', width: '180px' },
    { prop: 'invoiceTitle', label: '发票抬头', width: '180px' },
    { prop: 'invoiceAddress', label: '寄送信息', width: '280px' },
    { prop: 'invoiceStatus', label: '状态' },
    { prop: 'control', label: '操作', fixed: 'right', width: '200px' }
  ]

  // 订单详情 出货信息
  store13 = ( store13 && store13.split( ',' ) ) || []
  config13 = [
    { prop: 'name', label: '商品名称', width: '210px' },
    { prop: 'specification', label: '规格', width: '110px' },
    { prop: 'lcCode', label: 'LC编码', width: '210px' },
    { prop: 'number', label: '数量', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'realShortNumber', label: '实缺数量', width: '140px' },
    { prop: 'riskLevel', label: '交付风险', width: '140px' },
    // { prop: 'deliveryTime', label: '预计交期', width: '120px' },
    { prop: 'remark', label: '备注信息', width: '210px' },
    { prop: 'code', label: '自有编码', width: '210px' },
    { prop: 'skuType', label: 'sku类型', width: '120px' },
    { prop: 'wareHouse', label: '仓库', width: '100px' },
    { prop: 'companyName', label: '物流公司', width: '100px' },
    { prop: 'trackingNumber', label: '运单号', width: '210px' },
    { prop: 'storage', label: '储运条件', width: '200px' },
    // {prop: 'deliveryTime', label: '交期', width: '180px'},
    { prop: 'registrationCertificate', label: '注册证号', width: '180px' },
    { prop: 'lotNumber', label: '生产批号', width: '180px' },
    { prop: 'expirationDate', label: '失效日期', width: '180px' },
    { prop: 'agreePrice', label: '单价', width: '180px' },
    { prop: 'discountAmount', label: '单项优惠', width: '180px' },
    { prop: 'sharedSubtotal', label: '小计', width: '180px' }
  ]

  store14 = ( store14 && store14.split( ',' ) ) || []
  config14 = [
    { prop: 'voucherSn', label: '付款凭证编号', width: '260px' },
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'tradeSn', label: '交易流水号', width: '280px' },
    { prop: 'lcTradeSn', label: '商家流水号', width: '280px' },
    { prop: 'voucherStatus', label: '付款凭证状态', width: '130px' },
    { prop: 'orderSn', label: '订单号', width: '250px' },
    { prop: 'writtenOffAmount', label: '核销金额', width: '130px' },
    { prop: 'amount', label: '凭证金额', width: '130px' },
    { prop: 'remark', label: '审核备注', width: '220px' },
    { prop: 'createDate', label: '创建时间', width: '200px' },
    { prop: 'updateDate', label: '最后更新时间', width: '200px' },
    { prop: 'createPerson', label: '创建人', width: '130px' },
    { prop: 'payee', label: '销售负责人', width: '130px' },
    { prop: 'actualPayDate', label: '实际付款时间', width: '200px' },
    { prop: 'updatePerson', label: '最后更新人', width: '130px' },
    { prop: 'control', label: '操作', width: '120px', fixed: 'right' }
  ]


  @Getter orderConfig ( state ) {
    return getterConfig( state.store11, state.config11 )
  }

  @Getter invoiceConfig ( state ) {
    return getterConfig( state.store12, state.config12 )
  }

  @Getter orderDetailDeliverListConfig ( state ) {
    return getterConfig( state.store13, state.config13 )
  }

  @Getter paymentVoucherListConfig ( state ) {
    return getterConfig( state.store14, state.config14 )
  }

  @Mutation setOrderConf ( state, data ) {
    state.store11 = data
    localStorage.setItem( 'orderConfig', data )
  }
  @Mutation setInvoiceConf ( state, data ) {
    state.store12 = data
    localStorage.setItem( 'invoiceConfig', data )
  }

  @Mutation setOrderDetailDeliverConfig ( state, data ) {
    state.store13 = data
    localStorage.setItem( 'orderDetailDeliverListConfig', data )
  }

  @Mutation setPaymentVoucherListConfig ( state, data ) {
    state.store14 = data
    localStorage.setItem( 'paymentVoucherListConfig', data )
  }

}

const storeModule = extractVuexModule( OrderModule )
export default storeModule
