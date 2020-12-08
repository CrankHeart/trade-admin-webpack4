<template>
  <el-col :span="24" :class="className">
    <component :is="titleComponentName" :value="value" :type="type"></component>
    <div class="product-items clearfix">
      <product-item v-for="product in productList" :key="product.goodsSkuId" :product="product" :type="type"></product-item>
    </div>
    <div class="more" v-if="productTotal > 10 && productList.length!==productTotal">
      <div class="button" @click="getSubEventFloorProduct">
        更多商品 >>
      </div>
    </div>
    <slot></slot>
  </el-col>
</template>
<script>
import ThemeFloorTitle from './ThemeFloorTitle'
import ThemeFloorTitle1 from './ThemeFloorTitle1'
import ProductItem from './ProductItem'

export default {
  name: 'normal',
  components: {
    ThemeFloorTitle,
    ThemeFloorTitle1,
    ProductItem
  },

  props: {
    value: Object,
    type: Number
  },
  data() {
    return {
      className: 'normal',
      productPage: {
        start: 10,
        num: 10
      },
    }
  },
  computed: {
    productList() {
      let { floorProducts, floorContainers } = this.value
      return floorProducts.length && floorProducts || floorContainers.length && floorContainers
    },
    titleComponentName() {
      return this.type === 1 ? 'ThemeFloorTitle1' : 'ThemeFloorTitle'
    },
    productTotal() {
      return this.value.productTotal
    },
    themeEventId() {
      return this.value.themeEventId
    },
    themeEventFloorId() {
      return this.value.id
    }
  },
  methods: {
    getSubEventFloorProduct() {
      console.log('load more') 
    }
  }
}
</script>
<style lang="stylus" scoped>
.product-items
  padding 16px 0
.more
  padding-bottom 30px
  .button
    width 218px
    line-height 30px
    margin-bottom 30px
    border-radius 2px
    border 1px solid rgba(0,168,203,1)
    color rgba(0,168,203,1)
    text-align center
    margin auto
    cursor pointer
</style>
