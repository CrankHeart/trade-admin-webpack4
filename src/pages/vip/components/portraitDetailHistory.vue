<template>
  <div class="user-portrait-history">
    <lc-condition :condition="condition" @submit="search" label-width="100px"></lc-condition>
    <lc-table :config="config" :data="myData" :page="page" @cur-change="curChange">
      <template slot-scope="{row,con}">
        <template v-if="con.prop=='createDate'">{{formatMyDate(row[con.prop])}}</template>
        <template v-else-if="con.prop=='orderStatus'">{{converOrderStatus(row[con.prop])}}</template>
        <template v-else-if="con.prop=='sn'">
          <el-button @click=" orderSn = row[con.prop]" type="text">{{row[con.prop]}}</el-button>
        </template>
        <template
          v-else-if="con.prop=='settlementStatus'"
        >{{formatStatus(row.settlementStatus, settlementStatus)}}</template>
        <template v-else-if="con.prop=='orderType'">{{formatStatus(row.orderType, orderTypes)}}</template>
        <template v-else-if="con.prop=='invoiceSn'">
          <!-- {{ row.invoiceSn || '未开票' }} -->
          {{ formatInvoiceStauts( row ) }}
        </template>
        <template v-else-if="con.prop=='sn'">
          <el-button @click="orderSn = row[con.prop]" type="text">{{row[con.prop]}}</el-button>
        </template>
        <template v-else-if=" con.prop == 'control' ">
          <el-button
            v-if="row.settlementStatus !== 3 && $permissionValidate(562)"
            @click="exportDetail(row)"
            type="text"
          >导出</el-button>
        </template>
        <!-- <template v-else-if="con.prop=='sn'">
          <router-link :to="`/order/search?sn=${row.sn}`">
            {{row[con.prop]}}
          </router-link>

        </template>
        <template v-else-if="con.prop=='trade_no'">
          <router-link :to="`/order/search?tradeNo=${row.trade_no}`">
            {{row[con.prop]}}
          </router-link>
        </template>-->

        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog
      title="订单详情"
      size="large"
      v-model="orderVisible"
      @close="closeDialog"
      v-if="$permissionValidate(672)"
    >
      <order-detail :order-sn="orderSn" v-if="orderVisible"></order-detail>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table'
import lcCondition from '../../../components/condition.vue'
import { orderAllStatus, settlementStatus, orderTypes } from '../../order/const/orderSearchCondition'
import { isTicketOpenings } from '../const/index'
import API from '../../../API'
import orderDetail from '../../order/detail.vue'
import { matchArrItem } from '../../../utils/'
@Component( {
  name: 'UserPortraitDetailHistory',
  components: {
    lcTable,
    lcCondition,
    orderDetail
  }
} )
export default class UserPortraitDetailHistory extends Vue {
  @Prop() tenant: any
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  orderSn: string = ''
  get orderVisible () {
    return !!this.orderSn
  }
  set orderVisible ( v ) {
    if ( !v ) {
      this.orderSn = ''
    }
  }
  closeDialog () {
    this.orderSn = ''
  }
  settlementStatus = settlementStatus
  isTicketOpenings = isTicketOpenings
  orderTypes = orderTypes

  get orderstatuses () {
    return orderAllStatus.map( ( v, i ) => ( { id: i, name: v } ) )
  }
  @Inject() formatMyDate
  @Prop() item: any
  config: any[] = [
    // { prop: 'store_name', label: '经销商' },
    { prop: 'sn', label: '订单号', width: '200px' },
    // { prop: 'trade_no', label: '支付单号' },
    { prop: 'createDate', label: '下单时间', width: '190px' },
    { prop: 'paymentAmount', label: '支付金额' },
    { prop: 'orderStatus', label: '订单状态' },
    // { prop: 'invoiceSn', label: '开票信息', width: '190px' },
    { prop: 'orderType', label: '订单类型' },
    // { prop: 'settlementStatus', label: '结算状态' },
    { prop: 'control', label: '操作', width: '80px', fixed: 'right' }
  ]
  condition: any[] = [
    { value: '', key: 'sn', label: '订单号', type: 'text' },
    { value: [], key: 'createDate', label: '下单时间', type: 'daterange' },
    { value: '', key: 'orderStatus', label: '订单状态', type: 'select', options: this.orderstatuses },
    // { value: '', key: 'isTicketOpening', label: '是否开票', type: 'radio', options: isTicketOpenings },
    // { value: '', key: 'settlementStatus', label: '结算状态', type: 'radio', options: settlementStatus, col: { lg: 16, sm: 24 } },
  ]
  myData: any[] = []
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    let route: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      route[ key ] = value
      if ( key == 'createDate' ) {
        if ( value && value[ 0 ] ) {
          o[ 'createDateBegin' ] = this.formatMyDate( value[ 0 ] )
          o[ 'createDateEnd' ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
        }
        delete route[ key ]
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        } else {
          delete route[ key ]
        }
      }
    } )
    const { customerId } = this.tenant
    if ( !customerId ) {
      console.log( '历史订单 customerId 不存在' );
      return;
    }
    this.$http( API.getOfficeOrderList, {
      ...o,
      // ...this.$route.query,
      customerId
    } ).then( ( { data } ) => {
      let myData = data.data
      this.myData = myData.list
      this.page.total = myData.total
    } )
  }
  search ( cur?: number ) {
    this.page.cur = cur || this.page.cur
    this.dataAdapter()
  }
  activated () {
    this.search()
  }
  created () {
    this.search()
  }
  converOrderStatus ( status ) {
    return orderAllStatus[ status ] || '--'
  }
  formatStatus ( item, type ) {
    return matchArrItem( item, type, 'id' ).name
  }
  exportDetail ( item ) {
    let sn = item.sn
    this.$submit( API.orderExportDispersed, {
      snList: sn
    } )
  }
  formatInvoiceStauts ( item ) {
    let { isInvoiceOpened, invoiceSn = '' } = item
    if ( isInvoiceOpened == 2 ) {
      // 已开票的显示发票单号，没有的话显示 ''
      return invoiceSn
    } else {
      let invoiceOpen: any = isTicketOpenings.filter( v => v.id === isInvoiceOpened )[ 0 ] || {}
      return invoiceOpen.name || ''
    }
  }
}
</script>
