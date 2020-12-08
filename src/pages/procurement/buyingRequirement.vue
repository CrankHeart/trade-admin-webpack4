<template>
  <div class="refill-goods">
    <lc-title text="采购需求"></lc-title>
    <keep-alive>
      <component :is="activeComponent" ref="refillGoods"></component>
    </keep-alive>
    <refill-goods-bottom-bar
      v-if="activeComponent == 'buyingRequirementDetail' "
      :curr-view="activeComponent"
    ></refill-goods-bottom-bar>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
// import refillOrderSku from './components/refillOrderSku.vue'
import refillGoodsBottomBar from './components/refillGoodsBottomBar.vue'
import buyingRequirementDetail from './components/buyingRequirementDetail.vue'

@Component( {
  name: 'refill-goods',
  components: {
    lcTitle,
    refillGoodsBottomBar,
    buyingRequirementDetail
  }
} )
export default class refillGoods extends Vue {
  activeComponent: string = 'buyingRequirementDetail'

  deactivated () {
    this.$destroy()
  }
}
</script>
<style lang="stylus" >
// .refill-goods
.el-select-width
  width 100%
</style>


