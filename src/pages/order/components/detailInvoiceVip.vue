<template>
  <div class="detail-invoice">
    <template v-if="hasInvoiceData">
      <span>
        <account-invoice-header
          v-model="isEditInvoice"
          v-if="hasInvoiceMsg"
          @open-invoice-edit-dialog="openInvoiceEditDialog"
          @remake="reMakeInvoice"
          @edit="isEditInvoice=true"
          :invoice-msg-list="invoiceMsgList"
          :invoice-msg="invoiceMsg"
          :order-type="orderType"
          :order-status="orderStatus"
          type="order"
        />
        <detail-invoice-list
          @refresh="getInvoiceList"
          :id="orderSn"
          :order-status="orderStatus"
          :invoice-msg="invoiceMsg"
          :invoice-item-list="invoiceItemList"
        />
        <account-invoice-edit-dialog
          :invoice-item-msg="invoiceItemMsg"
          :edit="isEditInvoice"
          :visible.sync="isShowInvoiceDialog"
          @update-invoice-msg-list="updateInvoiceMsgList"
        />
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
import accountInvoiceHeader from '../../server/components/accountInvoiceHeader.vue'
import AccountInvoiceEditDialog from '../../server/components/accountInvoiceEditDialog.vue'
import { invoiceKind, invoiceType } from '../const/invoiceConst'

@Component( {
  name: 'detail-invoice-vip',
  components: {
    lcTable,
    accountInvoiceHeader,
    DetailInvoiceList,
    AccountInvoiceEditDialog
  }
} )
export default class DetailInvoiceVip extends Vue {
  @Prop( { default: '' } ) id: string
  @Prop( { default: 0 } ) orderStatus: number
  @Prop( { default: -1 } ) orderType: number
  @Prop( { default: '' } ) tenantId: string
  @Prop( { default: '' } ) officeId: string
  @Inject() formatMyDate

  invoiceMsg: any = {}
  invoiceItemMsg: any = {}
  invoiceMsgList: any[] = []
  invoiceItemList: any[] = []
  isShowInvoiceDialog: boolean = false
  elecInvoiceStatus: boolean = false

  isEditInvoice: boolean = false

  get orderSn () {
    return this.id || this.$route.params.sn || ''
  }

  get hasInvoiceData () {
    return this.invoiceItemList.length || Object.keys( this.invoiceMsg ).length
  }

  get hasInvoiceMsg () {
    return Object.keys( this.invoiceMsg ).length
  }
  get isCommonOrder () {
    return this.orderType === 0
  }
  get isGeneratedInvoice () {
    return !!this.invoiceItemList.length
  }

  created () {
    this.getInvoiceList()
  }
  updateInvoiceMsgList () {
    this.getUserInvoiceDataList()
  }
  openInvoiceEditDialog ( idx ) {
    this.isShowInvoiceDialog = true
    this.invoiceItemMsg = this.invoiceMsgList[ idx ]
  }
  getInvoiceList () {
    let param = {
      orderSn: this.orderSn
    }
    this.$http( API.getInvoiceList, param ).then( ( { data } ) => {
      this.invoiceItemList = data.invoiceList
      this.invoiceMsg = data.invoiceHeader || {}
      this.elecInvoiceStatus = data.elecInvoiceStatus
    } )
  }

  @Watch( 'tenantId' )
  getUserInvoiceDataList () {
    let param = {
      tenantId: this.tenantId,
      officeId: this.officeId
    }
    this.$http( API.getUserInvoiceDataList, param ).then( ( { data } ) => {
      this.invoiceMsgList = data.data || []
    } )
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
