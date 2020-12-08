<template>
  <div class="product-management">
    <div class="goods-search">
      <div class='search-item'>
        <label>SKU 编码</label>
        <el-input class="search-input" v-model="lcCode" clearable></el-input>
      </div>
      <div class="search-item">
        <label>品牌</label>
        <el-select v-model="brandId" filterable>
          <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
      <!-- <lc-condition :condition="condition" @submit="search" label-width="100px"></lc-condition> -->
      <div class="add-new-btn">
        <el-button type="primary" v-if="$permissionValidate(643)"  @click="addNewProduct">新增代理商品</el-button>
      </div>
    </div>
    <supplier-goods-table ref="supplier-goods-table" :brand-id="brandId" :lc-code="lcCode"></supplier-goods-table>

    <el-dialog :visible.sync="goodsListVisible" size="large">
      <supplier-goods-list @success="refresh" :next-step="false" :supplier-id="supplierId"></supplier-goods-list>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import lcTable from '../../../components/table/index'
import { supplierResConfig } from '../const/index'
import API from '../../../API'
// import lcCondition from '../../../components/condition.vue'
import supplierGoodsList from './supplierGoodsList.vue'
import supplierGoodsTable from './supplierGoodsTable.vue'

@Component( {
  name: 'product-management',
  components: {
    lcTable,
    // lcCondition,
    supplierGoodsList,
    supplierGoodsTable
  }
} )
export default class productManagement extends Vue {
  @Action( 'brand/getAllBrands' ) getAllBrands
  @State( state => state.brand.brandList ) brandList
  @State( state => state.supplier.supplierDetail ) supplierDetail

  @Prop( {
    type: Number
  } )
  supplierId

  supplierResConfig = supplierResConfig
  lcCode: string = ''
  brandId: number = null
  goodsListVisible: boolean = false
  page = {
    cur: 1,
    num: 10,
    total: 0
  }


  get id () {
    return this.$route.params.id
  }
  activated () {
    // this.search()
    this.getAllBrands()
  }

  search () {
    // this.page.cur = 1
    let supplierTable: any = this.$refs[ 'supplier-goods-table' ]
    supplierTable.getSupplierSkuList()
  }

  refresh () {
    this.goodsListVisible = false
    this.search()
  }

  reset () {
    this.lcCode = ''
    this.brandId = null
  }
  addNewProduct () {
    this.goodsListVisible = true
  }

}
</script>

<style lang="stylus" scoped>
.ctrl-btn
  a
    cursor pointer
    margin-right 10px
  span
    color #67c23a
    margin-right 10px
.goods-search
  overflow hidden
  margin-bottom 20px
  display flex
.search-item
  margin-right 30px
.search-input
  width 300px
.add-new-btn
  flex 1
  text-align right
.num-error
  color #ff4949
</style>

<style lang="stylus">
.product-management
  .el-dialog--large
    width 75%
//   .el-dialog__wrapper
//     left 170px
//   .el-dialog
//     transform translateX(-40%)
</style>
