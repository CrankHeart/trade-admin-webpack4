<template>
  <div class="invoice">
    <invoice-list v-if="tenant" :tenantInfo="tenant" :checkable="false"></invoice-list>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table'
import lcCondition from '../../../components/condition.vue'
import { isTicketOpenings } from '../const/index'
import API from '../../../API'
import orderDetail from '../../order/detail.vue'
import { matchArrItem } from '../../../utils/'
import { State, Action } from "vuex-class"
import invoiceList from '@/pages/invoice/invoiceList.vue'
@Component( {
  name: 'portraitDetailInvoice',
  components: {
    lcTable,
    lcCondition,
    orderDetail,
    invoiceList
  }
} )
export default class portraitDetailInvoice extends Vue {
  @Prop()
  tenant: any
  @State( state => state.invoice.invoiceList ) invoiceList
  @Action( "invoice/getInvoiceList" ) getInvoiceList
  @Action( "invoice/setDefaultInvoice" ) setDefaultInvoice
  @Action( "invoice/deleteInvoice" ) deleteInvoice
  // @Mutation( 'invoice/setPortraitConfig' ) setPortraitConfig

  formatStatus ( item, type ) {
    return matchArrItem( item, type, "id" ).name
  }

  exportDetail ( item ) {
    let sn = item.sn
    this.$submit( API.orderExportDispersed, {
      snList: sn
    } )
  }

  formatInvoiceStauts ( item ) {
    let { isInvoiceOpened, invoiceSn = "" } = item
    if ( isInvoiceOpened == 2 ) {
      // 已开票的显示发票单号，没有的话显示 ''
      return invoiceSn
    } else {
      let invoiceOpen: any = isTicketOpenings.filter( v => v.id === isInvoiceOpened )[ 0 ] || {}
      return invoiceOpen.name || ""
    }
  }
}
</script>
<style lang="stylus" scoped>
  .box
    height 515px
    padding 10px
  .el-tabs
    margin -10px 0 0
  .el-select
    width 100%
</style>
<style lang="stylus">

</style>
