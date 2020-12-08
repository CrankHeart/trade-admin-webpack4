<template>
  <div class="invoice-with-goods">
    <lc-condition :condition="condition" @submit="searchOrder"></lc-condition>
    <lc-table
      :config="config"
      :data="list"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{con,row}">
        <template v-if="con.prop==='receiptType' ">{{formatReceiptTypes(row['receiptType'])}}</template>
        <template v-else-if="con.prop==='control' ">
          <el-button
            @click="invoiceCtr(row)"
            v-if="$permissionValidateWithEnv(1196,1192)"
            type="primary"
            size="small"
            :disabled="!!row.yxLimit"
          >{{row.yxLimit?'开票中':'开票'}}</el-button>
          <el-button
            @click="rejectOper(row)"
            v-if="$permissionValidateWithEnv(1197,1193)"
            type="warning"
            size="small"
          >驳回</el-button>
        </template>
        <template v-else-if="con.prop==='applyDate'">{{formatDate(row[con.prop])}}</template>
        <template v-else>
          <template>{{row[con.prop]}}</template>
        </template>
      </template>
    </lc-table>
    <invoiceDialogCreate
      @submit="submitCallback"
      v-if="invoiceCreateVisible"
      v-model="currentInvoice"
      :type="0"
    ></invoiceDialogCreate>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'

import InvoiceDialogCreate from './invoiceDialogCreate'

import { receiptTypes } from '@/pages/server/const/serverConstant'
import { matchArrItem } from '@/utils/'
import API from '@/API'
export default {
  name: 'invoice-with-goods',
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
        { value: [], key: 'applyTime', label: '申请时间', type: 'daterange' },
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: '', key: 'orderSn', label: '订单号', type: 'text' },
        { value: '', key: 'deliverySn', label: '出库单号', type: 'text' },
        { value: '', key: 'salesSupport', label: '销售支持', type: 'text' }
      ],
      config: [
        { prop: 'customerName', label: '客户名称', width: '220px' },
        { prop: 'orderSn', label: '订单编号', width: '220px' },
        // { prop: 'deliverySn', label: '出库单号', width: '220px' },
        { prop: 'receiptType', label: '单据类型', width: '180px' },
        { prop: 'receiptNo', label: '单据编号', width: '220px' },
        { prop: 'applyDate', label: '申请时间', width: '180px' },
        { prop: 'salesSupport', label: '销售支持', width: '220px' },
        { prop: 'control', label: '操作', width: '250px', fixed: 'right' }
      ],
      page: { cur: 1, total: 0, num: 10 },
      list: [],
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
          applyType: 1,
          applySn: item.orderSn
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
    // formatReceiptTypes( id ) {
    //   return ( this.receiptTypes[ id ] && this.receiptTypes[ id ].name ) || ''
    // },
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
    formatReceiptTypes( id ) {
      return matchArrItem( id, receiptTypes, 'id' ).name
    },
    loadData() {
      let params = this.dataAdapter()
      this.$http( API.listPaperWithGoodInvoice, params ).then( ( { data } ) => {
        this.list = ( data.list || [] ).map( v => ( { ...v, yxLimit: 0 } ) )
        this.page.total = data.total
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
    rejectPendingInvoice( id ) {
      this.$http( API.rejectPendingInvoice, {
        id,
        broadcast: true
      } ).then( () => {
        this.list = this.list.filter( v => v.id !== id )
      } )
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
  height 30px
  line-height 30px
  box-sizing border-box
</style>
