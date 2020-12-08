<template>
  <div class="user-portrait-table">
    <el-tabs v-model="componentName">
      <el-tab-pane label="商品报价单" name="portraitDetailQuote" v-if="$permissionValidate(1020)">
        <portrait-detail-quote v-if="componentName == 'portraitDetailQuote'" :tenant="tenant"></portrait-detail-quote>
      </el-tab-pane>

      <el-tab-pane label="历史订单" name="portraitDetailHistory" v-if="$permissionValidate(561)">
        <PortraitDetailHistory v-if="componentName == 'portraitDetailHistory'" :tenant="tenant"></PortraitDetailHistory>
      </el-tab-pane>
      <el-tab-pane label="商品渗透" name="portraitDetailProduct" v-if="$permissionValidate(563)">
        <portrait-detail-product v-if="componentName == 'portraitDetailProduct'"></portrait-detail-product>
      </el-tab-pane>
      <el-tab-pane label="历史服务单" name="portraitDetailService" v-if="$permissionValidate(771)">
        <PortraitDetailService v-if="componentName == 'portraitDetailService'" :tenant="tenant"></PortraitDetailService>
      </el-tab-pane>
      <el-tab-pane label="月结客户对账" name="portraitDetailCheckOrders" v-if="$permissionValidate(777)">
        <PortraitDetailCheckOrders
          v-if="componentName == 'portraitDetailCheckOrders'"
          :tenant="tenant"
        ></PortraitDetailCheckOrders>
      </el-tab-pane>
      <!-- 修改权限 -->
      <!-- <el-tab-pane label="付款凭证" name="portraitDetailPaymentVoucher" v-if="$permissionValidate(1053)">
        <portrait-detail-payment-voucher v-if="componentName == 'portraitDetailPaymentVoucher'"></portrait-detail-payment-voucher>
      </el-tab-pane>-->
      <el-tab-pane label="发票管理" name="portraitDetailInvoice">
        <portrait-detail-invoice v-if="componentName == 'portraitDetailInvoice'" :tenant="tenant"></portrait-detail-invoice>
      </el-tab-pane>
    </el-tabs>
    <!-- <div class="table-conntainer">
      <component :is="componentName"></component>
    </div>-->
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
// 历史订单
import PortraitDetailHistory from './portraitDetailHistory.vue'
import portraitDetailProduct from './portraitDetailProduct.vue'
// 历史服务单
import PortraitDetailService from './portraitDetailService'
// 月结客户对账
import PortraitDetailCheckOrders from './portraitDetailCheckOrders'
import portraitDetailQuote from './portraitDetailQuote.vue'
// import portraitDetailPaymentVoucher from './portraitDetailPaymentVoucher.vue'
import portraitDetailInvoice from './portraitDetailInvoice.vue'
@Component( {
  name: 'UserPortraitDetailTable',
  components: {
    PortraitDetailHistory,
    portraitDetailProduct,
    PortraitDetailService,
    PortraitDetailCheckOrders,
    portraitDetailQuote,
    // portraitDetailPaymentVoucher,
    portraitDetailInvoice
  }
} )
export default class UserPortraitDetailTable extends Vue {
  @Prop()
  tenant: any
  componentName: string = ''
  setComponent () {
    this.componentName = this.$route.query.componentName
      || this.$permissionValidate( 1020 ) && 'portraitDetailQuote'
      || this.$permissionValidate( 561 ) && 'portraitDetailHistory'
      || this.$permissionValidate( 563 ) && 'portraitDetailProduct'
      || this.$permissionValidate( 771 ) && 'portraitDetailService'
      || this.$permissionValidate( 777 ) && 'portraitDetailCheckOrders'
    // || this.$permissionValidate( 1053 ) && 'portraitDetailPaymentVoucher'
  }
  created () {
    this.setComponent()
  }
  activated () {
    this.setComponent()
  }
}
</script>
<style lang="stylus">
.user-portrait-table
  .table-conntainer
    min-height 400px
</style>
