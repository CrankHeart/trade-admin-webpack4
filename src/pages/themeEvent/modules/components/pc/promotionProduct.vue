<template>
  <div class="promotion-product">
    <div class="img" @click="showProductDetail">
      <img :src="sku.goodsImage">
      <div
        class="flag-img"
        :style="{ 'backgroundImage': `url(${flagImg})` }"
        v-if="activityType == 'bursting'"
      ></div>
      <div class="flag-img" v-if="activityType == 'fullGifts'"></div>
    </div>
    <div class="info">
      <p class="price-wrap price" v-if="activityType !== 'timeLimit'&&!isOutside">
        <span>&yen;{{(+sku.realPrice).toFixed( 2 )}}</span>
        <span>已售{{sku.saledNumber}}件</span>
      </p>
      <h4>{{sku.skuName|| sku.name}}</h4>
      <p class="spec">规格：{{sku.specification}}</p>
    </div>
    <div class="btn-wrap">
      <div v-if="activityType == 'timeLimit'">
        <p class="price-wrap">
          <span>&yen;{{(+sku.realPrice).toFixed( 2 )}}</span>
          <span class="line-through">&yen;{{(+sku.goodsPrice||++sku.realPrice).toFixed( 2 )}}</span>
        </p>
      </div>
      <button @click.stop="addShopCart" :class="{'is-large':activityType !== 'timeLimit'}">
        <i class="icon icon-cart__white" v-if="activityType == 'timeLimit'"></i>
        <template v-else>{{isOutside ?moduleData.floorDesc:'加入购物车'}}</template>
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable  */

const flagImgs = [
  require( '../../assets/flag-number-1.png' ),
  require( '../../assets/flag-number-2.png' ),
  require( '../../assets/flag-number-3.png' ),
  require( '../../assets/flag-number-4.png' ),
  require( '../../assets/flag-number-5.png' ),
  require( '../../assets/flag-number-6.png' ),
  require( '../../assets/flag-number-7.png' ),
  require( '../../assets/flag-number-8.png' ),
  require( '../../assets/flag-number-9.png' ),
  require( '../../assets/flag-number-10.png' )
]

export default {
  name: 'promotion-product',
  props: {
    data: {
      type: Object,
      default: () => { }
    },
    moduleData: {
      type: Object,
      default: () => { }
    },
    width: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      type: 0
    }
  },
  computed: {
    floorLayoutDetail() {
      return this.moduleData.floorLayoutDetail || {}
    },
    index() {
      return this.data.index
    },
    flagImg() {
      return flagImgs[ this.index ]
    },
    sku() {
      return this.data.item || {}
    },
    activityType() {
      return this.floorLayoutDetail.activityType
    },
    isOutside() {
      console.log( this.sku.jumpLink )
      return /^http(s?):\/\//.test( this.sku.jumpLink )
    }
  },
  methods: {
    showProductDetail() {

    },
    addShopCart() {
      if ( !this.isOutside ) {

      } else {

      }
    }
  }
}
</script>


<style lang="stylus" scoped>

$width = 218px
.line-through
  text-decoration line-through
.ellipsis
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
.promotion-product
  width $width
  height 365px
  // border 1px solid rgba(221,221,221,1)
  background #fff
  float left
  margin-right 15px
  margin-bottom 20px
  overflow hidden
  position relative
  &:nth-child(5n)
    margin-right 0
  // width 20%
.img
  position relative
  background-color #eeeeee
  text-align center
  border 1px solid #ddd
  &,img
    height $width - 2
.info
  box-sizing border-box
  width $width
  padding 8px 8px 16px
  border-left 1px solid #ddd
  border-right 1px solid #ddd
.price-wrap
  font-size 18px
  color #ff8909
  line-height 25px
  span
    &:last-child
      font-size 12px
      color #666666
.price
  margin-bottom 8px
  span
    &:last-child
      float right
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
  overflow hidden
  text-overflow ellipsis
  // display -webkit-box
  -webkit-line-clamp 2
  -webkit-box-orient vertical
  white-space nowrap
.btn-wrap
  width $width - 2
  height 34px
  border 1px solid #ff8909
  display flex
  flex-wrap nowrap
  align-items center
  >div
    // min-width 116px
    padding 0 4px
    flex-grow 1
  button
    border none
    background-color #ff8909
    text-align center
    line-height 30px
    height 34px
    // width 100px
    padding 0 10px
    flex-shrink 1
    color #ffffff
    font-size 12px
    &.is-large
      flex-grow 1
.flag-img
  width 28px
  height 20px
  position absolute
  left -3px
  top 10px
  z-index 2
  background-size contain
  background-repeat no-repeat
</style>
