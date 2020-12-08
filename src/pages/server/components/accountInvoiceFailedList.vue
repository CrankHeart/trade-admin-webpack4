<template>
  <div class="fail-invoice-list">
    <div class="title">
      <h3>开票失败订单</h3>
    </div>
    <lc-table :config="config" :data="list" :has-page="false">
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control'">
          <!-- <el-button v-if="$permissionValidate( 1122 )" :loading="scope.row.reverseBtnLoading" type="danger" size="mini" @click.stop="reverseEInvoice( scope.$index )">红冲</el-button>
          <el-button v-if="$permissionValidate( 1088 )" :loading="scope.row.remakeBtnLoading" type="primary" size="mini" @click.stop="remakeEInvoice( scope.$index )">重开发票</el-button>-->
        </template>
        <template v-else-if="scope.con.prop === 'index'">{{scope.$index + 1}}</template>
        <template v-else>{{ scope.row[ scope.con.prop ] }}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import lcTable from '../../../components/table/'
import API from '../../../API'

@Component( {
  name: 'fail-invoice-list',
  components: {
    lcTable
  }
} )
export default class PaperInvoiceList extends Vue {
  @Prop() list: any[]
  @Prop() accountCheckSn: string

  config: any[] = [
    { prop: 'index', label: '发票序号' },
    { prop: 'orderSn', label: '对应订单号' },
    { prop: 'control', label: '操作' },
  ]

  reverseEInvoice ( index ) {
    let row = this.list[ index ]
    Vue.set( row, 'remakeBtnLoading', true )
    Vue.set( row, 'reverseBtnLoading', true )
    this.controlInvoice( API.reverseEInvoice, index )
  }
  remakeEInvoice ( index ) {
    const message = `重新开票将有一定的时间延迟，请10s后重新刷新页面`

    this.$confirm( message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( res => {
      let row = this.list[ index ]
      Vue.set( row, 'remakeBtnLoading', true )
      this.controlInvoice( API.remakeEInvoice, index )
    } )
  }
  controlInvoice ( url, index ) {
    let row = this.list[ index ]
    return this.$http( url, {
      accountCheckSn: this.accountCheckSn,
      orderSn: row.orderSn
    } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: data.msg || '操作成功'
      } )
      this.list.splice( index, 1 )
    } ).catch( err => {
      Vue.set( row, 'remakeBtnLoading', false )
      Vue.set( row, 'reverseBtnLoading', false )
      this.$notify( {
        type: 'error',
        message: err.data.msg || '操作失败'
      } )
    } )


  }
}
</script>



