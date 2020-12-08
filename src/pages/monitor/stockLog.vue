<template>
  <div class="invoice-log">
    <lc-title text="库存监控"></lc-title>
    <lc-condition :condition="condition" @submit="searchOper">></lc-condition>
    <lc-table :config="config" :data="invoiceList" :page="page" @cur-change="curChange">
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'stockType'">{{convertType( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'stockStatus'">{{convertStatus( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'changeReason'">{{convertChangeReason( row[ con.prop ] )}}</template>

        <template v-else-if="['createTime'].indexOf(con.prop) > -1">{{formatDate(row[ con.prop ])}}</template>
        <template v-else-if="con.prop === 'control'"></template>
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
import { stockTypes, stockStatus, changeReasons } from './const/index'

@Component( {
  name: 'stock-log',
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
    { value: '', key: 'skuCode', label: 'SKU编号', type: 'text' },
    { value: '', key: 'stockType', label: '库存类型', type: 'select', options: stockTypes },
    { value: '', key: 'stockStatus', label: '库存状态', type: 'select', options: stockStatus },
    { value: '', key: 'changeReason', label: '变动原因', type: 'select', options: changeReasons },
    { value: void 0, key: 'createTime', label: '变动时间', type: 'daterange' }
  ]
  config: any[] = [
    { prop: 'skuCode', label: 'SKU编号', width: '150px' },
    { prop: 'stockType', label: '操作类型', width: '120px' },
    { prop: 'stockStatus', label: '操作状态', width: '120px' },
    { prop: 'changeReason', label: '变更原因', width: '120px' },
    { prop: 'changeNum', label: '变更数量', width: '120px' },
    { prop: 'balanceNum', label: '结存数量', width: '120px' },
    { prop: 'relatedBillNo', label: '关联单号', width: '220px' },
    { prop: 'createTime', label: '操作时间' }
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
      num,
      isNeedSkuId: false
    }
    let isNeedSkuId = false
    this.condition.forEach( item => {
      let { value, key, type } = item
      if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          param[ 'createStartTime' ] = this.formatMyDate( start )
          param[ 'createEndTime' ] = this.formatMyDate( end, void 0, true )
          isNeedSkuId = true
        }
      } else if ( ( value != "" && value != undefined ) || value === 0 ) {
        param[ key ] = value
        isNeedSkuId = true
      }
    } )
    param.isNeedSkuId = isNeedSkuId
    return param
  }

  searchOper () {
    this.page.cur = 1
    this.search()
  }

  search () {
    // skuid必须填写,如果不填写报错
    let param = this.formatParam()
    if ( param[ 'isNeedSkuId' ] && ( !param[ 'skuCode' ] || param[ 'skuCode' ] == '' ) ) {
      return this.$notify( {
        type: 'error',
        message: 'sku编码必须填写'
      } )
    }
    this.$http( API.stockChangeLog, param ).then( ( { data } ) => {
      let temp = data.data
      this.invoiceList = temp.list
      this.page.total = temp.total
    } ).catch( ( { data } ) => {
      this.invoiceList = []
      this.page.total = 0
      return this.$notify( {
        type: 'error',
        message: data.msg
      } )
    } )
  }

  convertType ( value ): string {
    return matchArrItem( value, stockTypes, 'id' ).name
  }

  convertStatus ( value ): string {
    return matchArrItem( value, stockStatus, 'id' ).name
  }

  convertChangeReason ( value ): string {
    return matchArrItem( value, changeReasons, 'id' ).name
  }

  formatDate ( o ) {
    let time = new Date( o ).getTime()
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
