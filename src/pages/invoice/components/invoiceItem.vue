<template>
  <div class="invoice-list-item">
    <template v-if="isNoSelect">
      <div>不选择发票</div>
    </template>
    <template v-else>
      <div class="oper" v-if="this.$slots.oper">
        <slot name="oper"></slot>
      </div>
      <div class="invoice-list-item-text">开票方式: {{formatInvoiceKind(invoice.invoiceKind)}}</div>
      <div class="invoice-list-item-text">详细地址: {{invoice.companyAddress}}</div>
      <div class="invoice-list-item-text">开票类型: {{formatInvoiceType(invoice.invoiceType)}}</div>
      <div class="invoice-list-item-text">联系方式: {{invoice.invoiceMobile}}</div>
      <div class="invoice-list-item-text">发票抬头: {{invoice.invoiceTitle}}</div>
      <div class="invoice-list-item-text">开户银行: {{invoice.bankDeposit}}</div>
      <div class="invoice-list-item-text">企业税号: {{invoice.taxpayerId}}</div>
      <div class="invoice-list-item-text">银行卡号: {{invoice.bankAccount}}</div>
      <div
        class="invoice-list-item-text"
        v-if="invoice.invoiceKind == 1"
      >邮寄地址: {{invoice.consignee}} {{invoice.consigneeTel}} {{invoice.consigneeAddress}}</div>
    </template>
    <div class="clear"></div>
  </div>
</template>
<script>
import { invoiceKind, invoiceType, defaultInvoiceType, defaultInvoiceKind } from '@/pages/order/const/invoiceConst.ts'
export default {
  name: 'invoice-item',
  components: {
  },
  props: {
    invoice: {
      type: Object
    },
    isNoSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      invoiceTypes: invoiceType,
      invoiceKinds: invoiceKind
    }
  },
  methods: {
    formatInvoiceKind( id ) {
      return ( this.invoiceKinds[ id ] && this.invoiceKinds[ id ].name ) || ''
    },
    formatInvoiceType( id ) {
      return ( this.invoiceTypes[ id ] && this.invoiceTypes[ id ].name ) || ''
    }
  },
  created() {
  }
}
</script>
<style lang="stylus" scoped>
.invoice-list-item
  position relative
  box-sizing border-box
  padding 15px 10px 15px 10px
  font-size 14px
  .checkbox
    position absolute
    top 50px
    left 15px
    cursor pointer
.invoice-list-item-text
  width 50%
  overflow hidden
  text-overflow ellipsis
  line-height 20px
  float left
.invoice-list-title
  margin-top 15px
.oper
  text-algin right
  width 100%
  height 25px
  line-height 25px
  margin-top -5px
  margin-bottom 10px
  .oper-item
    background #50bfff
    color #fff
    padding 0 15px
    border-radius 5px
    float right
    margin-right 10px
  .default
    background #ff5000
    cursor default
.clear
  clear both
</style>

