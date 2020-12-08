<template>
  <div class="user-log-table">
    <lc-condition :labelWidth="'110px'" :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop =='operateTime'">{{formatDate(+scope.row.operateTime)}}</template>
        <template
          v-else-if="scope.con.prop =='operateType'"
        >{{formatOperateType(+scope.row.operateType)}}</template>
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
import { operateTypes } from './const'
import API from './../../API'
import { matchArrItem } from './../../utils'
@Component( {
  name: 'user-log-query',
  components: {
    lcCondition,
    lcTable
  }
} )
export default class UserLogQuery extends Vue {
  // sku指代SkuId spu指代spuId orderId指代orderSn
  config = [
    { prop: 'userId', label: 'userId', width: '130px' },
    { prop: 'userName', label: 'userName', width: '130px' },
    { prop: 'spu', label: 'spuId', width: '130px' },
    { prop: 'sku', label: 'skuId', width: '130px' },
    { prop: 'orderId', label: '订单号', width: '200px' },
    { prop: 'promotionId', label: '促销Id', width: '100px' },
    { prop: 'moduleId', label: '模块Id', width: '100px' },
    { prop: 'moduleName', label: '模块名' },
    { prop: 'operateTime', label: '修改时间', width: '180px' },
    { prop: 'operateType', label: '修改类型', width: '100px' },
    { prop: 'updatedValue', label: '更新值', width: '130px' }
  ]
  myData: any[] = []
  condition = [
    { value: void 0, key: 'spu', label: 'spuId', type: 'text' },
    { value: void 0, key: 'sku', label: 'skuId', type: 'text' },
    { value: void 0, key: 'orderId', label: '订单号', type: 'text' },
    { value: void 0, key: 'moduleId', label: '模块Id', type: 'text' },
    { value: void 0, key: 'promotionId', label: '促销Id', type: 'text' },
    { value: void 0, key: 'operate', label: '开始时间', type: 'datetimerange' }
  ]
  page = {
    cur: 0,
    num: 10,
    total: 0
  }
  formatOperateTypes ( id ) {
    return matchArrItem( id, operateTypes, 'id' ).name
  }

  curChange ( cur ) {
    this.search( cur )
  }

  @Inject() formatMyDate
  formatDate ( o ) {
    if ( o ) {
      return this.formatMyDate( o )
    }
  }

  formatOperateType ( id ) {
    return matchArrItem( id, operateTypes, 'id' ).name
  }

  search ( cur = 1 ) {
    this.page.cur = cur
    let option = this.computedAjaxOption()
    // this.$http( API.findUserLogByCondition, option ).then( ( { data } ) => {
    //   this.myData = data.data.records
    //   this.page.total = data.data.total
    // } )
  }
  created () {
    this.search()
  }
  computedAjaxOption () {
    let o: any = {}
    this.condition.forEach( v => {
      let { key, value, type } = v
      if ( type === 'datetimerange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          o[ key + 'StartTime' ] = this.formatMyDate( start )
          o[ key + 'EndTime' ] = this.formatMyDate( end, void 0, true )
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
