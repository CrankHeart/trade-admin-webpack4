<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" labelWidth="100px" @submit="search"></lc-condition>
    <el-tabs v-model="voucherTab">
      <el-tab-pane
        v-for="item in voucherTabs"
        :key="item.prop"
        :label="item.label"
        :name="item.prop"
      ></el-tab-pane>
    </el-tabs>
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
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import { matchArrItem } from '@/utils/'
import { voucherStatuses } from '@/pages/server/const/paymentVoucherConst.ts'

import API from '@/API'

export default {
  name: 'payment-voucher',
  components: {
    lcCondition,
    lcTable
  },
  inject: [ 'formatMyDate' ],
  data() {
    return {
      voucherTabs: [
        { prop: 'account', label: '按对账单付款' },
        { prop: 'order', label: '按订单付款' }
      ],
      voucherTab: 'account',
      condition: [
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: '', key: 'sn', label: '凭证编号', type: 'text' },
        { value: '', key: 'orderSn', label: '订单号', type: 'text' },
        { value: '', key: 'acsn', label: '对账单号', type: 'text' },
        { value: '', key: 'sjlsh', label: '商家流水号', type: 'text' },
        { value: [], key: 'createTime', label: '创建日期', type: 'daterange' },
        { value: [], key: 'updateTime', label: '最后更新日期', type: 'daterange' },
        { value: 0, key: 'arrearsTypes', label: '状态', type: 'radio', col: { lg: 24, sm: 24 }, options: voucherStatuses }
      ],
      config: [
        { prop: 'tenantName', label: '凭证编号', width: '220px' },
        { prop: 'officeName', label: '客户名称', width: '220px' },
        { prop: 'officeId', label: '交易流水号', width: '220px' },
        { prop: 'officeId', label: '商家流水号', width: '220px' },
        { prop: 'officeId', label: '付款凭证状态', width: '220px' },
        { prop: 'officeId', label: '对账单号', width: '220px' },
        { prop: 'officeId', label: '核销金额', width: '220px' },
        { prop: 'saasCode', label: '凭证金额', width: '220px' },
        { prop: 'monthly', label: '审核备注', width: '160px' },
        { prop: 'settlementCycle', label: '创建时间', width: '180px' },
        { prop: 'currentArrearsAmount', label: '最后更新时间', width: '220px' },
        { prop: 'overdueArrearsAmount', label: '创建人', width: '220px' },
        { prop: 'unexpiredArrearsAmount', label: '销售负责人', width: '180px' },
        { prop: 'officeId', label: '实际付款时间', width: '220px' },
        { prop: 'officeId', label: '最后更新人', width: '220px' },
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
      this.$router.push( `/receivable/customerReceivables/${item.id}?customerId=${item.customerId}` )
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time )
      }
      return ''
    },
    curChange( cur ) {
      this.page.cur = cur
      this.loadData()
    },
    dataAdapter() {
      let o = {}
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
            o[ `${key}Start` ] = this.formatMyDate( value[ 0 ] )
            o[ `${key}End` ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          }
        } else {
          if ( value !== '' ) {
            o[ key ] = value
          }
        }
      } )
      return o
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time )
      }
      return ''
    },
    formatSettlemenetCycle( item ) {
      let { monthly, settlementCycle } = item
      return monthly ? ( settlementCycle ? `${settlementCycle}个月` : '固定期限' ) : '--'
    },
    loadData() {
      // this.$permissionValidateWithNotifyEnv(1193,1189)
      // let params = this.dataAdapter()
      // this.$http( API.searchUsersArrears, params ).then( ( { data } ) => {
      //   let ret = data.data
      //   this.lists = ( ret.list || [] ).map( v => ( { ...v, yxLimit: 0 } ) )
      //   this.page.total = ret.total
      // }, rej => {
      //   this.$message( {
      //     message: rej.msg,
      //     type: 'warning'
      //   } )
      // } )
    },
    search() {
      this.$permissionValidateWithNotifyEnv( 1204, 1200 )
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
