<template>
  <div class="product-turnover">
    <el-date-picker v-model="date" type="month" placeholder="选择月" style="margin-bottom:20px"></el-date-picker>

    <product-turnover-time
      :year="year"
      :month="month"
      :show-type="showType"
      :turn-type="turnType"
      @showTypeChange="showTypeChange"
      @turnTypeChange="turnTypeChange"
    ></product-turnover-time>
    <product-turnover-state :year="year" :month="month" :show-type="showType" :turn-type="turnType"></product-turnover-state>
    <template v-if="$permissionValidate(662)">
      <div class="center">
        <el-button type="primary" @click="exportData">生成数据</el-button>
      </div>
      <lc-table
        :data="splitTableData"
        @data-sort-change="sortChange"
        :sort="sort"
        :config="config"
        @cur-change="curChange"
        :page="page"
        :loading="loading"
      >
        <template slot-scope="scope">
          <template v-if="scope.con.prop=='goodLabel'">{{scope.row[scope.con.prop] ? '订购商品':'常备商品'}}</template>
          <template
            v-else-if="scope.con.prop=='stockMoney'"
          >{{scope.row[scope.con.prop].toFixed(2)}}</template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import ProductTurnoverTime from './productTurnoverTime.vue'
import ProductTurnoverState from './productTurnoverState.vue'
import lcTable from '../../../components/table/'

import API from '../../../API'

let dateNow = new Date()

@Component( {
  name: 'product-turnover',
  components: {
    ProductTurnoverTime,
    ProductTurnoverState,
    lcTable
  }
} )
export default class ProductTurnover extends Vue {
  // @Prop()
  // begindate: string

  date: Date = new Date()
  get year () {
    return this.date.getFullYear()
  }
  get month () {
    return this.date.getMonth() + 1
  }

  turnType: number = null
  showType: number = 0

  showTypeChange ( v ) {
    this.showType = v
    this.turnType = null
  }
  turnTypeChange ( v ) {
    this.turnType = v
  }
  tableData: any[] = []
  get splitTableData () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    return this.tableData.slice( start, start + num )
  }
  page = {
    total: 0,
    cur: 1,
    num: 50
  }
  curChange ( v ) {
    this.page.cur = v
  }
  config: any[] = [
    { prop: 'name', label: '商品名', width: '210px' },
    { prop: 'brandName', label: '品牌名', width: '210px' },
    { prop: 'saleNum', label: '销售量', width: '80px' },
    // { prop: 'settlePrice', label: '成本价', width: '80px' },
    { prop: 'specification', label: '规格', width: '210px' },
    { prop: 'expireDays', label: '临期天数', width: '150px', sortable: true, fixed: 'right' },
    { prop: 'stockNum', label: '库存数量', width: '150px', sortable: true, fixed: 'right' },
    { prop: 'stockMoney', label: '库存金额', width: '210px', sortable: true, fixed: 'right' },
    { prop: 'turnoverDays', label: '周转天数', width: '150px', sortable: true, fixed: 'right' },
    { prop: 'lcSkuCode', label: 'sku领健编码', width: '170px' },
    { prop: 'category1stName', label: '一级类目', width: '210px' },
    { prop: 'category2stName', label: '二级类目', width: '210px' },
    { prop: 'category3stName', label: '三级类目', width: '210px' },
    { prop: 'goodLabel', label: '商品标签', width: '100px' },
    { prop: 'lastTradeTime', label: '上次交易时间', width: '210px' }
  ]
  orderBy: string = 'ascending'
  orderProp: string = 'saleNum'
  get orderSort () {
    let value = +( this.orderBy !== 'ascending' )
    let prop
    switch ( this.orderProp ) {
      case 'expireDays':
        prop = 'expireOrderType'
        break
      case 'stockNum':
        prop = 'stockOrderType'
        break
      case 'stockMoney':
        prop = 'moneyOrderType'
        break
      case 'turnoverDays':
        prop = 'turnOrderType'
        break
      default:
        break
    }
    return {
      [ prop ]: value
    }
  }
  @Watch( 'orderSort' )
  orderSortWatcher () {
    this.exportData()
  }
  get sort () {
    return {
      order: this.orderBy,
      prop: this.orderProp
    }
  }
  loading: boolean = false
  sortChange ( { column, prop, order } ) {
    if ( !order && !prop && !column ) return
    this.loading = true
    this.orderBy = order
    this.orderProp = prop
  }
  exportData () {
    // this.tableData = []
    this.page.cur = 1
    // let start = true
    this.$http( API.getSkuSummarysDetail, {
      ...this.orderSort,
      turnType: this.turnType,
      year: this.year,
      month: this.month
    } ).then( ( { data } ) => {
      let myData = data.data
      this.tableData = myData.map( v => ( {
        ...v,
        stockMoney: +( v.stockNum * v.settlePrice ).toFixed( 2 )
      } ) )
      this.page.total = myData.length
      // let timer = setInterval( () => {
      //   if ( !myData.length ) {
      //     clearInterval( timer )
      //     start = false
      //   }
      //   this.tableData.push( ...myData.splice( 0, 10 ) )
      // }, 60 )
      this.loading = false
    }, () => {
      this.loading = false
    } )
  }
}
</script>

