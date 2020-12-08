<template>
  <div class="product-item">
    <div class="img" @click="$emit('handleClick')" >
      <img :src="sku.goodsImage" alt>
    </div>
    <slot name="prev"></slot>
    <h4>{{sku.skuName|| sku.name}}</h4>
    <p class="spec">规格：{{sku.specification}}</p>
    <slot></slot>
  </div>
</template>
<script>
export default {
  props: [ 'sku', 'type' ]
}
</script>
<style lang="stylus" scoped>
.ellipsis
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
.product-item
  border 1px solid rgba(221,221,221,1)
  background #fff
  overflow hidden
  position relative
  .img
    height 215px
    border-bottom 1px solid rgba(221,221,221,1)
    margin-bottom 4px
    cursor pointer
    img
      width 100%
      height 100%
  .price
    line-height 26px
    .real-price
      font-size 18px
      color rgba(255,137,9,1)
    .sale-price
      font-size 10px
      transform scale(.8)
      text-decoration line-through
      color rgba(187,187,187,1)
    .sale-number
      font-size 12px
      color rgba(102,102,102,1)
  p
  h4
    padding 0 8px
  h4
    font-size 12px
    line-height 17px
    font-weight normal
    // margin-bottom 4px
    @extend .ellipsis
  .spec
    font-size 12px
    color #999
    height 34px
    line-height 17px
    @extend .ellipsis
    -webkit-line-clamp 2
    -webkit-box-orient vertical
</style>
