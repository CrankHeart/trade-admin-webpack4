<template>
  <el-col :span="24" class="limit-price flex el-col-24" @click="toView">
    <div class="slogan">
      <img src="../../assets/manjian.jpg" alt />
    </div>
    <div class="list">
      <swiper :list="productList">
        <template slot-scope="{product}">
          <product-base :sku="product" @handleClick="toView">
            <p class="price">
              <span
                class="highlight"
              >&yen;{{Number(product.themeEventPrice||product.realPrice).toFixed(2)}}</span>
              <span class="line-through">&yen;{{Number(product.goodsPrice).toFixed(2)}}</span>
            </p>
          </product-base>
        </template>
      </swiper>
    </div>
    <slot></slot>
  </el-col>
</template>
<script>
import templateMixins from '../templateMixins'
import Swiper from '../../components/Swiper'
import ProductBase from '../../components/pc/ProductBase'
import Countdown from '../../components/Countdown'

export default {
  components: {
    Swiper,
    ProductBase,
    Countdown
  },
  mixins: [ templateMixins ],
  props: {
    value: Object
  },

  methods: {
    toView() {
      let jumpLink = this.moduleData.jumpLink
      if ( jumpLink ) {
        this.$router.push( jumpLink )
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.limit-price
  .slogan
    width 220px
    height 320px
    flex-shrink 0
    background #FF8909
    position relative
    img
      width 100%
      height 100%
  .list
    flex-grow 1
    box-sizing border-box
    border 1px solid #eee
    border-left none
    background #fff
    position relative
.product-item
  width 235px
  height 320px
  padding 12px
  box-sizing border-box
  border-top none !important
  border-left none !important
.price
  // margin-top -12px
  .highlight
    font-size 16px
  .line-through
    color #999
.countdown
  font-size 24px
  color #FFFFFF
  text-align center
  font-weight bold
  position absolute
  left 0
  right 0
  top 200px
  line-height 32px
  p
    font-size 14px
    font-weight normal
</style>
<style lang="stylus">
.limit-price
  .product-item
    img
      height 212px
</style>
