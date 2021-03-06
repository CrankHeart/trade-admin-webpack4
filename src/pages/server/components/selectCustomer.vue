<template>
  <div class="select-customer">
    <lc-condition :condition="conditionByType" @submit="search" label-width="100px"></lc-condition>
    <div>
      <el-button
        type="primary"
        v-if="$permissionValidate( [1045,1068,1057,1062] )"
        @click="addPaymentVoucher()"
        :disabled="!selectedData.length"
      >新增</el-button>
    </div>
    <lc-table
      :selection="true"
      ref="selectCustomerRef"
      :config="orderType ? monthlyConfig : commonConfig"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="monthlyConfig.length"
      @data-selection-change="dataSelectionChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop == 'orderSn'">{{scope.row.orderSn}}</template>
        <template v-else-if="scope.con.prop == 'orderList'">
          <div v-for="(item,i) in scope.row.orderList" :key="i">
            {{item.orderSn}}
            <el-tooltip
              effect="dark"
              placement="top-start"
              v-if="item.serviceSns&&item.serviceSns.length"
            >
              <div slot="content">
                服务单:
                <br />
                <span v-for="(serviceSn,i) in item.serviceSns" :key="i">
                  {{serviceSn}}
                  <br />
                </span>
              </div>
              <i class="el-icon-warning"></i>
            </el-tooltip>
          </div>
        </template>
        <template
          v-else-if="scope.con.prop == 'orderStatus'"
        >{{formatOrderStatus(scope.row.orderStatus)}}</template>
        <template
          v-else-if="scope.con.prop == 'settlementStatus'"
        >{{formatSettlementStatus(scope.row.settlementStatus)}}</template>
        <template
          v-else-if="scope.con.prop == 'checkStatus'"
        >{{formatCheckStatus(scope.row.checkStatus)}}</template>
        <template
          v-else-if="scope.con.prop == 'createDate' || scope.con.prop == 'checkDate'"
        >{{formatMyDate(scope.row[scope.con.prop] && scope.row[scope.con.prop].time)}}</template>
        <template v-else-if="scope.con.prop == 'control'"></template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import lcTable from "../../../components/table/index"
import lcCondition from "../../../components/condition.vue"
import { orderAllStatus, settlementStatus } from "../../order/const/orderSearchCondition"
import { orderCheckStatus } from "../const/serverConstant"
import { matchArrItem } from '../../../utils'
import API from '../../../API'
@Component( {
  name: 'select-customer',
  components: {
    lcTable,
    lcCondition
  }
} )
export default class selectCustomer extends Vue {
  data: Array<object> = []
  config: Array<object> = []
  orderType: Number = 0
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  @Prop( { default: () => { } } )
  formInline
  @Prop( { default: '' } )
  customer: string
  @Prop( { type: Array } )
  officeOrderList
  @Watch( 'customer' )
  customerWatcher ( v ) {
    this.data = []
    if ( v == 'monthlyCustomer' ) {
      this.orderType = 1
    } else {
      this.orderType = 0
    }
    this.search()
  }
  conditionMonthly = [
    { value: '', key: 'accountCheckSn', label: '对账单号', type: 'text' },
    { value: '', key: 'orderSn', label: '订单号', type: 'text' }
  ]
  condition = [
    { value: '', key: 'orderSn', label: '订单号', type: 'text' },
    { value: '', key: 'orderDate', label: '下单时间', type: 'daterange' }
  ]

  get conditionByType () {
    return this.customer == 'monthlyCustomer' ? this.conditionMonthly : this.condition
  }
  // get ordinaryCondition () {
  //   return this.condition.slice( 1 )
  // }
  commonConfig = [
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'orderSn', label: '订单号', width: '230px' },
    { prop: 'paymentSn', label: '支付单号', width: '210px' },
    { prop: 'amount', label: '订单金额', width: '120px' },
    { prop: 'orderStatus', label: '订单状态', width: '120px' },
    { prop: 'createDate', label: '下单时间', width: '180px' },
    { prop: 'control', label: '操作', width: '140px', fixed: 'right' },
  ]
  monthlyConfig = [
    { prop: 'accountCheckSn', label: '对账单号', width: '210px' },
    { prop: 'orderList', label: '订单号', width: '240px' },
    { prop: 'amount', label: '对账单金额', width: '120px' },
    { prop: 'totalWrittenOff', label: '已核销金额', width: '120px' },
    { prop: 'checkStatus', label: '结算状态', width: '120px' },
    { prop: 'checkDate', label: '核对发起时间', width: '280px' },
    { prop: 'control', label: '操作', width: '140px', fixed: 'right' },
  ]
  sizeChange ( v ) {
    this.data = []
    this.page.num = v
    this.page.cur = 1
    this.search()
  }
  @Inject() formatMyDate
  formatOrderStatus ( id ) {
    return orderAllStatus[ id ]
  }
  formatSettlementStatus ( id ) {
    return matchArrItem( id, settlementStatus, 'id' ).name
  }
  formatCheckStatus ( id ) {
    return matchArrItem( id, orderCheckStatus, 'id' ).name
  }
  selectedData: any = []
  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }
  get customerId () {
    return this.formInline.customerId
  }
  search ( cur?: number ) {
    this.page.cur = cur || this.page.cur
    this.dataAdapter()
    let o = this.params
    let orderTypeSns = this.orderType ? this.officeOrderList && this.officeOrderList.map( v => v.accountCheckSn ) || [] : this.officeOrderList && this.officeOrderList.map( v => v.orderSn ) || []
    let APIpath = this.orderType ? 'getPaymentVoucherStatements' : 'getPaymentVoucherOrders'
    this.$http( API[ APIpath ], { ...o, customerId: this.customerId, orderType: this.orderType } ).then( ( { data } ) => {
      let filterStr = this.orderType ? 'accountCheckSn' : 'orderSn'
      this.data = data.data.list.filter( v => orderTypeSns.indexOf( v[ filterStr ] ) < 0 ) || []
      this.page.total = data.data.total
    } )
  }
  params: any = {}
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    this.conditionByType.forEach( ( val: any = {} ) => {
      let { key, value, type } = val
      if ( type == 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          o[ key + 'Begin' ] = this.formatMyDate( start )
          o[ key + 'End' ] = this.formatMyDate( end, void 0, true )
        }
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        }
      }
    } )
    this.params = o
  }
  curChange ( cur ) {
    this.data = []
    this.page.cur = cur
    this.search()
  }
  addPaymentVoucher ( v ) {
    this.$emit( 'change-office-list', this.selectedData )
    this.$emit( 'input', false )

  }

  created () {
    if ( this.customer == 'monthlyCustomer' ) {
      this.orderType = 1
    }
    this.search()
  }
  mounted () {
    ( this.$refs.selectCustomerRef as any ).clearSelection()
  }
  activated () {
    ( this.$refs.selectCustomerRef as any ).clearSelection()
    if ( this.customer == 'monthlyCustomer' ) {
      this.orderType = 1
    }
    this.search()
  }
  destroyed () {
    this.data = []
  }
  deactivated () {
    this.data = []
  }
  resetCondition () {
    this.condition = this.conditionByType
  }
}
</script>
<style lang="stylus">
.customer-table
  .el-table__body-wrapper
    z-index 0
</style>
