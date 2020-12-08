<template>
  <router-link :to="moduleData.jumpLink || ''" tag="div" class="home-floor-item">
    <div class="product-img-show">
      <img :src="data.goodsImage" />
    </div>
    <div v-if="activityType == 'havePrice'" class="product-info-show">
      <p>&yen;{{formatPrice(data.realPrice)}}</p>
      <p>&yen;{{formatPrice(data.goodsPrice)}}</p>
    </div>
  </router-link>
</template>
<script>
export default {
  name: 'home-floor-item',
  props: {
    data: {
      type: Object,
      default: () => { }
    },
    moduleData: {
      type: Object,
      default: () => { }
    },
    activityType: {
      type: String,
      default: () => ''
    }
  },
  computed: {
    // goodsVO () {
    //   return this.data.goodsVO || {}
    // }
  },
  methods: {
    formatPrice( v, pos = 2 ) {
      return ( ( +v == +v ) && ( +v ).toFixed( pos ) ) || ''
    }
  }
}
</script>
<style lang="stylus" scoped>
.home-floor-item
  .product-img-show
    position relative
    width 100%
    text-align center
    img
      min-height 40px
      min-width 40px
      width 70%
  .product-info-show
    p
      font-size 12px
      color #333
      line-height 15px
      text-align center
      &:first-child
        color #ff6574
      &:last-child
        color #bbb
        font-size 10px
        text-decoration line-through
  img
    background #ccc
    max-width 100%
    border 1px solid #eee
</style>