<template>
  <el-col :span="12" class="layout-component">
    <el-row type="flex" justify="space-between" class="title-column">
      <el-col>
        <div class="title">{{moduleData.floorName}}
          <i v-if="moduleData.icon"></i>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="25" class="bursting-product-box">
      <template v-for="(item,index) in productList">
        <el-col :span="+(24/column)" :key="index" v-if="index+1<column*2">
          <product-item-have-badge :item="item" :moduleData="moduleData"></product-item-have-badge>
        </el-col>
        <el-col :span="+(24/column)" v-else @mouseover.native="curIndex = index" :key="index">
          <div :to="moduleData.jumpLink||''">
            <div :class="['other-product-info',{'actived':index==curIndex}]">
              <p>
                <span class="number">{{0+index+1+'/'}}</span>
                {{item.goodsName || item.name}}</p>
              <img :src="item.goodsImage" />
            </div>
          </div>
        </el-col>
      </template>
    </el-row>
    <slot></slot>
  </el-col>
</template>
<script>
import templateMixins from '../templateMixins'
import burstingView2 from './burstingView2'
import productItemHaveBadge from '../../components/pc/productItemHaveBadge'

export default {
  name: 'bursting',
  components: {
    productItemHaveBadge
  },
  mixins: [ templateMixins, burstingView2 ],
  data() {
    return {
      curIndex: 5,
      curTab: null
    }
  },
  computed: {
    floorLayoutDetail() {
      return this.moduleData.floorLayoutDetail || {}
    },
    column() {
      return 3
    },
    floorContainers() {
      return this.moduleData.floorContainers
    },
    floorProducts() {
      return this.moduleData.floorProducts
    },
    productList() {
      return this.floorProducts.length && this.floorProducts || this.floorContainers
    }
  }
}
</script>
