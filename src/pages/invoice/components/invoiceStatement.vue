<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" @submit="searchOrder"></lc-condition>
    <lc-table
      :config="config"
      :data="lists"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="['orderSn','receiptType','receiptNo'].includes(con.prop)">
          <template v-for="item in row.pendingInvoiceDeliveryOrderList">
            <template v-if="con.prop==='orderSn'">
              <p
                :key="item.orderSn"
                class="scope-row"
                :style="{height:`${30*item.pendingInvoiceDeliveryOrderList.length}px`}"
              >{{item.orderSn}}</p>
            </template>
            <template v-else>
              <template v-for="ite in item.pendingInvoiceDeliveryOrderList">
                <p
                  :key="ite.accountCheckSn"
                  class="scope-row"
                >{{con.prop=='receiptType' && formatReceiptTypes(ite.receiptType) || ite.receiptNo}}</p>
              </template>
            </template>
          </template>
        </template>
        <template v-else-if="con.prop==='control' ">
          <el-button
            @click="invoiceCtr(row)"
            v-if="$permissionValidateWithEnv(1200,1196)"
            type="primary"
            size="small"
            :disabled="!!row.yxLimit"
          >{{row.yxLimit?'开票中':'开票'}}</el-button>
          <el-button
            @click="rejectOper(row)"
            v-if="$permissionValidateWithEnv(1201,1197)"
            type="warning"
            size="small"
          >驳回</el-button>
        </template>
        <template v-else-if="con.prop==='applyDate'">{{formatDate(row[con.prop])}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>

    <invoiceDialogCreate
      :type="2"
      @submit="submitCallback"
      v-if="invoiceCreateVisible"
      v-model="currentInvoice"
    ></invoiceDialogCreate>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import InvoiceDialogCreate from './invoiceDialogCreate'

import { receiptTypes } from '@/pages/server/const/serverConstant'
import API from '@/API'
import { matchArrItem } from '@/utils/'
export default {
  name: 'invoice-statement',
  components: {
    lcCondition,
    lcTable,
    InvoiceDialogCreate
  },
  inject: [ 'formatMyDate' ],
  props: {
  },
  data() {
    return {
      receiptTypes: receiptTypes,
      condition: [
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: [], key: 'applyTime', label: '申请时间', type: 'daterange' },
        { value: '', key: 'accountCheckSn', label: '对账单号', type: 'text' },
        { value: '', key: 'salesSupport', label: '销售支持', type: 'text' }
      ],
      config: [
        { prop: 'customerName', label: '客户名称', width: '220px' },
        { prop: 'accountCheckSn', label: '对账单号', width: '220px' },
        { prop: 'orderSn', label: '订单编号', width: '220px' },
        { prop: 'receiptType', label: '单据类型', width: '180px' },
        { prop: 'receiptNo', label: '单据编号', width: '220px' },
        { prop: 'applyDate', label: '申请时间', width: '180px' },
        { prop: 'salesSupport', label: '销售支持', width: '220px' },
        { prop: 'control', label: '操作', width: '250px', fixed: 'right' }
      ],
      page: { cur: 1, total: 0, num: 10 },
      lists: [],
      currentInvoice: null
    }
  },
  computed: {
    invoiceCreateVisible() {
      return !!this.currentInvoice
    }
  },
  methods: {
    invoiceCtr( item ) {
      this.currentInvoice = item
    },
    rejectOper( item ) {
      this.$confirm( '确认驳回?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal: false
      } ).then( () => {
        this.$http( API.rejectInvoiceApply, {
          applyType: 2,
          applySn: item.accountCheckSn
        } ).then( ( { data } ) => {
          this.$message( {
            message: data.msg,
            type: 'success'
          } )
          this.loadData()
        }, rej => {
          this.$message( {
            message: rej.data.msg,
            type: 'warning'
          } )
        } )
      } )
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
    formatReceiptTypes( id ) {
      return matchArrItem( id, receiptTypes, 'id' ).name
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
    loadData() {
      // this.$permissionValidateWithNotifyEnv(1194,1190)
      let params = this.dataAdapter()
      this.$http( API.getPendingInvoiceAcctStatmentList, params ).then( ( { data } ) => {
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
    searchOrder() {
      this.page.cur = 1
      this.loadData()
    },
    submitCallback( item ) {
      item.yxLimit = 1
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
  box-sizing border-box
  + .scope-row
    box-shadow 1px -1px 0 rgba(0, 0, 0, 0.1)
</style>
