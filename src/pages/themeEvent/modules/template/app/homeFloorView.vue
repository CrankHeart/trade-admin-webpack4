<template>
  <flex-box :span="moduleData.floorLayout|| 24" class="home-floor-view">
    <h4 class="title-column">{{moduleData.floorName}}</h4>
    <p v-if="activityType ==='havePrice'" class="product-desc-show">{{data.item.floorDesc}}</p>
    <flex-box
      :span="(24/moduleData.column)"
      v-for="(item,index) in moduleData.floorProducts"
      :key="index"
    >
      <home-floor-item
        :data="{item,index}"
        :moduleData="moduleData"
        v-if="index+1<moduleData.column*2"
        :activityType="activityType"
      ></home-floor-item>
    </flex-box>
    <slot></slot>
  </flex-box>
</template>
<script>
import homeFloorItem from '../../components/app/homeFloorItem.vue'
import FlexBox from '../../components/FlexBox.vue'
export default {
  name: 'home-floor-view',
  components: {
    homeFloorItem,
    FlexBox
  },
  created() {
  },
  computed: {
  }
}
</script>
<style lang="stylus" scoped>
.home-floor-view
  padding 12px
  flex-direction column
  box-sizing border-box
  border-bottom 1px solid #eee
  position relative
  background-color #fff
  &:nth-child(2n-1)
    &:after
      position absolute
      right 0
      top 10%
      width 1px
      height 80%
      background-color #eee
      content ''
  .title-column
    box-sizing border-box
    height 22px
    line-height 22px
    box-shadow 0px 0px
    font-size 16px
    font-weight 400
    color #3d8ae4
  .product-desc-show
    font-size 12px
    color #666
    height 17px
    line-height 17px
  .el-col
    margin-bottom 0 !important
</style>