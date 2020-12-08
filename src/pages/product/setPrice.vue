<template>
  <div id="product-set-price">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-if="$permissionValidateWithEnv( 1251, 1247 )"
        name="priceMaintenance"
        label="商品价格维护"
      >
        <price-maintenance></price-maintenance>
      </el-tab-pane>
      <el-tab-pane
        v-if="$permissionValidateWithEnv( 1252, 1248 )"
        name="priceStrategy"
        label="定价策略设置"
      >
        <price-strategy></price-strategy>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import API from "../../API"
import lcTitle from "../../components/title.vue"
import priceStrategy from './components/priceStrategy.vue'
import priceMaintenance from './components/priceMaintenance.vue'
// import { SelectOption, Condition } from '../../typing/index'

@Component( {
  name: "product-set-price",
  components: {
    lcTitle,
    priceStrategy,
    priceMaintenance
  }
} )
export default class ProductSetPrice extends Vue {
  activeName = ''
  handleClick ( { name } ) {
    this.$router.push( `/product/setPrice?activeName=${name}` )
  }
  created () {
    let { activeName } = this.$route.query
    this.activeName = activeName || ( this.$permissionValidateWithEnv( 1251, 1247 ) && 'priceMaintenance' || this.$permissionValidateWithEnv( 1252, 1248 ) && 'priceStrategy' )
  }
}
</script>

