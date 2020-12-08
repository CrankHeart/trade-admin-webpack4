<template>
  <div class="outbound-check">
    <!-- <el-button v-if="canapplyInvoice" size="small" class="application-invoicing pull-right" type="primary" @click="isShowInvoiceDialog = true">申请开票</el-button> -->
    <div class="el-table el-table--fit el-table--striped el-table--border">
      <table cellpadding="0" cellspacing="0" width="100%">
        <thead>
          <th v-for="(con, index) in config" :key="index" :style="{width:con.width}">
            <div class="cell">{{con.label}}</div>
          </th>
        </thead>
        <tr class="el-table__empty-block" v-if="list.length===0">
          <td :colspan="config.length">
            <div class="cell">暂无数据</div>
          </td>
        </tr>
        <template v-else>
          <template v-for="field in list">
            <tr v-for="(item, index) in field.financialReceivables" :key="item.id">
              <template v-for="con in config">
                <td class="cell" :key="con.prop" v-if="con.prop === 'orderDate'" :style="{
                  visibility: index !== 0 ? 'hidden' : 'initial'
                }">{{!!item[con.prop] ? formatMyDate(item[con.prop].time): null}}</td>
                <td class="cell" :key="con.prop" v-else-if="con.prop === 'orderSn'" :style="{
                  visibility: index !== 0 ? 'hidden' : 'initial'
                }">{{item[con.prop]}}</td>
                <td class="cell" :key="con.prop" v-else-if="con.prop === 'receiptType'">{{formatReceiptTypes(item[con.prop])}}</td>
                <td class="cell" :class="[item['receiptType'] === 2 ? 'red' : '']" :key="con.prop" v-else-if="con.prop === 'checkAmount'">{{item[con.prop].toFixed(2)}}</td>
                <td class="cell" :key="con.prop" v-else-if="con.prop === 'control'"><el-button type="text" @click="viewOrderDetail(item)">查看明细</el-button></td>
                <td class="cell" :key="con.prop" v-else>{{item[con.prop]}}</td>
              </template>
            </tr>
          </template>
          <tr class="total-row">
            <td class="cell" colspan="4">合计：</td>
            <td class="cell" colspan="2">{{detail.paymentAmount.toFixed(2)}}</td>
          </tr>
        </template>
      </table>
    </div>
    <outbound-check-detail v-model="showDialog" :order-sn="orderSn" :checkDetailsListData="checkDetailsListData" :curRowData="curRowData"/>
    <invoice-selecter-dialog
      btnStr='确认核对'
      title='选择发票信息'
      :visible.sync="isShowInvoiceDialog"
      :tenantInfo="currentTenant"
      :selectStoreId="selectStoreId"
      @invoice-selected="invoiceSelected">
    </invoice-selecter-dialog>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import invoiceList from '@/pages/invoice/invoiceList.vue'
import invoiceSelecterDialog from '@/pages/invoice/invoiceSelecterDialog.vue'
import API from '../../../API'
import { matchArrItem } from '../../../utils'
import lcTable from '../../../components/table/'
import OutboundCheckDetail from './outboundCheckDetail.vue'
import { receiptTypes } from '../const/serverConstant'

@Component( {
  name: 'outbound-check',
  components: {
    lcTable,
    OutboundCheckDetail,
    invoiceSelecterDialog
  }
} )
export default class StatementDetail extends Vue {
  @Inject() formatMyDate
  @Prop( { type: Array, default: () => [] } ) list
  @Prop() detail: any
  @Prop( { default: false } ) canapplyInvoice: boolean
  orderSn: String = ''
  showDialog: Boolean = false
  isShowInvoiceDialog: boolean = false
  currentTenant: any = { tenantId: null, officeId: null }
  selectStoreId = null
  config = [
    { prop: 'orderDate', label: '下单时间', width: '200px' },
    { prop: 'orderSn', label: '订单号', width: '200px' },
    { prop: 'receiptType', label: '单据类型', width: '200px' },
    { prop: 'receiptNo', label: '单据编号', width: '200px' },
    { prop: 'receivableAmount', label: '总金额', width: '200px' },
    { prop: 'control', label: '操作', width: '200px' }
  ]

  noInvoice: boolean = false // 不选择发票
  currentInvoice: any = {}
  get canDisabled () {
    if ( this.noInvoice == true ) {
      return false
    }
    return !this.currentInvoice || !this.currentInvoice.id
  }
  formatReceiptTypes ( id ) {
    return matchArrItem( id, receiptTypes, 'id' ).name
  }
  invoiceSelected ( invoice ) {
    // TODO 拿到发票数据请求发起核对接口
    console.log( invoice )
  }
  @Watch( 'detail', { deep: true } )
  getDetail ( v ) {
    if ( v.tenantId ) {
      this.currentTenant.tenantId = v.tenantId
      this.currentTenant.officeId = v.officeId
      this.selectStoreId = v.storeId
    }
  }
  checkDetailsListData: any[] = []
  curRowData: any = {}
  get accountCheckSn(){
    return this.detail && this.detail.accountCheckSn
  }
  viewOrderDetail ( row ) {
    this.showDialog = true
    this.curRowData = row
    this.$http( API.getInoutStockGoodsDetail, { 
      // accountDeliveryId: row.id,
      accountCheckSn: this.accountCheckSn,
      receiptNo: row.receiptNo
    } ).then( ( { data } ) => {
      this.checkDetailsListData = data.data
    } )
  }
}
</script>

<style lang="stylus" scoped>
.red
  color red
.outbound-check
  .application-invoicing
    margin-bottom 10px
  table
    tr td
      border 0
    .total-row
      height 60px
      td
        border-top 1px solid #dfe6ec
</style>

