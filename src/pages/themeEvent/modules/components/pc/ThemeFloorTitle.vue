<template>
  <div :class="`title title-${type}`">
    <span class="dot dot-prev"></span>
    {{value.floorDesc}}
    <span class="dot dot-next"></span>
    <span class="time" v-if="timeStr">
      {{timeStr}}
    </span>
  </div>
</template>
<script>
import { formatMyDate } from '@/utils'

export default {
  name: 'theme-floor-title',
  props: {
    value: Object,
    type: Number
  },
  computed: {
    timeStr() {
      let { beginTime, endTime } = this.value
      if ( beginTime ) {
        return `活动时间：${formatMyDate( new Date( beginTime.time ), 'MM月dd日' )}-${formatMyDate( new Date( endTime.time ), 'MM月dd日' )}`
      }
      return ''
    }
  }
}
</script>
<style lang="stylus" scoped>
.title
  text-align center
  line-height 44px
  height 44px
  position sticky
  top 0
  left 0
  overflow hidden
  color #fff
  font-size 16px
  z-index 8
  background linear-gradient(155deg,rgba(250,125,132,1) 0%,rgba(185,19,213,1) 100%)
  &.title-6
    background linear-gradient(155deg,rgba(250,125,132,1) 0%,rgba(185,19,213,1) 100%)
  &.title-5
    background linear-gradient(142deg,rgba(103,216,239,1) 0%,rgba(112,94,244,1) 45%,rgba(42,21,216,1) 100%)
  &.title-4
    background linear-gradient(337deg,rgba(0,166,201,1) 0%,rgba(43,222,218,1) 100%)
  .dot
    display inline-block
    width 96px
    height 12px
    vertical-align middle
    transform scale(.5)
    background url('../../assets/title-dot.png') no-repeat
    &.dot-next
      transform scale(.5) rotateY(180deg)
  .time
    position absolute
    right 10px
    top 0
    font-size 14px
</style>
