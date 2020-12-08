<template>
  <el-col :span="12" class="full-gifts-component">
    <el-row  type="flex" justify="space-between" class="title-column">
      <el-col :span="6">
        <div class="title">
          <i></i>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="(24/moduleData.column)" v-for="(item,index) in moduleData.floorProducts" :key="index">
        <product-item-have-badge :item="item" :index="index" :moduleData="moduleData" v-if="index+1<moduleData.column*2"></product-item-have-badge>
      </el-col>
    </el-row>
    <slot></slot>
  </el-col>
</template>
<script>
import productItemHaveBadge from '../../components/pc/productItemHaveBadge'

export default {
  name: 'full-gifts-view',
  components: {
    productItemHaveBadge
  }
}
</script>
<style lang="stylus" scoped>
.full-gifts-component
  border 1px solid #eee
  padding 20px 15px 28px 24px
  margin-bottom 25px
  .title-column
    box-sizing border-box
    padding 0 10px
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
</style>