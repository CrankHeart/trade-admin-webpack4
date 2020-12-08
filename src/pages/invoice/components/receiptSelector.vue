<template>
  <div class="receipt-selector">
    <el-button size="small" :disabled="!isSelectable" @click="exportInvoice">导出发票Excel</el-button>

    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane label="当期可开票据" name="current" :disabled="!isSelectable"></el-tab-pane>
      <el-tab-pane label="往期可开票据" name="history" :disabled="!isSelectable"></el-tab-pane>
    </el-tabs>
    <lc-table
      :config="config"
      :data="listMap[activeName]"
      :has-page="false"
      selection
      @data-selection-change="selectionChange"
      :selectable="selectableFn"
      ref="mutationTable"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop==='receiptType'">{{formatReceiptTypes(row.receiptType)}}</template>
        <template
          v-else-if="con.prop==='receiptNo'"
        >{{!row.receiptType ? row.orderSn : row.receiptNo}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { receiptTypes } from '@/pages/server/const/serverConstant'
import LcTable from '@/components/table'
import API from '@/API'

interface Sn {
  receivableSn?: string,
  orderSn?: string,
  accountCheckSn?: string
}

@Component( {
  components: {
    LcTable
  }
} )
export default class ReceiptSelector extends Vue {
  @Prop()
  sn: Sn
  @Prop()
  type: number
  activeName = 'current'
  isSelectable = true
  get config () {
    let base = this.sn.orderSn ? [] : [ { prop: 'orderSn', label: '订单号' } ]
    let config = base.concat( [
      { prop: 'receiptNo', label: '单据编号' },
      { prop: 'receiptType', label: '单据类型', width: '100px' },
      { prop: 'receivableAmount', label: '开票金额', width: '100px' }
    ] )
    if ( this.activeName === 'history' ) {
      config.splice( 1, 0, { prop: 'invoiceBlueNum', label: '关联蓝票编号' } )
    }
    return config
  }
  listMap = {
    current: [],
    history: []
  }
  selectableFn () {
    return this.isSelectable
  }
  created () {
    this.getList()
  }
  formatReceiptTypes ( receiptType ) {
    let item = [ { id: 0, name: '订单' } ].concat( receiptTypes ).find( v => receiptType == v.id ) || {}
    return item.name || '--'
  }
  exportInvoice () {
    if ( !this.selectedReceipt.length ) {
      return this.$notify( {
        type: 'error',
        message: '请选择单据后导出'
      } )
    }
    // 应王振要求，在导出后发票与导出的内容无任何关系，可重新继续选择 2019.11.25
    // this.isSelectable = false
    this.$submit( API.exportFinancialReceivesInvoice, {
      invoiceType: Number( this.activeName !== 'current' ),
      receivableSns: this.selectedReceipt.map( v => v.receivableSn ).join( ';' )
    } )
  }
  tabClick ( { name } ) {
    this.activeName = name
    let mutationTable = this.$refs.mutationTable as any
    mutationTable.clearSelection()
    this.getList()
    this.$emit( 'change', {
      type: this.invoiceType,
      list: []
    } )
  }
  get invoiceType () {
    return Number( this.activeName !== 'current' )
  }
  selectedReceipt = []
  selectionChange ( v ) {
    this.selectedReceipt = v
    this.$emit( 'change', {
      type: this.invoiceType,
      list: v
    } )
  }
  getList () {
    if ( !this.listMap[ this.activeName ].length ) {
      let fn = this.activeName === 'current' ? this.getCurrent : this.getHistiry

      fn().then( ( { data } ) => {
        this.listMap[ this.activeName ] = data.data.list || []
      } )
    }
  }
  getHistiry () {
    let params = this.sn
    return this.$http( API.previousList, params )
  }
  getCurrent () {
    let { receivableSn, orderSn, accountCheckSn } = this.sn
    let params
    switch ( this.type ) {
      case 0:
        params = { receivableSn }
        break
      case 1:
        params = { orderSn }
        break
      case 2:
        params = { accountCheckSn }
        break
      default:
        params = { receivableSn, orderSn, accountCheckSn }
    }
    return this.$http( API.currentPeriodReceivables, params )
  }
}
</script>
<style lang="stylus" scoped>
.receipt-selector
  position relative
  & > .el-button
    position absolute
    right 0
    top 0
    z-index 99
</style>