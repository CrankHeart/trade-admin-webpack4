<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" labelWidth="100px" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="lists"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop==='control' ">
          <el-button
            @click="detailOper(row)"
            type="primary"
            size="small"
            v-if="$permissionValidateWithEnv( 1205,1201 )"
          >详情</el-button>
        </template>
        <template
          v-else-if="con.prop=='paymentNo'"
        >{{row.paymentMethod == 0 ? row.paymentNo:row.lcTradeSn }}</template>
        <template v-else-if="con.prop=='paymentDate'">{{formatDate(row[con.prop])}}</template>
        <template v-else-if="con.prop=='paymentMethod'">{{formatPaymentMethod1(row[con.prop])}}</template>
        <template v-else-if="con.prop=='paymentChannel'">{{formatPaymentChannel( row )}}</template>
        <template v-else-if="con.prop=='lcBank'">{{formatlcBank( row[con.prop] )}}</template>
        <template v-else-if="['paymentAmount','writtenOffAmount'].includes(con.prop) ">
          <span v-price-info="row[con.prop]"></span>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <div>
      <el-dialog size="samll" title="核销详情" v-model="isShowDialog">
        <transactionFlowItem :item="flowItem"></transactionFlowItem>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import { matchArrItem } from '@/utils/'
import {
  voucherStatuses,
  tradePaymentTypes,
  orderPaymentTypes,
  paymentTypes,
  lcBanks,
  lcAllipays,
  lcWechats,
  lcFinAdjust
} from '@/pages/server/const/paymentVoucherConst.ts'
import transactionFlowItem from '@/pages/receivable/components/transactionFlowItem.vue'
import API from '@/API'

export default {
  name: 'transaction-flow',
  components: {
    lcCondition,
    lcTable,
    transactionFlowItem
  },
  inject: [ 'formatMyDate' ],
  data() {
    return {
      isShowDialog: false,
      flowItem: {},
      condition: [
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: '', key: 'paymentNo', label: '子支付单号', type: 'text' },
        { value: [], key: 'createTime', label: '支付时间', type: 'daterange' },
        { value: '', key: 'paymentMethod', label: '支付方式', type: 'select', options: tradePaymentTypes },
        { value: '', key: 'lcTradeSn', label: '商家流水号', type: 'text' },
        { value: '', key: 'payee', label: '销售负责人', type: 'salesSearch' },
        { value: '', key: 'lcBank', label: '支付账户', type: 'select', options: [ ...lcBanks, ...lcAllipays, ...lcWechats, ...lcFinAdjust ] }
        // { value: [], key: 'isPartWrittenOff',label:'',type:'checkbox',options:[ { id: 1, name: '仅查看未完成核销的流水记录' } ]}
      ],
      config: [
        { prop: 'paymentDate', label: '支付时间', width: '220px' },
        { prop: 'customerName', label: '客户名称', width: '220px' },
        { prop: 'paymentMethod', label: '支付方式', width: '220px' },
        { prop: 'paymentChannel', label: '支付渠道', width: '220px' },
        { prop: 'lcBank', label: '支付账户', width: '220px' },
        { prop: 'payer', label: '付款人', width: '220px' },
        { prop: 'payee', label: '销售负责人', width: '220px' },
        { prop: 'paymentNo', label: '子支付单号/商家流水号', width: '220px' },
        { prop: 'paymentAmount', label: '支付金额', width: '220px' },
        { prop: 'writtenOffAmount', label: '核销金额', width: '220px' },
        { prop: 'control', label: '操作', width: '250px', fixed: 'right' }
      ],
      page: { cur: 1, total: 0, num: 10 },
      lists: [],
      currentReceipt: null
    }
  },
  methods: {
    invoiceCtr( item ) {
      this.currentReceipt = item
    },
    detailOper( item ) {
      this.$permissionValidateWithNotifyEnv( 1220, 1216 )
      this.flowItem = item
      this.isShowDialog = true
      // this.$router.push( `/receivable/customerReceivables/${item.id}?customerId=${item.customerId}` )
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time )
      }
      return ''
    },
    formatlcBank( account ) {
      return matchArrItem( account, [ ...lcBanks, ...lcAllipays, ...lcWechats, ...lcFinAdjust ], "id" ).name || ''
    },
    formatPaymentChannel( row ) {
      // 线上：支付方式 0：微信 1：支付宝 2：银联 3:线下转账。
      // 线下： 支付渠道 1：银行，2：支付宝，3：微信
      let item
      // 线上支付
      if ( row.paymentMethod == 0 ) {
        item = matchArrItem( row.paymentChannel, orderPaymentTypes, "id" );
      } else {
        // 线下支付
        item = matchArrItem( row.paymentChannel, paymentTypes, "id" );
      }
      return item.name || "";
    },
    formatPaymentMethod1( type ) {
      let item = matchArrItem( type, tradePaymentTypes, "id" );
      return item.name || "";
    },
    curChange( cur ) {
      this.page.cur = cur
      this.loadData()
    },
    dataAdapter() {
      let o = { isPartWrittenOff: 0 }
      o.num = this.page.num
      o.start = ( this.page.cur - 1 ) * o.num
      this.condition.forEach( ( con ) => {
        let { key, value, type } = con
        if ( type === 'tenantSearch' ) {
          o.tenantId = value.id
          o.tenantName = value.name
        } else if ( type === 'customerSearch' ) {
          o.customerId = value.id
          o.customerName = value.name
        } else if ( type == 'daterange' ) {
          if ( value && value[ 0 ] ) {
            o[ `startTime` ] = this.formatMyDate( value[ 0 ] )
            o[ `endTime` ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          }
        } else {
          if ( value !== '' ) {
            o[ key ] = value
          }
        }
      } )
      return o
    },
    loadData() {
      // this.$permissionValidateWithNotifyEnv(1193,1189)
      let params = this.dataAdapter()
      this.$http( API.getTransactionList, params ).then( ( { data } ) => {
        let ret = data.data
        this.lists = ( ret.list || [] ).map( v => ( { ...v, yxLimit: 0 } ) )
        this.page.total = ret.total
      }, rej => {
        this.$message( {
          message: rej.msg,
          type: 'warning'
        } )
      } )
    },
    search() {
      this.$permissionValidateWithNotifyEnv( 1219, 1215 )
      this.page.cur = 1
      this.loadData()
    }
  },
  created() {
    this.loadData()
  }
}
</script>
<style lang="stylus" scoped>
.scope-row
  min-height 30px
  line-height 30px
  margin-left -18px
  margin-right -18px
  text-indent 18px
  + .scope-row
    border-top 1px solid #dfe6ec
</style>
