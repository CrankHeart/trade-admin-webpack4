<template>
  <router-link :to="moduleData.jumpLink||''" tag="div" class="have-badge-product-item">
    <div class="product-img-show">
      <img :src="sku.goodsImage" />
      <!-- <template v-if="moduleData.activityType == 'bursting'"> -->
      <i class="bursting-badge"></i>
      <!-- </template> -->
      <!-- <template v-else>
        <i class="full-gifts-badge" v-if="sku.fullGiftsActivity">{{sku.fullGiftsActivity}}</i>
      </template> -->
    </div>
    <div class="product-info-show">
      <p>{{sku.goodsName || sku.name}}</p>
      <div class="specification">规格:{{sku.specification}}</div>
      <el-row type="flex" justify="space-between">
        <el-col :span="12">
          <span class="pull-left">&yen;{{Number(sku.goodsPrice||sku.realPrice || sku.themeEventPrice).toFixed(2)}}</span>
        </el-col>
        <el-col :span="12">
          <span class="pull-right">已销:{{sku.saledNumber}}</span>
        </el-col>
      </el-row>
    </div>
  </router-link>
</template>
<script>

export default {
  name: 'have-badge-product-item',
  props: {
    item: {
      type: Object,
      default: () => ( {} )
    },
    moduleData: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
    sku() {
      return this.item
    }
  }
}
</script>
<style lang="stylus" scoped>
.have-badge-product-item
  padding 20px 0 10px
  border-bottom 1px solid #eee
  height 270px
  box-sizing border-box
  .product-img-show
    position relative
    text-align center
    img
      height 158px
      width 158px
      border 1px solid #eee
    i
      position absolute
      text-align center
      display inline-block
      color #fff
      font-style normal
      left -5px
      top -6px
  .bursting-badge
    width 24px
    height 23px
    background-repeat no-repeat
  .full-gifts-badge
    width 64px
    height 22px
    line-height 20px
    background-color #f45060
    font-size 12px
    text-align center
    font-family PingFangSC-Medium
  .product-info-show
    p
      font-size 12px
      color #333
      line-height 17px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      -webkit-box-orient vertical
      -webkit-line-clamp 2
    .specification
      color #999
      font-size 12px
      width 75%
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      -webkit-box-orient vertical
      -webkit-line-clamp 1
    .el-row
      padding 15px 0 0
      box-sizing border-box
      line-height 18px
      div
        margin-bottom 0
        &:first-child
          color #333
          font-size 16px
        &:last-child
          color #999
          font-size 12px
</style>