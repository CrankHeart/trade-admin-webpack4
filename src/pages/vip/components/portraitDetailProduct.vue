<template>
  <div class="user-portrait-product">
    <lc-condition :condition="condition" @submit="search">
      <template slot-scope="props">
        <template v-if="props.row.type=='selectList' ">
          <el-select v-model="props.row.value" filterable multiple placeholder="搜索范围">
            <el-option
              v-for="brand in brandList"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            ></el-option>
          </el-select>
        </template>
      </template>
    </lc-condition>
    <lc-table :config="config" :data="myData" :page="page" @cur-change="curChange">
      <template slot-scope="scope">{{scope.row[scope.con.prop]}}</template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table/'
import { State, Action } from "vuex-class"
import API from '../../../API'
@Component( {
  name: 'UserPortraitDetailProduct',
  components: {
    lcCondition,
    lcTable
  }
} )
export default class UserPortraitDetailProduct extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( "brand/getAllBrands" ) getAllBrands
  created () {
    this.getAllBrands()
    this.search()
  }
  activated () {
    this.getAllBrands()
    this.search()
  }

  config = [
    { prop: 'brandName', label: '品牌', width: '' },
    { prop: 'goodsName', label: '商品名称', width: '' },
    { prop: 'specification', label: '规格', width: '' },
    { prop: 'historyTradeNum', label: '历史购买数量', width: '' },
    { prop: 'label', label: '商品属性', width: '' },
    { prop: 'latestTradeTime', label: '最近购买时间', width: '' },
    { prop: 'lcSkuCode', label: 'sku编码', width: '' }
  ]
  myData: any[] = []
  condition = [
    { value: [], key: 'brands', label: '品牌', type: 'selectList', col: { lg: 12 } }
  ]
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  curChange ( cur ) {
    this.search( cur )
  }
  computedOption () {
    let o: any = {}
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    this.condition.forEach( v => {
      let { key, value } = v
      if ( value && value.length ) {
        o[ key ] = value
      }

    } )
    return o
  }
  search ( cur = 1 ) {
    this.page.cur = cur
    this.$http( API.getPurchasingHistoryVos, {
      ...this.$route.query,
      ...this.computedOption()
    } ).then( ( { data } ) => {
      let myData = data.data
      this.myData = myData.list
      this.page.total = myData.total
    } )
  }
}
</script>
<style lang="stylus">
.user-portrait-product
  .el-select
    width 100%
</style>
