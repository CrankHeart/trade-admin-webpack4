<template>
  <div class="supplier-goods-list">
    <!-- 添加商品 -->
    <supplier-goods-select @getSupplierSearchParams="getGoodsSearchRes"></supplier-goods-select>
    <lc-table
      :config="supplierAddConfig"
      v-if="supplierSelectGoodsList.length"
      :data="supplierSelectGoodsList"
      @cur-change="curChange"
      :page="page"
      :key="supplierAddConfig.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='check'">
          <el-checkbox v-model="scope.row['isChecked']" v-if="scope.row['supplierGoodsStatus']===0"></el-checkbox>
          <el-checkbox
            v-model="scope.row['isDisabled']"
            v-else
            :disabled="scope.row['supplierGoodsStatus']===1"
          ></el-checkbox>
        </template>
        <template v-else-if="scope.con.prop==='price'">
          <el-input
            type="number"
            v-model="scope.row['agreePrice']"
            min="0"
            :disabled="scope.row['supplierGoodsStatus']===1"
            @mousewheel.native.prevent="stopMouseWheelChang"
          ></el-input>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <div class="sticky-bottom" v-if="supplierSelectGoodsList.length">
      <el-checkbox v-model="searchGoodsSelectAllStatus" @change="searchGoodsSelectAll">全选</el-checkbox>
      <el-button type="primary" @click="addGoodsToSupplier">添加选中</el-button>
      <span>已添加商品({{productsListTotal}})</span>
      <el-button v-if="nextStep" type="primary" class="pull-right" @click="goStep()">下一步</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch, Prop } from 'vue-property-decorator'
import { supplierAddConfig } from "../const/index"
import lcTable from "../../../components/table/index"
import API from '../../../API'
import supplierGoodsSelect from './supplierGoodsSelect.vue'

@Component( {
  name: 'supplier-goods-list',
  components: {
    lcTable,
    supplierGoodsSelect
  }
} )
export default class SupplierCreate extends Vue {
  @Prop() supplierId: number
  @Prop( {
    type: Boolean,
    default: () => true
  } )
  nextStep

  get id () {
    return this.$route.params.id || this.supplierId
  }
  supplierAddConfig = supplierAddConfig
  page: any = {
    cur: 1,
    num: 10,
    total: 0
  }
  supplierSelectGoodsList: any = []
  searchGoodsSelectAllStatus: boolean = false
  @Watch( "supplierSelectGoodsList", { deep: true } )
  supplierSelectGoodsListWatcher ( v ) {
    this.supplierSelectGoodsList = v
    let isSelectAll = true
    v.forEach( item => {
      if ( !item.supplierGoodsStatus && !item.isChecked ) {
        isSelectAll = false
      }
      if ( item.supplierGoodsStatus ) {
        item.isDisabled = true
      }
    } )
    this.searchGoodsSelectAllStatus = isSelectAll
  }
  goodsSearchParams: any = null
  getGoodsSearchRes ( supplierSearchParams, cur = 1 ) {
    this.page.cur = cur
    this.supplierSelectGoodsList = []
    if ( supplierSearchParams ) {
      this.goodsSearchParams = supplierSearchParams
    }
    let { type, lcSkuCode, brandId } = this.goodsSearchParams
    if ( type === "lcSkuCode" ) {
      let params = {
        lcSkuCode: lcSkuCode.toString(),
        supplierId: this.supplierId
      }
      this.getAllSkuByLcSkuCode( params )
    } else if ( type === "brandId" ) {
      let { cur, num } = this.page
      let params = {
        brandId: brandId,
        supplierId: this.supplierId,
        start: ( cur - 1 ) * num,
        num: num
      }
      this.getAllSkuByBrandId( params )
    }
  }
  curChange ( cur ) {
    this.getGoodsSearchRes( null, cur )
  }
  stopMouseWheelChang () {
    return false
  }
  getAllSkuByLcSkuCode ( params ) {
    this.supplierSelectGoodsList = []
    this.$http( API.getAllSkuByLcSkuCode, params ).then(
      ( { data } ) => {
        data.sku.isChecked = false
        data.sku.isDisabled = false
        this.supplierSelectGoodsList.push( data.sku )
        this.page.total = 1
      },
      ( { data } ) => {
        this.$notify( {
          type: "warning",
          message: data.msg
        } )
      }
    )
  }
  getAllSkuByBrandId ( params ) {
    let { cur, num } = this.page
    params.start = ( cur - 1 ) * num
    params.num = num
    this.supplierSelectGoodsList = []
    this.$http( API.getAllSkuByBrandId, params ).then(
      ( { data } ) => {
        let arr = data.skuList
        arr.forEach( item => {
          item.isChecked = false
          item.isDisabled = false
        } )
        this.supplierSelectGoodsList = arr
        this.page.total = data.total
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
        let a = {
          agreePrice: item.agreePrice,
          lcCode: item.lcSkuCode,
          skuId: item.id,
          supplierId: this.supplierId
        }
        this.productsListTotal++
        params.push( a )
      } else {
        return false
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
    this.$http( API.addSupplierGoods, {
      list: params
    } ).then(
      ( { data } ) => {

        if ( data.failedList.length > 0 ) {
          this.$notify( {
            type: "warning",
            message: data.failedList.length + "条添加失败"
          } )
        } else if ( data.successList.length === params.length ) {
          this.$notify( {
            type: "success",
            message: "全部添加成功"
          } )
          this.$emit( 'success' )
        }
        this.supplierSelectGoodsList.map( item => {
          if ( item.isChecked ) {
            item.supplierGoodsStatus = 1
          }
        } )

      },
      rej => {
        this.$notify( {
          type: "warning",
          message: '添加失败,请重新再试'
        } )
      } )
  }
  searchGoodsSelectAll () {
    this.supplierSelectGoodsList.forEach( item => {
      if ( item.supplierGoodsStatus === 0 && this.searchGoodsSelectAllStatus ) {
        item.isChecked = true
      } else if ( item.supplierGoodsStatus === 0 && !this.searchGoodsSelectAllStatus ) {
        item.isChecked = false
      }
    } )
  }
  goStep () {
    this.$emit( 'go-step', 3 )
  }
  productsListTotal: any = ''
  mounted () {
    let params = {
      supplierId: this.id,
      num: 10,
      start: 0
    }
    this.$http( API.getSupplierSkuList, params ).then( ( { data } ) => {
      this.productsListTotal = data.total
    } )
  }
}
</script>
<style lang="stylus" scoped>

  // .supplier-goods-list

  //   .supplier-goods-list-button

  //     margin-left 50px

</style>
