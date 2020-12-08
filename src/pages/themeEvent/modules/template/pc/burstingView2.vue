<template>
  <el-col :span="12" class="layout-component">
    <router-link :to="moduleData.jumpLink">
      <el-row type="flex" justify="space-between" class="title-column">
        <el-col>
          <div class="title">{{moduleData.floorName}}
            <i class="icon-arrow"></i>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="25" class="bursting-product-box">
        <template v-for="(item,index) in floorContainers">
          <el-col :span="+(24/column)" :key="index" v-if="index+1<column*2">
            <product-item-have-badge :data="{item,index}" :moduleData="moduleData"></product-item-have-badge>
          </el-col>
          <el-col :span="+(24/column)" v-else @mouseover.native="curIndex = index" :key="index">
            <div :to="moduleData.jumpLink">
              <div :class="['other-product-info',{'actived':index==curIndex}]">
                <p>
                  <span class="number">{{0+index+1+'/'}}</span>
                  {{item.goodsName || item.name}}</p>
                <img :src="item.goodsImage" />
              </div>
            </div>
          </el-col>
        </template>

      </el-row>
      <slot></slot>
    </router-link>
  </el-col>
</template>
<script>
import productItemHaveBadge from '../../components/pc/productItemHaveBadge'

export default {
  name: 'bursting-view',
  components: {
    productItemHaveBadge
  },
  data() {
    return {
      curIndex: 6
    }
  },
  computed: {
  }
}
</script>
<style lang="stylus" scoped>
.layout-component
  border 1px solid #eee
  padding 20px 20px 28px
  .title-column
    box-sizing border-box
    padding 20px 10px 0
    min-height 52px
    box-shadow 0px 0px
  .title
    font-size 20px
    color #333
    font-weight 700
    i
      display inline-block
      color #666
      font-size 14px
      margin-left 5px
      width 16px
      height 16px
      background url('../../assets/look-more.png') center center/16px 16px no-repeat
  .tab
    color #666
    font-size 14px
    margin-right 5px
    &.active
      color #000
    span
      &:first-child
        margin-right 5px
  .el-col
    margin-bottom 0!important
    &:nth-child(6)
      margin-top 25px
  .other-product-info
    height 20px
    font-size 16px
    color #999
    width 100%
    display inline-block
    position relative
    .number
      float left
      margin-right 5px
      font-size 16px
    p
      font-size 12px
      color #666
      // padding-left 25px
      line-height 26px
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
    img
      display none
    &.actived
      height auto
      font-size 20px
      color #ff6574
      p
        padding-left 0
        font-size 14px
        color #333
        line-height 20px
        white-space normal
      .number
        font-size 20px
        color #ff2170
        margin-top -3px
      img
        margin 2px
        display block
        width 58px
        height 58px
        border 1px solid #eee
  .el-row
    .el-col
      &:nth-child(1)
      &:nth-child(2)
      &:nth-child(3)
        .have-badge-product-item
          border-bottom 1px solid #eee
</style>
<style lang="stylus">
  .bursting-product-box
    .el-col
      &:nth-child(1)
        .have-badge-product-item
          .bursting-badge
            background-image url('../../assets/flag-number-1.png')
      &:nth-child(2)
        .have-badge-product-item
          .bursting-badge
            background-image url('../../assets/flag-number-2.png')
      &:nth-child(3)
        .have-badge-product-item
          .bursting-badge
            background-image url('../../assets/flag-number-3.png')
      &:nth-child(4)
        .have-badge-product-item
          .bursting-badge
            background-image url('../../assets/flag-number-4.png')
      &:nth-child(5)
        .have-badge-product-item
          .bursting-badge
            background-image url('../../assets/flag-number-5.png')
</style>
