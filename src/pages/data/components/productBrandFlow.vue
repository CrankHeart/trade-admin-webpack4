<template>
  <div class="product-brand-flow">
    <el-row :gutter="30">
      <el-col :span="10">
        <product-brand-flow-top
          :sale-type="saleType"
          @saleTypeChange="saleTypeChange"
          :begindate="begindate"
        ></product-brand-flow-top>
      </el-col>

      <el-col :span="14">
        <product-brand-flow-top-rank
          :sale-type="saleType"
          @choseBrand="choseBrand"
          :begindate="begindate"
        ></product-brand-flow-top-rank>
      </el-col>

      <el-col :span="24">
        <product-brand-flow-spu-rank
          :sale-type="saleType"
          :brand="curBrand"
          @choseSpu="choseSpu"
          :begindate="begindate"
        ></product-brand-flow-spu-rank>
      </el-col>

      <el-col :span="24" v-if="curBrand">
        <product-brand-flow-region
          :sale-type="saleType"
          :brand="curBrand"
          :spu="curSpu"
          :begindate="begindate"
        ></product-brand-flow-region>
      </el-col>
      <el-col :span="24" v-if="$permissionValidate(491)">
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
import { Component, Prop } from 'vue-property-decorator'
import productBrandFlowTop from './productBrandFlowTop.vue'
import productBrandFlowTopRank from './productBrandFlowTopRank'
import productBrandFlowSpuRank from './productBrandFlowSpuRank'
import productBrandFlowRegion from './productBrandFlowRegion'
import API from '../../../API'
import lcTable from '../../../components/table/'
@Component( {
  name: 'product-brand-flow',
  components: {
    productBrandFlowTop,
    productBrandFlowTopRank,
    productBrandFlowSpuRank,
    productBrandFlowRegion,
    lcTable
  }
} )
export default class ProductBrandFlow extends Vue {
  @Prop()
  begindate: string
  saleType: string = '0'
  saleTypeChange ( v ) {
    this.saleType = v
  }
  config: any[] = [
    { prop: 'index', label: '序号', width: '' },
    { prop: 'brandName', label: '品牌名称', width: '' },
    { prop: 'spuName', label: '商品名称', width: '' },
    { prop: 'region', label: '大区', width: '' },
    { prop: 'city', label: '城市', width: '' },
    { prop: 'saleAmount', label: '销售额', width: '' },
    { prop: 'saleNum', label: '销售量', width: '' }
  ]
  curBrand: any = null

  choseBrand ( brand ) {
    this.curBrand = brand
  }
  curSpu: any = null
  choseSpu ( spu ) {
    this.curSpu = spu
  }
  tableData: any[] = []
  exportData () {
    let brand = this.curBrand || {}
    let spu = this.curSpu || {}
    this.$http( API.findDetails, {
      queryType: this.saleType,
      begindate: this.begindate,
      brandId: brand.brandId,
      spuCode: spu.spu
    } ).then( ( { data } ) => {
      this.tableData = ( data.data || [] ).map( ( v, i ) => ( { ...v, index: i + 1 } ) )
    } )
  }
}
</script>

