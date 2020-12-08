<template>
  <div class="product-freeze-sale">
    <el-row :gutter="30">
      <el-col :span="12">
        <product-freeze-sale-time @choseQueryType="choseQueryType"></product-freeze-sale-time>
      </el-col>
      <el-col :span="12">
        <product-freeze-sale-state :queryType="queryType" @choseLabel="choseLabel"></product-freeze-sale-state>
      </el-col>
      <template v-if="label && queryType">
        <el-col :span="12">
          <product-freeze-sale-brand :queryType="queryType" :label="label" @choseBrand="choseBrand"></product-freeze-sale-brand>
        </el-col>
        <el-col :span="12" v-if="curBrand">
          <product-freeze-sale-spu :queryType="queryType" :label="label" :brand="curBrand"></product-freeze-sale-spu>
        </el-col>
      </template>

      <el-col :span="24" v-if="$permissionValidate(661)">
        <div class="center">
          <el-button type="primary" @click="exportData">生成数据</el-button>
        </div>
        <lc-table :data="tableData" :has-page="false" :config="config">
          <template slot-scope="scope">{{scope.row[scope.con.prop]}}</template>
        </lc-table>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import productFreezeSaleTime from './productFreezeSaleTime'
import productFreezeSaleState from './productFreezeSaleState'
import productFreezeSaleBrand from './productFreezeSaleBrand'
import productFreezeSaleSpu from './productFreezeSaleSpu'
import lcTable from '../../../components/table/'
import API from '../../../API'
@Component( {
  name: 'product-freeze-sale',
  components: {
    productFreezeSaleSpu,
    productFreezeSaleTime,
    productFreezeSaleState,
    productFreezeSaleBrand,
    lcTable
  }
} )
export default class ProductFreezeSale extends Vue {
  queryType: string = null
  choseQueryType ( { queryType } ) {
    this.queryType = queryType
  }
  label: string = null
  choseLabel ( { label } ) {
    this.label = label
  }
  curBrand: any = null
  choseBrand ( brand ) {
    this.curBrand = brand
  }

  tableData: any[] = []
  config: any[] = [
    { prop: 'index', label: '序号', width: '' },
    { prop: 'brandName', label: '品牌', width: '' },
    { prop: 'spuName', label: '商品名称', width: '' },
    { prop: 'label', label: '商品属性', width: '' },
    // { prop: 'saleNum', label: '数量', width: '' },
    // { prop: 'saleAmount', label: '金额', width: '' },
    { prop: 'stock', label: '库存', width: '' }
  ]

  exportData () {
    let brand = this.curBrand || {}
    this.$http( API.findUnsalableProductsDetail, {
      queryType: this.queryType,
      lable: this.label,
      brandId: brand.brandId
    } ).then( ( { data } ) => {
      this.tableData = ( data.data || [] ).map( ( v, i ) => ( { ...v, index: i + 1 } ) )
    } )
  }
}
</script>

