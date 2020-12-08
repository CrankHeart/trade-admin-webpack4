<template>
  <router-link :to="`/product/detail/${data.spuId}`" tag="div" class="product-list-item">
    <div class="product-item__goods-img">
      <img :src="data.goodsImage" />
    </div>
    <div class="product-item__goods-desc">
      <h4>{{data.goodsName || data.name}}</h4>
      <div class="product-item__desc-bottom">
        <div class="product-item__desc-bottom-price">
          <p class="price-through">市场价:&yen;{{formatPrice(data.goodsPrice)}}</p>
          <p class="vip-price">&yen;{{formatPrice(data.realPrice)}}
            <span>会员价</span>
          </p>
        </div>
        <p class="saled-number">销量:{{data.saledNumber}}</p>
      </div>
    </div>
  </router-link>
</template>
<script>
export default {
  name: 'product-list-item',
  props: {
    data: {
      type: Object,
      default: () => { }
    },
    moduleData: {
      type: Object,
      default: () => { }
    }
  },
  components: {
  },
  methods: {
    formatPrice( v, pos = 2 ) {
      return ( ( +v == +v ) && ( +v ).toFixed( pos ) ) || ''
    }
  }
}
</script>
<style lang="stylus" scoped>
.product-list-item
  padding 8px 12px 8px 8px
  display flex
  justify-content space-between
  width 100%
  .product-item__goods-img
    flex-shrink 0
    margin-right 12px
    img
      width 112px
      height 112px
      border 1px solid #eee
  .product-item__goods-desc
    flex-grow 1
    display flex
    flex-direction column
    justify-content space-between
    h4
      font-size 14px
      font-weight 500
      line-height 14px
  .product-item__desc-bottom
    display flex
    justify-content space-between
    .price-through
      color #bbb
      font-size 12px
      text-decoration line-through
      line-height 14px
      margin-top -1px
      margin-bottom 3px
    .vip-price
      font-size 16px
      font-weight 700
      color #ff8909
      span
        display inline-block
        background-color rgba(255,137,0,.2)
        color #ff8909
        text-align center
        padding 0 3px
        height 15px
        font-size 12px
        line-height 15px
        border-radius 2px
        margin-left 5px
    .saled-number
      display flex
      flex-direction column
      justify-content flex-end
      color #bbb
      font-size 12px
</style>