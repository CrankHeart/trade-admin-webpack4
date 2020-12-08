<template>
  <el-col :span="24" class="limit-price flex el-col-24" @click="toView">
    <div class="slogan">
      <img src="../../assets/limitPrice.png" alt />
      <countdown :value="countdown" :key="countdown">
        <p>{{countdownStr}}</p>
      </countdown>
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
  data() {
    return {
      // 0 未开始  1 已开始  2  已结束
      countdownStatus: 0,
      timer: null,
      countdown: 0
    }
  },
  computed: {
    countdownStr() {
      switch ( this.countdownStatus ) {
        case 0:
          return '活动开始倒计时'
        case 1:
          return '限时倒计时'
        case 2:
          return '活动已结束'
        default:
          return ' - - '
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let { beginTime, endTime } = this.value || {}
      let begin = beginTime && beginTime.time
      let end = endTime && endTime.time
      let now = Date.now()

      // end = now + 60 * 60 * 1000 * 24 + 10100 + 60 * 1000
      if ( begin > now ) {
        this.countdown = begin
        this.countdownStatus = 0
        this.timer = setTimeout( () => this.init(), begin - now )
      } else if ( now > end ) {
        this.countdown = 0
        this.countdownStatus = 2
      } else {
        this.countdown = end
        this.countdownStatus = 1
        this.timer = setTimeout( () => this.init(), end - now )
      }
    },
    toView() {
      let jumpLink = this.moduleData.jumpLink
      if ( jumpLink ) {
        this.$router.push( jumpLink )
      }
    }
  },
  beforeDestroy() {
    clearTimeout( this.timer )
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
