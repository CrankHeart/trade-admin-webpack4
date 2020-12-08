<template>
  <div class="refill-goods">
    <lc-title text="补货助手">
      <slot>
        <el-button class="pull-right" v-for="(com,index) in Object.keys(allComponents)" :key="com" @click="toggleViews( com )" v-if="hasViewCompBtn( com )" type="primary"  >
          {{ allComponents[com].name }}
        </el-button>
      </slot>
    </lc-title>
    <keep-alive>
      <component :is="activeComponent" ref="refillGoods" ></component>
    </keep-alive>

    <refill-goods-bottom-bar v-if="activeComponent !== 'refillDirectlySku' " :curr-view="activeComponent"></refill-goods-bottom-bar>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import refillCommonSku from './components/refillCommonSku.vue'
import refillDirectlySku from './components/refillDirectlySku.vue'
import refillOrderSku from './components/refillOrderSku.vue'
import refillGoodsBottomBar from './components/refillGoodsBottomBar.vue'

@Component( {
  name: 'refill-goods',
  components: {
    lcTitle,
    refillCommonSku,
    refillDirectlySku,
    refillOrderSku,
    refillGoodsBottomBar
  }
} )
export default class procurementCreateSkuSearch extends Vue {

  allComponents: any = {
    refillCommonSku: {
      name: '普通视图',
      permission: '627'
    },
    refillDirectlySku:{
      name: '直发视图',
      permission: '628'
    },
    refillOrderSku: {
      name: '订购视图',
      permission: '1123'
    }
    }

  activeComponent: string = 'refillCommonSku'

  activated () {
  }

  deactivated () {
    this.$destroy()
  }
  toggleViews ( com: string = '') {
    this.activeComponent = com
  }

  hasViewCompBtn( com ){
    return com !== this.activeComponent && this.$permissionValidate( this.allComponents[com].permission )
  }

}
</script>
<style lang="stylus" >
// .refill-goods
.el-select-width
  width 100%
</style>


