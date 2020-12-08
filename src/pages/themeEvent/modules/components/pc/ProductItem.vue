<template>
  <div class="product-item">
    <div class="img">
      <img :src="sku.goodsImage" alt="">
    </div>
    <p class="price" v-if="type!==1">
      <span class="real-price">
        &yen;{{(+sku.realPrice).toFixed( 2 )}}
      </span>
      <span class="sale-price">
        &yen;{{(+sku.goodsPrice).toFixed( 2 )}}
      </span>
      <span class="pull-right sale-number">
        已售{{sku.saledNumber}}件
      </span>
    </p>
    <h4>
      {{sku.skuName}}
    </h4>
    <p class="spec">
      规格：{{sku.specification}}
    </p>
    <div class="shopping-add">
      <!-- 限时特价 -->
      <template v-if="type==1">
        <p class="price" v-if="type===1">
          <span class="real-price">
            &yen;{{(+sku.realPrice).toFixed( 2 )}}
          </span>
          <span class="sale-price">
            &yen;{{(+sku.goodsPrice).toFixed( 2 )}}
          </span>
        </p>
      </template>
      <div class="button">
        <i class="icon icon-cart__white" v-if="type===1"></i>
        <template v-else>
          加入购物车
        </template>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'product-item',
  props: {
    product: Object,
    type: Number
  },
  computed: {
    sku() {
      return Object.assign(
        {},
        this.product,
        this.product.goodsVO,
        { id: undefined, goodsVO: undefined }
      )
    }
  }
}
</script>
<style lang="stylus" scoped>
.ellipsis
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
.product-item
  width 218px
  height 350px
  border 1px solid rgba(221,221,221,1)
  background #fff
  float left
  margin-right 15px
  margin-bottom 20px
  overflow hidden
  position relative
  &:nth-child(5n)
    margin-right 0
  .img
    height 215px
    border-bottom 1px solid rgba(221,221,221,1)
    margin-bottom 8px
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
    margin-bottom 4px
    @extend .ellipsis
  .spec
    font-size 12px
    color #666666
    height 34px
    line-height 17px
    @extend .ellipsis
    -webkit-line-clamp 2
    -webkit-box-orient vertical
  .shopping-add
    position absolute
    left 0
    right 0
    bottom 0
    // width 100%
    z-index 2
    display flex
    line-height 32px
    height 32px
    overflow hidden
    border 1px solid #ff8909
    box-sizing border-box
    .button
      background rgba(255,137,9,1)
      text-align center
      color #fff
      flex-grow 1
      line-height 26px
    .price
      line-height 34px
      flex-grow 1
      & + .button
        width 32px
        flex-shrink 1
        font-size 12px
        flex-grow 0
</style>

