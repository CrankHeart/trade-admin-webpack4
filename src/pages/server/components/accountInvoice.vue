<template>
  <div class="account-invoice">
    <div>
      <account-invoice-header
        :accountCheckSn="accountCheckSn"
        :invoice-msg="invoiceMsg"
        @fresh-invoice-info="freshInvoiceInfo"
        :had-invoice="hasInvoice"
        :tenant-info="tenantInfo"
        :canSelectParams="{dimension:detail.dimension||null}"
        :is-opened="isOpened"
        type="account"
      ></account-invoice-header>
      <template>
        <!-- <account-invoice-detail-list
          @change-page="curChange"
          :invoice-type="invoiceMsg.invoiceType"
          :paper="isPaperInvoice"
          :page="page"
          :list="invoiceDetailList"
          :account-check-sn="accountCheckSn"
        ></account-invoice-detail-list>
        <account-invoice-failed-list
          v-if="!isPaperInvoice && failInvoiceList.length > 0"
          :account-check-sn="accountCheckSn"
          :list="failInvoiceList"
        ></account-invoice-failed-list>-->
      </template>
    </div>
    <template v-if="!hasInvoice"></template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import accountInvoiceFailedList from './accountInvoiceFailedList.vue'
import accountInvoiceDetailList from './accountInvoiceDetailList.vue'
import accountInvoiceHeader from './accountInvoiceHeader.vue'
import API from '../../../API'
@Component( {
  name: 'account-invoice',
  components: {
    accountInvoiceFailedList,
    accountInvoiceDetailList,
    accountInvoiceHeader
  }
} )
export default class AccountInvoice extends Vue {
  @Prop( { default: '' } ) officeId: string
  @Prop( { default: '' } ) tenantId: string
  @Prop( { default: '' } ) accountCheckSn: string
  @Prop( {
    required: false, default: () => {
      return { dimension: null }
    }
  } ) detail: any
  tenantInfo: any = { tenantId: this.tenantId, officeId: this.officeId }
  page = { cur: 1, num: 10, total: 0 }
  invoiceMsg: any = {} // 当期已经提交的发票信息
  invoiceDetailList: any[] = []
  failInvoiceList: any[] = []
  hasInvoice: any = null // 是否已经有开票信息

  get isPaperInvoice () {
    return this.invoiceMsg && this.invoiceMsg.invoiceKind === 1
  }

  get hadInvoiceInfo () {
    return !!( this.invoiceMsg && this.invoiceMsg.id )
  }

  get isOpened () {
    // 这里如果发票开失败或者成功都算已经开过
    // if ( this.invoiceDetailList.length > 0 || this.failInvoiceList.length > 0 ) {
    if ( this.invoiceDetailList.length > 0 ) {
      return true
    } else {
      return false
    }
    // return !!( this.failInvoiceList.length && this.invoiceDetailList.length )
  }

  created () {
    this.getInvoice()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.getInvoice()
  }

  freshInvoiceInfo ( params ) {
    // accoutnInvoiceHeader 重新选择/开发票信息需要重新调用发票信息
    this.getInvoice()
  }

  getInvoice () {
    this.$permissionValidateWithNotify( 1081 )
    if ( !( this.officeId && this.tenantId && this.accountCheckSn ) ) {
      return
    }
    let { cur, num } = this.page
    this.$http( API.accountInvoiceList, {
      officeId: this.officeId,
      tenantId: this.tenantId,
      accountCheckSn: this.accountCheckSn,
      start: ( cur - 1 ) * num,
      num
    } ).then( ( { data } ) => {
      data = data.data || {}
      if ( data.invoiceHeader && Object.keys( data.invoiceHeader ).length > 0 ) {
        this.hasInvoice = true
        this.invoiceMsg = data.invoiceHeader
      } else {
        this.hasInvoice = false
      }

      if ( data.invoiceList && data.invoiceList.length > 0 ) {
        this.invoiceDetailList = data.invoiceList
      } else {
        this.invoiceDetailList = []
      }

      if ( data.failInvoiceList && data.failInvoiceList.length > 0 ) {
        this.failInvoiceList = data.failInvoiceList
      } else {
        this.failInvoiceList = []
      }

      this.page.total = data.count
    } )
  }

}
</script>

<style lang="stylus" scoped>
.account-invoice
  .title
    display flex
    align-items center
    margin-bottom 10px
    span
      flex 1
      text-align right
  .card-margin
    margin-bottom 20px
  .row-line
    border-top 1px solid #ccc
    margin-top 10px
    padding-top 10px
</style>

