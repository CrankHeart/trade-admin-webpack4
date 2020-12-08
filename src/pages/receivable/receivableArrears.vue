<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="lists"
      @cur-change="curChange"
      @size-change="sizeChange"
      :page="page"
      :key="config.length"
      controllerName="receivableArrearsController"
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
          v-else-if="['unexpiredArrearsAmount','unLaunchedArrearsAmount','currentArrearsAmount','overdueArrearsAmount'].includes(con.prop)"
        >
          <span v-price-info="row[con.prop]"></span>
        </template>
        <template v-else-if="con.prop==='settlementCycle' ">{{formatSettlemenetCycle(row)}}</template>
        <template v-else-if="con.prop==='monthly' ">{{row[con.prop]?'是':'否'}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import { matchArrItem, buildPersonTypeData } from '@/utils/'
import { arrearsStatus } from '@/pages/server/const/serverConstant'
import API from '@/API'

export default {
  name: 'receivable-arrears',
  components: {
    lcCondition,
    lcTable
  },
  inject: [ 'formatMyDate' ],
  data() {
    return {
      condition: [
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: '', key: 'salesSupport', label: '销售支持', type: 'text' },
        { value: [ 0 ], key: 'arrearsTypes', label: '欠款类型', type: 'checkbox', options: arrearsStatus },
      ],
      config: [
        { prop: 'tenantName', label: '集团名称', width: '220px' },
        { prop: 'customerId', label: 'customerId', width: '350px' },
        { prop: 'officeName', label: '客户名称', width: '220px' },
        { prop: 'officeId', label: '诊所ID', width: '120px' },
        { prop: 'saasCode', label: 'SaaS代码', width: '220px' },
        { prop: 'monthly', label: '是否月结', width: '120px' },
        { prop: 'settlementCycle', label: '对账周期', width: '120px' },
        { prop: 'currentArrearsAmount', label: '本期欠款', width: '120px' },
        { prop: 'overdueArrearsAmount', label: '逾期欠款', width: '120px' },
        { prop: 'unexpiredArrearsAmount', label: '未到期欠款', width: '120px' },
        { prop: 'unLaunchedArrearsAmount', label: '到期应核对欠款', width: '120px' },
        { prop: 'salesSupport', label: '销售支持', width: '220px' },
        { prop: 'control', label: '操作', width: '160px', fixed: 'right' }
      ],
      page: { cur: 1, total: 0, num: 10, sizes: [ 10, 20, 30, 40, 50 ] },
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
    sizeChange( v ) {
      this.page.num = v
      this.page.cur = 1
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
      let params = this.dataAdapter()
      this.$http( API.searchUsersArrears, params ).then( ( { data } ) => {
        let ret = data.data
        let lists = ( ret.list || [] ).map( v => ( { ...v, yxLimit: 0 } ) )
        // 修复个人账户类型
        this.lists = buildPersonTypeData( lists )
        this.page.total = ret.total
      }, rej => {
        this.$message( {
          message: rej.msg,
          type: 'warning'
        } )
      } )
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
