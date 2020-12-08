<template>
  <el-col :span="24" class="layout-component">
    <el-row class="bursting-product-item ">
      <template v-for="(item,index) in list">
        <promotion-product :data="{item,index}" :moduleData="moduleData" :key="index"></promotion-product>
      </template>
    </el-row>
    <slot></slot>
  </el-col>
</template>

<script>
// import SubHeader from '@/components/SubHeader'
import templateMixins from './templateMixins'
import promotionProduct from '../components/pc/promotionProduct'
import { formatMyDate } from '@/utils'

export default {
  name: 'Normal_0_1',
  components: {
    promotionProduct
  },
  mixins: [ templateMixins ],
  computed:{
    list(){
      return this.floorProducts.length && this.floorProducts || this.floorContainers
    }
  },
  methods: {
    formatMyDate
  }
}
</script>
