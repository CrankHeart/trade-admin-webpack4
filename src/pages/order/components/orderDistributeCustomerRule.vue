<template>
  <div class="order-distribute-customer-rule">
    <supplier-goods-select @getSupplierSearchParams="getGoodsSearchRes">
      <el-col slot="other" :lg="8" :sm="12" :xs="24">
        <div class="select-item-wrap">
          <el-select v-model="currWmsType" placeholder="请选择">
            <el-option v-for="item in wmsTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
      </el-col>
    </supplier-goods-select>
    <lc-table
      :config="config"
      :data="supplierSelectGoodsList"
      @cur-change="curChange"
      :page="page"
      :key="supplierAddConfig.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='check'">
          <el-checkbox v-model="scope.row['isChecked']" :disabled="scope.row['isDisabled']"></el-checkbox>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <div class="sticky-bottom" v-if="supplierSelectGoodsList.length">
      <el-checkbox v-model="searchGoodsSelectAllStatus" @change="searchGoodsSelectAll">全选</el-checkbox>
      <el-button type="primary" @click="addGoodsToSupplier">添加选中</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { wmsTypes } from '../const/orderDistribute'
import API from '../../../API'
import lcTable from '../../../components/table'
import supplierGoodsList from '../../procurement/components/supplierGoodsList.vue'
import supplierGoodsSelect from '../../procurement/components/supplierGoodsSelect.vue'
import { supplierAddConfig } from "../../procurement/const/index"

@Component( {
  name: 'order-distribute-customer-rule',
  components: {
    lcTable,
    supplierGoodsSelect
  }
} )
export default class OrderDistributeCustomereRule extends supplierGoodsList {
  page = {
    cur: 1,
    total: 0,
    num: 10
  }
  config = supplierAddConfig.filter( v => [ 'lcSpuCode', 'sku', 'price' ].indexOf( v.prop ) === -1 )
  productList: any[] = []
  wmsTypes = wmsTypes
  currWmsType = wmsTypes[ 0 ].id

  @Watch( "supplierSelectGoodsList", { deep: true } )
  supplierSelectGoodsListWatcher ( v ) {
    let isSelectAll = true
    isSelectAll = v.every( item => item.isChecked )
    this.searchGoodsSelectAllStatus = isSelectAll
  }

  getGoodsSearchRes ( supplierSearchParams, cur = 1 ) {
    this.page.cur = cur
    this.supplierSelectGoodsList = []
    if ( supplierSearchParams ) {
      this.goodsSearchParams = supplierSearchParams
    }
    let { type, lcSkuCode, brandId } = this.goodsSearchParams
    if ( type === "lcSkuCode" ) {
      let params = {
        lcSkuCode: lcSkuCode.toString()
      }
      this.getAllSkuByLcSkuCode( params )
    } else if ( type === "brandId" ) {
      let { cur, num } = this.page
      let params = {
        brandId: brandId,
        start: ( cur - 1 ) * num,
        num: num
      }
      this.getAllSkuByBrandId( params )
    }
  }

  getAllSkuByLcSkuCode ( params ) {
    this.supplierSelectGoodsList = []
    this.$http( API.getSkuByLcSkuCode, params ).then(
      ( { data } ) => {
        data.skuList.forEach( sku => {
          sku.isChecked = false
          sku.isDisabled = false
        } )

        this.supplierSelectGoodsList.push( ...data.skuList )
        this.page.total = data.skuList.length
      },
      ( { data } ) => {
        this.$notify( {
          type: "warning",
          message: data.msg
        } )
      }
    )
  }
  addParams () {
    let params = []
    this.supplierSelectGoodsList.forEach( item => {
      if ( item.isChecked && !item.isDisabled ) {
        let { storeId, storeName, lcSkuCode, id, name, specification, unit, brandName } = item
        let a: any = { storeId, storeName, lcSkuCode, skuId: id, name, specification, unit, brandName }
        a.wmsType = this.currWmsType
        a.brandId = this.goodsSearchParams.brandId
        params.push( a )
      }
    } )
    return params
  }
  addGoodsToSupplier () {
    let params = this.addParams()
    if ( !params.length ) {
      this.$message( {
        type: 'warning',
        message: '请选择一组数据'
      } )
      return
    }
    this.$http( API.saveSkuDistributeRules, {
      skuDistributeRules: params
    } ).then( ( { data } ) => {
      this.$notify( {
        type: "success",
        message: "全部添加成功"
      } )
      this.disabledChecked()
      this.$emit( 'success' )
    }, rej => {
      this.$notify( {
        type: "error",
        message: rej.data.msg || '添加失败,请重新再试'
      } )
    } )
  }

  disabledChecked () {
    this.supplierSelectGoodsList.forEach( item => {
      if ( item.isChecked ) {
        item.isDisabled = true
      }
    } )
  }

  searchGoodsSelectAll () {
    this.supplierSelectGoodsList.forEach( item => {
      if ( !item.isDisabled ) {
        item.isChecked = this.searchGoodsSelectAllStatus
      }
    } )
  }


}
</script>


<style lang='stylus' scoped>
.select-item-wrap
  max-width 300px
  display flex
  flex-wrap nowrap
  .el-button
    margin-left 10px
</style>
