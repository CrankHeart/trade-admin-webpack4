import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import { getterConfig, http } from '../../utils/'
import API from '../../API/'

let store41 = localStorage.getItem( 'refundingConfig' ) || ''
let store42 = localStorage.getItem( 'orderCheckConfig' ) || ''

@VuexClass( {
  modules: {}
} )
class ServerModule {
  // 服务单
  store41 = ( store41 && store41.split( ',' ) ) || []
  config41 = [
    { prop: 'orderSn', label: '订单号', width: '280px' },
    { prop: 'serviceSn', label: '服务单号', width: '220px' },
    // { prop: 'goodsSkuId', label: '商品id', width: '' },
    { prop: 'serviceType', label: '服务单类型', width: '120px' },
    { prop: 'goodsLcCode', label: 'SKU编码', width: '' },
    { prop: 'goodsName', label: '商品信息', width: '270px' },
    { prop: 'skuType', label: '商品类型', width: '150px' },
    // { prop: 'purchaseProperty', label: '商品属性', width: '150px' },
    { prop: 'serviceStatus', label: '服务单状态', width: '200px' },
    { prop: 'time', label: '时间线', width: '320px' },
    { prop: 'review', label: '审核信息', width: '180px' },
    // { prop: 'goodsSpecification', label: '商品规格', width: '220px' },
    { prop: 'goodsNum', label: '商品数量', width: '' },
    { prop: 'refundGoodsStatus', label: '寄回商品状态', width: '' },
    { prop: 'refundAmount', label: '退款金额', width: '100px' },
    { prop: 'applyUser', label: '申请人', width: '320px' },
    // { prop: 'applyTime', label: '申请时间', width: '220px' },
    { prop: 'applyReason', label: '申请理由', width: '200px' },
    // { prop: 'contact', label: '联系人', width: '' },
    // { prop: 'mobile', label: '联系人电话', width: '' },
    { prop: 'receiverAddress', label: '收件人地址', width: '220px' },
    // { prop: 'reviewNoPassReason', label: '拒绝理由', width: '' },
    // { prop: 'customerReturnTime', label: '客户退货时间', width: '220px' },
    { prop: 'logisticId', label: '客户退货物流信息', width: '180px' },
    // { prop: 'storageReceiptTime', label: '仓库收货时间', width: '220px' },
    // { prop: 'refundTime', label: '退款时间', width: '220px' },
    // { prop: 'exchangeTime', label: '换货重新发货时间', width: '220px' },
    { prop: 'exchangeLogisticId', label: '换货重新发货物流信息', width: '180px' },
    { prop: 'control', label: '操作', width: '200px', fixed: 'right' },
    // { prop: 'completeTime', label: '完成时间', width: '' }
  ]

  store42 = ( store42 && store42.split( ',' ) ) || []
  config42 = [
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'accountCheckSn', label: '对账流水号', width: '320px' },
    { prop: 'bankSn', label: '银行流水号', width: '220px' },
    { prop: 'orderSn', label: '订单号', width: '220px' },
    // {prop: 'serviceOrderAmounts', label: '服务单金额', width: '120px'},
    { prop: 'serviceOrderList', label: '服务单', width: '320px' },
    { prop: 'orderAmount', label: '订单金额', width: '120px' },
    { prop: 'orderDate', label: '下单时间', width: '200px' },
    { prop: 'checkingDate', label: '核对发起时间', width: '200px' },
    { prop: 'checkStatus', label: '订单核对状态', width: '100px' },
    { prop: 'control', label: '操作', width: '100px', fixed: 'right' }
  ]

  @Getter refundingConfig ( state ) {
    return getterConfig( state.store41, state.config41 )
  }
  @Getter orderCheckConfig ( state ) {
    return getterConfig( state.store42, state.config42 )
  }

  @Mutation setRefundingConf ( state, data ) {
    state.store41 = data
    localStorage.setItem( 'refundingConfig', data )
  }
  @Mutation setOrderCheckConf ( state, data ) {
    state.store42 = data
    localStorage.setItem( 'orderCheckConfig', data )
  }

  accountCheckingList = []

  @Action getAccountCheckingList ( { commit, state }, o ) {
    return http( API.getAccountCheckingList, o ).then( ( { data } ) => {
      commit( 'setAccountCheckingList', data.list )
      return data
    } )
  }

  @Mutation setAccountCheckingList ( state, data ) {
    state.accountCheckingList = data
  }

  @Action saveBankSnBatch ( state, o ) {
    return http( API.saveBankSnBatch, o ).then( res => {
      return res
    } )
  }

}

const storeModule = extractVuexModule( ServerModule )
export default storeModule