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
import invoiceOrder from '@/pages/invoice/components/invoiceOrder.vue'
import invoiceStatement from '@/pages/invoice/components/invoiceStatement.vue'
import invoiceWithGoods from './components/invoiceWithGoods'

export default {
  name: 'invoice-list',
  components: {
    invoiceRecode,
    invoiceOrder,
    invoiceStatement,
    invoiceWithGoods
  },
  props: {
  },
  data() {
    const tabs = [
      { prop: 'invoiceWithGoods', label: '待开随货发票',permission:[1195,1191] },
      { prop: 'invoiceOrder', label: '待开票订单',permission:[1193,1189] },
      { prop: 'invoiceStatement', label: '待开票对账单',permission:[1194,1190] },
      { prop: 'invoiceRecode', label: '开票记录',permission:[1188,1184] }
    ].filter(item=>this.$permissionValidateWithEnv(...item.permission))
    return {
      tabs,
      tab: (tabs[0]||{}).prop,
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
    } ),
    loadData() {

    }
  },
  created() {
  }
}
</script>
<style lang="stylus" scoped>
</style>

<style lang="stylus">

</style>

