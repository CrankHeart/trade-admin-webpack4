<template>
  <div class="detail-invoice">
    <template v-if="invoiceMsg.id">
      <span>
        <order-invoice-header
          @remake="reMakeInvoice"
          :invoice-msg="invoiceMsg"
          @fresh-invoice-info="freshInvoiceInfo"
          :had-invoice="invoiceMsg.id?true:false"
          :is-opened="isOpened"
          :tenant-info="tenantInfo"
          :order-type="orderType"
          :order-status="orderStatus"
          type="order"
        />
        <!-- <detail-invoice-list
          @refresh="getInvoiceList"
          :id="orderSn"
          :order-status="orderStatus"
          :invoice-msg="invoiceMsg"
          :invoice-item-list="invoiceItemList"
        /> -->
      </span>

    </template>
    <template v-else>
      <div class="center">
        <span v-if="isCommonOrder">暂无发票信息</span>
        <span v-else>月结订单目前暂时无法查看纸质发票，请到对账单详情查看！</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table/'
import DetailInvoiceList from './detailInvoiceList.vue'
import orderInvoiceHeader from '../../order/components/orderInvoiceHeader.vue'
import { invoiceKind, invoiceType } from '../const/invoiceConst'

@Component( {
  name: 'detail-invoice',
  components: {
    lcTable,
    orderInvoiceHeader,
    DetailInvoiceList
  }
} )
export default class DetailInvoice extends Vue {
  @Prop( { default: '' } ) id: string
  @Prop( { default: 0 } ) orderStatus: number
  @Prop( { default: -1 } ) orderType: number
  @Prop( { default: '' } ) tenantId: string
  @Prop( { default: '' } ) officeId: string
  @Inject() formatMyDate
  tenantInfo: any = { tenantId: this.tenantId, officeId: this.officeId }
  invoiceMsg: any = {}
  invoiceItemList: any[] = []
  elecInvoiceStatus: boolean = false

  isEditInvoice: boolean = false

  get orderSn () {
    return this.id || this.$route.params.sn || ''
  }


  get isCommonOrder () {
    return this.orderType === 0
  }

  get isOpened () {
    // 这里如果发票开成功算已经开过
    if ( this.invoiceItemList.length > 0 ) {
      return true
    } else {
      return false
    }
    // return !!( this.failInvoiceList.length && this.invoiceDetailList.length )
  }


  created () {
    this.getInvoiceList()
  }

  freshInvoiceInfo ( params ) {
    // accoutnInvoiceHeader 重新选择/开发票信息需要重新调用发票信息
    this.getInvoiceList()
  }

  getInvoiceList () {
    let param = {
      orderSn: this.orderSn
    }
    this.$http( API.getInvoiceList, param ).then( ( { data } ) => {
      // 这里接口有问题.没有查到invoiceList, 这里应该根据该订单查询出订单选定的发票信息
      this.invoiceItemList = data.invoiceList
      this.invoiceMsg = data.invoiceHeader || {}
      // 是否是纸质发票
      this.elecInvoiceStatus = data.elecInvoiceStatus
    } )
  }

  @Watch( 'tenantId' )
  getUserInvoiceDataList () {
    let param = {
      tenantId: this.tenantId,
      officeId: this.officeId
    }
    this.tenantInfo = param
  }

  createInvoice ( msg: any = {} ) {
    Object.keys( msg ).forEach( key => {
      this.invoiceMsg[ key ] = msg[ key ]
    } )
    this.isEditInvoice = false
  }

  reMakeInvoice () {
    this.invoiceItemList = []
  }

  formatInvoiceKind ( kind ) {
    let obj: any = invoiceKind.filter( v => v.id === kind )[ 0 ] || {}
    return obj.name
  }
  formatInvoiceType ( type ) {
    let obj: any = invoiceType.filter( v => v.id === type )[ 0 ] || {}
    return obj.name
  }
}
</script>

<style lang="stylus" scoped>
.center
  text-align center
</style>
