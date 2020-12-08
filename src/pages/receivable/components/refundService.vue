<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" labelWidth="100px" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="lists"
      @cur-change="curChange"
      :page="page"
      :key="orderType ? 'accountCheckSn' : 'orderSn'"
      selection
      @data-selection-change="selectionChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'control'">
          <el-button @click="openDialog(row)" type="primary" size="small">查看详情</el-button>
        </template>
        <template v-if="con.prop == 'applyTime'">{{ formatDate(row[con.prop]) }}</template>
        <template v-else-if="con.prop == 'refundAmount'">
          <span>{{ row[con.prop] | fixed2 }}</span>
        </template>
        <template v-else>{{ row[con.prop] }}</template>
      </template>
    </lc-table>
    <div class="amount-info" v-if="lists.length">
      申请退款总金额：
      <span>{{redundTotalAmount | fixed2}}</span>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import { matchArrItem, openNewWebWin, formatPrice } from '@/utils/'
import { voucherStatuses } from '@/pages/server/const/paymentVoucherConst.ts'
import API from '@/API'

const conditionByOrderType = [
  {
    value: '',
    key: 'orderSn',
    label: '订单号',
    type: 'text'
  },
  {
    value: '',
    key: 'serviceSn',
    label: '服务单号',
    type: 'text'
  },
  {
    value: '',
    key: 'applyTime',
    label: '创建时间',
    type: 'daterange'
  }
]

const configByOrderType = [
  { prop: 'serviceSn', label: '服务单号', width: '220px' },
  { prop: 'applyTime', label: '服务单创建时间', width: '220px' },
  { prop: 'orderSn', label: '关联订单号', width: '220px' },
  { prop: 'refundAmount', label: '申请退款金额', width: '220px' },
  { prop: 'control', label: '操作', width: '160px', fixed: 'right' }
]

export default {
  name: 'refund-service',
  components: {
    lcCondition,
    lcTable
  },
  inject: [ 'formatMyDate' ],
  props: {
    customerInfo: {
      type: Object
    }
  },
  watch: {
    customerInfo() {
      this.loadData()
    }
  },
  data() {
    return {
      orderType: 1,
      selectedLists: [],
      selectedSnLists: [],
      condition: conditionByOrderType,
      config: configByOrderType,
      page: { cur: 1, total: 0, num: 20 },
      lists: [],
      redundTotalAmount: 0
    }
  },
  methods: {
    // 查看详情
    openDialog( row = {} ) {
      row.serviceSn
        ? openNewWebWin( `server/refunding?serviceSn=${row.serviceSn}`, '' )
        : openNewWebWin( `server/refunding}`, '' )
    },
    selectionChange( items ) {
      this.selectedLists = JSON.parse( JSON.stringify( items ) )
      this.redundTotalAmount = this.selectedLists.reduce( ( total, cur ) => {
        total += parseFloat( cur.refundAmount )
        return total
      }, 0 )
      this.$emit( 'selectedLists', this.selectedLists )
    },
    formatDate( date = {} ) {
      return date.time ? this.formatMyDate( date.time, 'yyyy-MM-dd hh:mm' ) : ''
    },
    curChange( cur ) {
      this.page.cur = cur
      this.loadData()
    },
    dataAdapter() {
      let o = {}
      o.num = this.page.num
      o.start = ( this.page.cur - 1 ) * o.num
      this.condition.forEach( con => {
        let { key, value, type } = con
        if ( type == 'daterange' ) {
          if ( value && value[ 0 ] ) {
            o[ `${key}Begin` ] = this.formatMyDate( value[ 0 ] )
            o[ `${key}End` ] = this.formatMyDate(
              value[ 1 ],
              'yyyy-MM-dd hh:mm:ss',
              true
            )
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
      if ( !this.customerInfo.customerId ) {
        return
      }
      let params = this.dataAdapter()
      params.customerId = this.customerInfo.customerId
      this.$http( API[ 'getRefundServiceOrders' ], {
        ...params
      } ).then( ( { data } ) => {
        this.lists = data.data.list
        this.page.total = data.data.total
      } )
    },
    search() {
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
.amount-info
  text-align right
  height 30px
  line-height 30px
  span
    color red
</style>
