<template>
  <div class="invoice-manage">
    <el-tabs v-model="tab">
      <el-tab-pane v-for="item in tabs" :key="item.prop" :label="item.label" :name="item.prop"></el-tab-pane>
    </el-tabs>
    <component :is="tab" :height="boxHeight"></component>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import invoiceRecode from '@/pages/invoice/components/invoiceRecode.vue'
import paymentVoucher from '@/pages/receivable/components/paymentVoucher.vue'
import transactionFlow from '@/pages/receivable/components/transactionFlow.vue'
import refundApplicationRecord from '@/pages/receivable/components/refundApplicationRecord.vue'
import paymentVoucherList from '@/pages/server/paymentVoucherList.vue'

export default {
  name: 'customer-settlement',
  components: {
    transactionFlow,
    paymentVoucher,
    paymentVoucherList,
    refundApplicationRecord
  },
  props: {
  },
  data() {
    const tabs = [
      { prop: 'paymentVoucherList', label: '线下付款凭证', permission: [ 1210, 1206 ] },
      { prop: 'refundApplicationRecord', label: '退款申请记录', permission: [ 1238, 1234 ] },
      { prop: 'transactionFlow', label: '交易流水', permission: [ 1218, 1214 ] }
    ].filter( item => this.$permissionValidateWithEnv( ...item.permission ) )
    return {
      tabs,
      tab: ( tabs[ 0 ] || {} ).prop,
      page: { cur: 1, num: 10, total: 0 }
    }
  },
  computed: {
    ...mapGetters( {
      moreNum: 'invoice/moreNum'
    } ),
    ...mapState( {
      clientHeight: state => state.clientHeight
    } ),
    boxHeight() {
      this.clientHeight - 240 + 'px'
    }
  },
  watch: {
  },
  methods: {
    ...mapActions( {
      getInvoiceList: 'invoice/getInvoiceList',
      deleteInvoice: 'invoice/deleteInvoice',
      setDefaultInvoice: 'invoice/setDefaultInvoice',
      isZiYing: 'stores/isZiYing'
    } ),
    ...mapMutations( {
      setOperInvoiceMutation: 'invoice/setOperInvoiceMutation',
    } )
  }
}
</script>
