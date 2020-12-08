<template>
  <el-col :span="12" class="bursting-component">
    <router-link :to="moduleData.jumpLink">
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
            <product-item-have-badge :item="item" :index="index" :moduleData="moduleData"></product-item-have-badge>
          </el-col>
          <el-col :span="+(24/column)" v-else @mouseover.native="curIndex = index" :key="index">
            <div :to="moduleData.jumpLink">
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
    </router-link>
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
      curTab: null,
      extendProps: [
        {
          prop: 'activityType', label: '活动种类', type: 'select', options: [ { name: '爆款', id: 'bursting' }, { name: '满赠', id: 'fullGifts' } ]
        },
        {
          prop: 'icon', label: '图标', type: 'switch', options: [ { name: '箭头', id: 0 } ]
        }
      ],
      productConfig: [
        { label: '图片', prop: 'goodsImage', type: 'upload' },
        { label: 'spu', prop: 'goodsName', type: 'text' },
        { label: 'sku', prop: 'specification', type: 'text' },
        { label: '原价', prop: 'goodsPrice', type: 'text' },
        // { label: '现价', prop: 'realPrice', type: 'text' },
        { label: '已售', prop: 'saledNumber', type: 'text' }
      ]
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
    productList() {
      return this.floorProducts.length && this.floorProducts || this.floorContainers
      // return [1,2,3,4,5,6,7,8,9,0].reduce(total=>total.concat(arr),[])
    }
  }
}
</script>
