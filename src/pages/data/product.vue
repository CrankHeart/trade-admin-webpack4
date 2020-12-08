<template>
  <div id="data-product">
    <lc-title text="商品数据"></lc-title>
    <h5>在线商品概况</h5>
    <el-row :gutter="30" class="general">
      <el-col :span="4" v-for="item in general" :key="item.title">
        <el-card :body-style="{ padding: '10px',textAlign:'center' }">
          <h5>{{item.title}}</h5>
          <p>{{item.value}}</p>
        </el-card>
      </el-col>
    </el-row>
    <product-monthly :begindate="begindate"></product-monthly>
    <div class="product-tabs">
      <ul>
        <li v-for="(tab,index) in tabs" :key="tab" :class="{'is-active':curTabIndex == index}" @click="tabChange(index)">{{tab}}</li>
      </ul>
      <el-checkbox v-model="isCurYear" class="pull-right">只看当年</el-checkbox>
    </div>
    <component :is="componentName" :begindate="begindate"></component>
  </div>
</template>
<script lang="ts">
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import API from '../../API'

import asyncEcharts from '../../components/asyncEcharts'

import productBrandFlow from './components/productBrandFlow.vue'
import productBrandStateFlow from './components/productBrandStateFlow.vue'
import productHotSale from './components/productHotSale.vue'
import productFreezeSale from './components/productFreezeSale.vue'
import productMonthly from './components/productMonthly.vue'
import productTurnover from './components/productTurnover.vue'

@Component( {
  name: 'data-product',
  components: {
    lcTitle,
    productBrandFlow,
    productBrandStateFlow,
    productHotSale,
    productFreezeSale,
    productMonthly,
    productTurnover
  }
} )
export default class DataProduct extends asyncEcharts {
  isCurYear: boolean = false
  get begindate () {
    if ( this.isCurYear ) {
      let date: Date = new Date()
      return ( date.getFullYear() ) + '-01-01 00:00:00'
    }
    return ''
  }
  general = [
    { title: '品牌数', key: 'brandNum', value: '0' },
    { title: 'spu数量', key: 'spuNum', value: '0' },
    { title: 'sku数量', key: 'skuNum', value: '0' },
    { title: '库存sku数量', key: 'skuStockNum', value: '0' }
  ]
  // tabs = [ '品牌流向', '品牌属性流向', '热销榜', '滞销榜', '商品周转天数', '运营效率指标' ]
  tabs = [ '品牌流向', '品牌属性流向', '热销榜', '滞销榜', '商品周转天数' ]
  curTabIndex = 0
  tabChange ( index ) {
    this.curTabIndex = index
  }
  get componentName () {
    switch ( this.curTabIndex ) {
      case 0:
        return 'productBrandFlow'
      case 1:
        return 'productBrandStateFlow'
      case 2:
        return 'productHotSale'
      case 3:
        return 'productFreezeSale'
      case 4:
        return 'productTurnover'
      // case 5:
      //   return 'productMonthly'
      default:
        return ''
    }
  }
  activated () {
    this.getProductTotal()
  }
  getProductTotal () {
    this.$http( API.productTotal ).then( ( { data } ) => {
      let d = data.data || {}
      this.general.forEach( val => {
        val.value = d[ val.key ] || 0
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
#data-product 
  overflow hidden
  h5
    font-size 14px
    font-weight normal
    color #999
    margin-bottom 10px
  p
    font-size 26px
    color #00a8cb
  .general
    padding-bottom 20px
    border-bottom 1px solid #ccc
    margin-bottom 20px
.product-tabs
  border-bottom 1px solid #efefef
  margin-bottom 20px
  height 33px
  ul
    display flex
    line-height 32px
    background #f4f4f4
    height 32px
    position relative
    z-index 2
    width 80%
    float left
    li
      flex-grow 1
      text-align center
      border 1px solid #efefef
      border-bottom none
      height 32px
      cursor pointer
      &.is-active
        background #ffffff
</style>

