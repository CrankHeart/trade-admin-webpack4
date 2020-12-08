<template>
  <div class="product-hot-sale">
    <el-row :gutter="30">
      <el-col :span="10">
        <product-hot-sale-spu
          :begindate="begindate"
          :sale-type="saleType"
          @saleTypeChange="saleTypeChange"
        ></product-hot-sale-spu>
      </el-col>
      <el-col :span="14">
        <product-hot-sale-brand
          :begindate="begindate"
          @choseBrand="choseBrand"
          :sale-type="saleType"
        ></product-hot-sale-brand>
      </el-col>
      <el-col :span="24">
        <product-hot-sale-spu-top :begindate="begindate" :sale-type="saleType" :brand="curBrand"></product-hot-sale-spu-top>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import productHotSaleSpu from './productHotSaleSpu.vue'
import productHotSaleBrand from './productHotSaleBrand'
import productHotSaleSpuTop from './productHotSaleSpuTop'
@Component( {
  name: 'product-hot-sale',
  components: {
    productHotSaleSpuTop,
    productHotSaleSpu,
    productHotSaleBrand
  }
} )
export default class ProductHotSale extends Vue {
  @Prop()
  begindate: string

  saleType: string = '0'

  saleTypeChange ( v ) {
    this.saleType = v
  }
  curBrand: any = null
  choseBrand ( brand ) {
    console.log( brand )
    this.curBrand = brand
  }
}
</script>

