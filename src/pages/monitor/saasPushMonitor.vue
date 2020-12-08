<template>
  <div class="sass-push-monitor-table">
    <lc-condition :labelWidth="'110px'" :condition="condition" @submit="search"></lc-condition>
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
        <template v-else-if="scope.con.prop == 'requestParam' || scope.con.prop =='requestResult'">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :value="scope.row[scope.con.prop]"
            readonly
          ></el-input>
        </template>
        <template
          v-else-if="scope.con.prop =='sendTime'||scope.con.prop =='resendTime'"
        >{{formatDate(scope.row[scope.con.prop])}}</template>
        <template v-else-if="scope.con.prop =='control'">
          <el-button
            v-if="scope.row.sendStatus==0"
            type="primary"
            size="small"
            @click="rePush(scope.row)"
          >重新推送</el-button>
          <el-button
            v-if="scope.row.sendStatus===0 || scope.row.sendStatus===1"
            class="handle-btn"
            type="warning"
            size="small"
            @click="handledOrder(scope.row)"
          >设为已处理</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import lcCondition from './../../components/condition.vue'
import lcTable from './../../components/table/index'
import { saasMonitorType, saasMonitorStatus } from './const'
import API from './../../API'
import { matchArrItem } from './../../utils'
@Component( {
  name: 'saas-push-monitor',
  components: {
    lcCondition,
    lcTable
  }
} )
export default class SaasPushMonitor extends Vue {
  config = [
    { prop: 'orderSn', label: '单据号', width: '150px' },
    { prop: 'orderType', label: '单据类型', width: '100px' },
    { prop: 'sendStatus', label: '推送状态', width: '100px' },
    { prop: 'sendTime', label: '推送时间', width: '180px' },
    { prop: 'resendTime', label: '重新推送时间', width: '180px' },
    { prop: 'requestParam', label: '请求参数', width: '' },
    { prop: 'requestResult', label: '返回结果', width: '' },
    { prop: 'control', label: '操作', width: '130px' }
  ]
  myData: any[] = []
  condition = [
    { value: void 0, key: 'orderSn', label: '单据号', type: 'text' },
    { value: void 0, key: 'orderType', label: '单据类型', type: 'select', options: saasMonitorType },
    { value: void 0, key: 'sendStatus', label: '推送状态', type: 'select', options: saasMonitorStatus },
    { value: void 0, key: 'sendTime', label: '推送时间', type: 'daterange' }
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
    return matchArrItem( value, saasMonitorType, 'id' ).name
  }
  convertStatus ( value ): string {
    return matchArrItem( value, saasMonitorStatus, 'id' ).name
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
    this.$http( API.getSassOrderMonitors, option ).then( ( { data } ) => {
      this.myData = data.data.list
      this.page.total = data.data.total
    } )
  }
  created () {
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
  rePush ( v ) {
    let { id } = v
    this.$http( API.rePushOrder, { id } ).then( res => {
      this.$notify( {
        message: '推送成功',
        type: 'success'
      } )
      v.requestResult = '{msg=领健对账单信息同步成功, code=A0000, StatusCode=200}'
      v.resendTime = {
        time: new Date().getTime()
      }
      v.sendStatus = 1
    }, rej => {
      this.$notify( {
        message: '推送失败,请重试',
        type: 'warning'
      } )
    } )
  }
  handledOrder ( v ) {
    let { id } = v
    this.$http( API.orderMonitorHandled, { id } ).then( res => {
      this.$notify( {
        message: '设为已处理成功',
        type: 'success'
      } )
      v.sendStatus = 2
    }, rej => {
      this.$notify( {
        message: '设为已处理失败,请重试',
        type: 'warning'
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-textarea
  margin 10px 0
.handle-btn
  margin-top 10px
  margin-left 0
</style>