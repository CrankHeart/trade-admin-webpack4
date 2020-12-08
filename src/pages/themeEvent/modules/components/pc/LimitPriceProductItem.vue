<template>
  <div class="product-item">
    <div class="img" @click="$emit('handleClick')" v-webClick="'活动落地页-商品详情'">
      <img v-lazy="sku.goodsImage" alt>
    </div>
    <h4>{{sku.skuName}}</h4>
    <p class="spec">规格：{{sku.specification}}</p>
  </div>
</template>
<script>
export default {
  props: [ 'sku' ]
}
</script>
<style lang="stylus" scoped>
.product-item
  width 235px
  height 320px
  padding 12px
  box-sizing border-box
  img
    width 100%
    height 212px
</style>
