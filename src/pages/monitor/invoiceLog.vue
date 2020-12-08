<template>
  <div class="invoice-log">
    <lc-title text="发票监控"></lc-title>
    <lc-condition :condition="condition" @submit="search">></lc-condition>
    <lc-table
      :config="config"
      :data="invoiceList"
      :page="page"
      @cur-change="curChange"
      controller-name="invoiceLog"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'operateType'">{{convertType( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'operateStatus'">{{convertStatus( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'requestResult'||con.prop === 'requestParam'">
          <el-input type="textarea" :rows="5" v-model.trim="row[con.prop]" :disabled="true"></el-input>
        </template>

        <template
          v-else-if="['operateTime','retryTime'].indexOf(con.prop) > -1"
        >{{formatDate( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'control'">
          <el-button
            v-if="+row.operateStatus === 0 && $permissionValidate(1117)"
            type="primary"
            size="small"
            @click.stop="retryInvoice(row['id'])"
          >重试</el-button>
        </template>
        <template v-else>{{row[ con.prop ]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import LcTitle from '@/components/title.vue'
import LcCondition from '@/components/condition.vue'
import lcTable from '@/components/table/index'
import { matchArrItem } from '@/utils'
import API from '../../API'
import { invoiceOperateTypes, invoiceOperateStatus } from './const/index'

@Component( {
  name: 'invoice-log',
  components: {
    LcTitle,
    lcTable,
    LcCondition
  }
} )
export default class invliceLog extends Vue {
  @Inject() formatMyDate

  invoiceList: any[] = []

  condition: any[] = [
    { value: '', key: 'orderSn', label: '订单号', type: 'text' },
    { value: '', key: 'operateType', label: '操作类型', type: 'select', options: invoiceOperateTypes },
    { value: '', key: 'operateStatus', label: '操作状态', type: 'select', options: invoiceOperateStatus },
    { value: void 0, key: 'operateTime', label: '操作时间', type: 'daterange' }
  ]
  config: any[] = [
    { prop: 'orderSn', label: '订单号', width: '150px' },
    { prop: 'operateType', label: '操作类型', width: '120px' },
    { prop: 'operateStatus', label: '操作状态', width: '120px' },
    { prop: 'operateTime', label: '操作时间', width: '200px' },
    { prop: 'retryTime', label: '重试时间', width: '200px' },
    { prop: 'requestParam', label: '请求报文', width: '250px' },
    { prop: 'requestResult', label: '请求结果', width: '250px' },
    { prop: 'control', label: '操作', width: '120px', fixed: 'right' }
  ]

  page: any = {
    total: 0,
    cur: 1,
    num: 10
  }

  activated () {
    this.search()
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  formatParam () {
    let { num, cur } = this.page
    let param = {
      start: ( cur - 1 ) * num,
      num
    }
    this.condition.forEach( item => {
      let { value, key, type } = item

      if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          param[ key + 'Start' ] = this.formatMyDate( start )
          param[ key + 'End' ] = this.formatMyDate( end, void 0, true )
        }
      } else if ( !!value ) {
        param[ key ] = value
      }
    } )
    return param
  }

  search () {
    let param = this.formatParam()
    this.$http( API.invoiceMonitorList, param ).then( ( { data } ) => {
      let temp: any = data.data
      this.invoiceList = temp.list
      this.page.total = temp.total
    }, () => {
      this.invoiceList = []
      this.page.total = 0
    } )
  }
  retryInvoice ( id = '' ) {
    this.$http( API.invoiceMonitorRetry, { id } ).then( ( { data } ) => {
      let { msg = '' } = data
      this.$notify( {
        type: 'success',
        message: msg
      } )
    } ).catch( err => {
      this.$notify( {
        type: 'success',
        message: err.msg || '重试失败'
      } )
    } )
  }

  convertType ( value ): string {
    return matchArrItem( value, invoiceOperateTypes, 'id' ).name
  }

  convertStatus ( value ): string {
    return matchArrItem( value, invoiceOperateStatus, 'id' ).name
  }

  formatDate ( o ) {
    let time = o && o.time
    if ( o ) {
      return this.formatMyDate( time )
    }
  }
}

</script>

<style lang="stylus">
.invoice-log
  .el-table .cell
    max-height 300px
    overflow auto
    padding 20px
</style>
