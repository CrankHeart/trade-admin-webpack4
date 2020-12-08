<template>
  <router-link :to="moduleData.jumpLink||''" tag="div" class="have-time-limit-product-item">
    <div class="product-img-show">
      <img :src="data.goodsImage" />
    </div>
    <div class="product-info-show">
      <p>{{data.goodsName || data.name}}</p>
      <div class="specification">规格:{{data.specification}}</div>
      <div class="price-show">
        <span>&yen;{{Number(data.realPrice|| data.themeEventPrice || 0).toFixed(2)}}</span>
        <span>&yen;{{Number(data.goodsPrice || 0).toFixed(2)}}</span>
      </div>
      <p class="product-time">该商品于{{formatMyDate(new Date(moduleData.endTime&&moduleData.endTime.time),'yyyy-MM-dd hh:mm')}}恢复原价</p>
    </div>
  </router-link>
</template>
<script>
import { formatMyDate } from '../../../../../utils/index'
export default {
  name: 'product-item-have-time-limit',
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
    formatMyDate
  }
}

</script>
<style lang="stylus" scoped>
.have-time-limit-product-item
  padding 0
  border 1px solid #eee
  // height 350px
  box-sizing border-box
.product-img-show
  position relative
  text-align center
  img
    width 100%
    height 210px
    border-bottom 1px solid #eee
.product-info-show
  p
    font-size 12px
    color #333
    line-height 24px
    height 24px
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    -webkit-box-orient vertical
    -webkit-line-clamp 1
    padding 0 10px
  .specification
    color #999
    font-size 12px
    width 75%
    height 24px
    line-height 24px
    overflow hidden
    text-overflow ellipsis
    // display -webkit-box
    white-space nowrap
    -webkit-box-orient vertical
    -webkit-line-clamp 1
    margin-bottom 10px
    padding 0 10px
.price-show
  padding 0 10px
  span
    margin-bottom 12px
    &:first-child
      display inline-block
      width 54%
      height 22px
      line-height 22px
      background #000
      text-align center
      color #fff
      font-size 16px
      margin-right 12px
    &:last-child
      width 33%
      height 20px
      line-height 20px
      text-decoration line-through
      font-size 14px
      color #bbb
  &:after
    content ''
    width 100%
    height 1px
    background #eee
    display block
.product-time
  height 18px
  line-height 18px
  text-align left
  color #666
  font-size 12px
</style>