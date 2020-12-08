<template>
  <div>
    <el-select v-model="darkBrand" filterable>
      <el-option v-for="brand in brandList" :label="brand.name" :value="brand.id" :key="brand.id"></el-option>
    </el-select>
    {{darkBrand}}
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Inject } from "vue-property-decorator"
import { State, Action } from 'vuex-class'
@Component( {
  name: "dark-brands"
} )
export default class DarkBrand extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( "brand/getAllBrands" ) getAllBrands

  darkBrand = null
  created () {
    this.getAllBrands()
  }
}
</script>
<style lang="stylus" scoped>
div
  margin-bottom 10px
</style>
