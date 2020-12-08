<template>
  <el-col :span="+moduleData.floorLayout || 24" class="time-limit-box">
    <div class="time-limit-img pull-left">
      <img src="../../assets/time-limit-banner.jpg">
    </div>
    <el-carousel>
      <el-carousel-item v-for="(item,index) in otherProducts" :key="index">
        <el-col :span="(24/moduleData.column)" v-for="(itemList,i) in item" :key="i">
          <product-item-have-time-limit :data="itemList" :moduleData="moduleData"></product-item-have-time-limit>
        </el-col>
      </el-carousel-item>
    </el-carousel>
    <slot></slot>
  </el-col>
</template>
<script>
import productItemHaveTimeLimit from '../../components/pc/productItemHaveTimeLimit'

export default {
  name: 'time-limit-price-view',
  components: {
    productItemHaveTimeLimit
  }
}
</script>
<style lang="stylus" scoped>
.time-limit-box
  border 1px solid #eee
  padding 20px 15px 28px 24px
.time-limit-img
  width 220px
  height 348px
  border 1px solid #eee
  img
    width 220px
    height 100%
</style>
<style lang="stylus">
.time-limit-box
  .el-carousel__arrow
    border-radius 0
    background rgba(153,153,153,.6)
    width 20px
    height 44px
    top 100px
    &:hover
      background rgba(153,153,153,.8)
  .el-carousel__arrow--left
    left 0
  .el-carousel__arrow--right
    right 0
</style>
