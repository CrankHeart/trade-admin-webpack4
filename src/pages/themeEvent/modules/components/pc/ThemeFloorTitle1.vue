<template>
  <div class="theme-floor-title">
    {{titleStr}}
  </div>
</template>
<script>
import { formatMyDate } from '@/utils'

export default {
  name: 'theme-floor-title1',
  props: {
    value: Object,
    type: Number
  },
  computed: {
    titleStr() {
      let { beginTime, endTime } = this.value
      beginTime = beginTime && beginTime.time
      endTime = endTime && endTime.time
      let now = Date.now()
      if ( beginTime > now ) {
        return `以下商品将于${formatMyDate( new Date( beginTime ) )}开启`
      } else if ( endTime < now ) {
        return '活动结束，以下商品已恢复原价'
      } else {
        return `以下商品将于${formatMyDate( new Date( endTime ) )}恢复原价`
      }

    }
  }
}
</script>
<style lang="stylus" scoped>
.theme-floor-title
  background url('../../assets/title_1.png') no-repeat center
  line-height 30px
  text-align center
  color #fff
  font-size 14px
  position sticky
  top 60px
  left 0
  z-index 8
</style>

