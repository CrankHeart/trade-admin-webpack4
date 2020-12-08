<template>
  <div class="supplier-goods-select">
    <el-row>
      <el-col :lg="8" :sm="12" :xs="24">
        <div class="select-item-wrap">
          <el-select clearable v-model="form.brandId" placeholder="选择品牌" filterable>
            <el-option v-for="options in brandList" :label="options.name" :value="options.id" :key="options.id">
            </el-option>
          </el-select>
          <el-button type="primary" @click="search('brandId','lcSkuCode')">搜索</el-button>
        </div>
      </el-col>
      <el-col :lg="8" :sm="12" :xs="24">
        <div class="select-item-wrap">
          <el-input size="medium" v-model="form.lcSkuCode" placeholder="请输入sku lcCode">
          </el-input>
          <el-button type="primary" @click="search('lcSkuCode','brandId')">搜索</el-button>
        </div>
      </el-col>
      <slot name="other"></slot>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../../API'

@Component( {
  name: 'supplier-goods-select',
  components: {

  }
} )
export default class SupplierCreate extends Vue {
  @Action( "brand/getAllBrands" ) getAllBrands
  @State( state => state.brand.brandList ) brandList

  created () {
    this.getAllBrands()
  }

  form = {
    brandId: "",
    lcSkuCode: ""
  };
  search ( type1, type2 ) {
    this.form[ type2 ] = ''
    let { brandId, lcSkuCode } = this.form
    if ( this.form[ type1 ] !== "" ) {
      let supplierSearchParams = {
        brandId: brandId,
        lcSkuCode: lcSkuCode,
        type: type1
      }
      this.$emit( "getSupplierSearchParams", supplierSearchParams );
    } else {
      this.$notify( {
        type: "warning",
        message: type1 === 'brandId' ? "请选择品牌" : "请输入sku lcCode"
      } )
    }
  }
}
</script>
<style lang="stylus" scoped>
.supplier-goods-select
  margin-bottom 20px
.select-item-wrap
  max-width 300px
  display flex
  flex-wrap nowrap
  .el-button
    margin-left 10px

</style>
