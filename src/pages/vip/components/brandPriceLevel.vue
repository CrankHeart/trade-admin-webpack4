<template>
  <el-dialog class="brand-member-level" title="会员品牌等级" v-model="myValue">
    <div class="v-flex">
      <!-- <el-input v-model="searchValue" placeholder="请输入品牌名" icon="search" :on-icon-click="fastSearch" @keydown.enter.native="fastSearch" style="margin-bottom:10px;" /> -->
      <fast-search
        @fast-search="fastSearch"
        :basic-list="myData"
        prop-name="brandName"
        key="brand"
        :visible="true"
      ></fast-search>
      <div>
        <el-table :data="filterData" border stripe fit v-loading="loading" :height="442">
          <el-table-column prop="brandName" label="品牌名称"></el-table-column>
          <el-table-column prop="priceLevel" label="会员品牌等级">
            <template slot-scope="scope">
              <template v-if="isEdit">
                <el-select
                  v-model="scope.row.priceLevel"
                  size="small"
                  @change="updateBrandPriceLevel(scope.row)"
                  :key="scope.row.id"
                >
                  <el-option
                    v-for="priceLevel in priceLevels"
                    :key="priceLevel.id"
                    :label="priceLevel.name"
                    :value="priceLevel.id"
                  ></el-option>
                </el-select>
              </template>
              <template v-else>{{convertData(scope.row.priceLevel,'priceLevel')}}</template>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          small
          layout="total, prev, pager, next"
          :current-page="page.cur"
          :total="page.total"
          class="pull-right"
          style="margin-bottom:10px;"
          @current-change="curChange"
        ></el-pagination>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Action, Getter } from "vuex-class"
import { priceLevels } from '../const'
import API from '../../../API'
import portraitMixins from './portraitMixins'
import fastSearch from '../../../components/fastSearch.vue'

@Component( {
  name: 'BrandPriceLevel',
  mixins: [ portraitMixins ],
  components: {
    fastSearch
  }
} )
export default class BrandPriceLevel extends Vue {
  @Prop()
  isEdit: boolean
  loading: boolean = false
  @Getter( 'brand/allBrands' ) allBrands
  @Action( 'brand/getAllBrands' ) getAllBrands
  @Prop( { default: () => { } } )
  UserInfo: any
  @Prop()
  value: boolean
  priceLevels = priceLevels
  get myValue () {
    return this.value
  }
  set myValue ( v ) {
    this.$emit( 'input', v )
  }
  searchValue: string = ''
  sourceData: any[] = []
  get myData () {
    let o = {}
    this.sourceData.reduce( ( prev, next ) => {
      prev[ next.brandId ] = next
      return prev
    }, o )
    let brandKeys = Object.keys( this.allBrands )
    return brandKeys.map( key => {
      let brand = this.allBrands[ key ]
      let priceLevelBrand = o[ key ] || {}
      return Object.assign( {}, { brandName: brand.name, brandId: brand.id, priceLevel: 0 }, priceLevelBrand )
    } )
  }
  updateBrandPriceLevel ( item ) {
    this.$http( API.updateBrandPriceLevel, {
      ...item,
      // ...this.$route.query
    } ).then( () => {
      this.$notify( {
        type: 'success',
        message: '会员品牌等级更新成功!'
      } )
      this.$emit( 'change-level', item.priceLevel )
    }, () => {
      this.$notify( {
        type: 'error',
        message: '会员品牌等级更新失败,请刷新后重新尝试!'
      } )
    } )
  }
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  curChange ( cur ) {
    this.page.cur = cur
  }
  selectedData: any[] = []
  get result () {
    return this.selectedData.length ? this.selectedData : this.myData
  }
  get filterData () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    return this.result.slice( start, start + num )
  }
  created () {
    this.loading = true
    Promise.all( [ this.getAllBrands( true ), this.getBrandPriceLevel() ] ).then( ( [ brandList, { data } ] ) => {
      this.sourceData = data.data || []
      this.loading = false
      this.page.total = brandList.length
    }, () => {
      this.loading = false
    } )
  }
  destroyed () {
    this.sourceData = []
  }
  getBrandPriceLevel () {
    return this.$http( API.getBrandPriceLevel, this.UserInfo )
  }
  fastSearch ( v ) {
    this.selectedData = v
    this.page.total = this.result.length
  }
}
</script>
<style lang="stylus" scoped>
.brand-member-level
  .el-dialog
    width 400px
.fast-search
  width 100%
  margin-bottom 10px
</style>

