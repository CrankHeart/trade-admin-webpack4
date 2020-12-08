<template>
  <div class="erp-monitor-table">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop =='orderType' || scope.con.prop =='sendStatus'"
        >{{convertData(scope.row,scope.con.prop)}}</template>
        <template v-else-if="scope.con.prop =='requestMessage' || scope.con.prop =='requestResult'">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :value="scope.row[scope.con.prop]"
            readonly
          ></el-input>
        </template>
        <template v-else-if="scope.con.prop =='sendTime'">{{formatDate(scope.row.sendTime)}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table/index'
import { erpMonitorType, erpMonitorStatus } from '../const'
import API from '../../../API'
import { matchArrItem } from '../../../utils'
@Component( {
  name: 'erp_monitor',
  components: {
    lcCondition,
    lcTable
  }
} )
export default class ErpMonitor extends Vue {
  @Prop() value
  initCondition () {
    this.condition.forEach( v => {
      let { key } = v
      let value = this.value[ key ]
      if ( value !== '' ) {
        v.value = value
      }
    } )
    console.log( this.condition )
  }
  config = [
    { prop: 'orderSn', label: '单据号', width: '150px' },
    { prop: 'orderType', label: '单据类型', width: '100px' },
    { prop: 'sendStatus', label: '推送状态', width: '100px' },
    { prop: 'sendTime', label: '推送时间', width: '180px' },
    { prop: 'requestMessage', label: '请求参数', width: '' },
    { prop: 'requestResult', label: '返回结果', width: '' }
    // ,{ prop: 'control', label: '操作', width: '' }
  ]
  myData: any[] = []
  condition = [
    { value: void 0, key: 'orderType', label: '单据类型', type: 'select', options: erpMonitorType },
    { value: void 0, key: 'orderSn', label: '单据号', type: 'text' },
    { value: void 0, key: 'sendStatus', label: '推送状态', type: 'select', options: erpMonitorStatus },
    { value: void 0, key: 'sendTime', label: '推送时间', type: 'daterange' },
  ]
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  convertData ( item, type ) {
    switch ( type ) {
      case 'orderType':
        return this.convertType( item[ type ] )
      case 'sendStatus':
        return this.convertStatus( item[ type ] )
      default:
        return ''
    }
  }
  convertType ( value ): string {
    return matchArrItem( value, erpMonitorType, 'id' ).name
  }
  convertStatus ( value ): string {
    return matchArrItem( value, erpMonitorStatus, 'id' ).name
  }
  curChange ( cur ) {
    this.search( cur )
  }
  @Inject() formatMyDate
  formatDate ( o ) {
    let time = o && o.time
    if ( o ) {
      return this.formatMyDate( time )
    }
  }
  search ( cur = 1 ) {
    this.page.cur = cur
    let option = this.computedAjaxOption()
    this.$emit( 'input', { orderType: option.orderType, sendStatus: option.sendStatus } )
    this.$http( API.getErpMonitors, option ).then( ( { data } ) => {
      this.myData = data.list
      this.page.total = data.total
    } )
  }
  created () {
    this.initCondition()
    this.search()
  }
  computedAjaxOption () {
    let o: any = {}
    this.condition.forEach( v => {
      let { key, value, type } = v
      if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          o[ key + 'Start' ] = this.formatMyDate( start )
          o[ key + 'End' ] = this.formatMyDate( end, void 0, true )
        }
      } else {
        o[ key ] = value === '' ? void 0 : value
      }
    } )
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    return o
  }
}
</script>
<style lang="stylus" scoped>
.el-textarea
  margin 10px 0
</style>
