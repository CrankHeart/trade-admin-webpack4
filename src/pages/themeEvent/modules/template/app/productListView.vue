<template>
  <flex-box :span="moduleData.floorLayout|| 24" class="product-list-view">
    <flexbox class="product-list-view-item">
      <flex-box :span="24" v-for="(item,index) in moduleData.floorProducts" :key="index">
        <product-list-item :data="item" :moduleData="moduleData"></product-list-item>
      </flex-box>
    </flexbox>
    {{data}}
    <slot></slot>
  </flex-box>
</template>
<script>
import productListItem from '../../components/app/productListItem.vue'
import FlexBox from '../../components/FlexBox.vue'
export default {
  name: 'product-list-view',
  components: {
    productListItem,
    FlexBox
  }
}
</script>
<style lang="stylus" scoped>
.product-list-view
  border 1px solid #eee
  padding-right 0 !important
  .product-list-view-item
    box-shadow 0 0
    display block !important
    >div
      border-bottom 1px solid #eee
      &:last-child
        border-bottom none
  .el-col
    margin-bottom 0 !important
.burst-tip
  flex-shrink 0
  height 50px
  line-height 50px
  font-size 14px
  color #fff
  text-align center
  background linear-gradient(150deg, #5ec8ed 0%, #3d8ae4 100%)
  &:before, &:after
    content '●'
</style>