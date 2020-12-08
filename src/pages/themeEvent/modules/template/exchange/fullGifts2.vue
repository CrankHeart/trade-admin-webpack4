<template>
  <el-col :span="12" class="full-gifts-component">
    <router-link :to="moduleData.jumpLink">
      <el-row type="flex" justify="space-between" class="title-column">
        <el-col>
          <div class="title">{{moduleData.floorName}}
            <i v-if="moduleData.icon"></i>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="(24/column)" v-for="(item,index) in floorContainers" :key="index">
          <product-item-have-badge :item="item" :index="index" :moduleData="moduleData"></product-item-have-badge>
        </el-col>
      </el-row>
      <slot></slot>
    </router-link>
  </el-col>
</template>
<script>
import templateMixins from '../templateMixins'
import fullGiftsView2 from './fullGiftsView2'
import productItemHaveBadge from '../../components/pc/productItemHaveBadge'

export default {
  name: 'full-gifts',
  components: {
    productItemHaveBadge
  },
  mixins: [ templateMixins, fullGiftsView2 ],
  data() {
    return {
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
        { label: '已售', prop: 'saledNumber', type: 'text' },
        { label: '满赠活动', prop: 'fullGiftsActivity', type: 'text' }
      ]
    }
  },
  computed: {
    floorLayoutDetail() {
      return this.moduleData.floorLayoutDetail || {}
    },
    floorContainers() {
      return this.moduleData.floorContainers || []
    },
    column() {
      return 3
    }
  }
}
</script>