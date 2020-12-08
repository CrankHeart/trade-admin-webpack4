<template>
  <div class="order-distribute">
    <lc-title text="订单配货表"></lc-title>
    <el-tabs v-model="activeName" @tab-click="changeActiveName">
      <el-tab-pane label="商家默认配货规则" name="orderDistributeDefault">
        <order-distribute-default></order-distribute-default>
      </el-tab-pane>
      <el-tab-pane label="商家自定义配货规则" name="orderDistributeCustomer">
        <order-distribute-customer></order-distribute-customer>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import orderDistributeDefault from './components/orderDistributeDefault.vue'
import orderDistributeCustomer from './components/orderDistributeCustomer.vue'

@Component( {
  name: 'order-distribute',
  components: {
    lcTitle,
    orderDistributeDefault,
    orderDistributeCustomer
  }
} )
export default class OrderDistribute extends Vue {
  activeName: string = 'orderDistributeDefault'

  changeActiveName( tab, event ){
    // this.activeName = tab
  }
}
</script>
<style lang="stylus" scoped>
</style>
