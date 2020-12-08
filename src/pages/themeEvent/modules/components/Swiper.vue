<template>
  <div class="swiper">
    <button class="prev" @click="swipeTo(cur-step)">
      <i class="el-icon-arrow-left"></i>
    </button>
    <ul :style="ulStyle">
      <li v-for="(item,index) in list" :key="index" ref="child">
        <slot :product="item"></slot>
      </li>
    </ul>
    <button class="next" @click="swipeTo(cur+step)">
      <i class="el-icon-arrow-right"></i>
    </button>
  </div>
</template>
<script lang="ts">
import { Component ,Vue, Prop } from 'vue-property-decorator'

@Component
export default class Swiper extends Vue {
  @Prop()
  list: any[]
  @Prop( { default: 4 } )
  type: number
  cur = 0
  childrenWidth = []
  get fullWdith() {
    return this.childrenWidth.reduce( ( p, t ) => p + t, 0 )
  }
  get ulStyle() {
    let offsetLeft = this.childrenWidth.slice( 0, this.cur ).reduce( ( p, t ) => p + t, 0 )
    return {
      width: `${this.fullWdith}px`,
      left: `-${offsetLeft}px`
    }
  }
  mounted() {
    let children = this.$refs.child || []
    this.childrenWidth = children.map( v => v.offsetWidth )
  }
  swipeTo( index ) {
    let max = this.list.length - this.step
    let min = 0
    if ( index >= max ) {
      index = max
    } else if ( index <= min ) {
      index = min
    }
    this.cur = index
  }
}
</script>
<style lang="stylus" scoped>
.swiper
  position relative
  width 100%
  height 100%
  overflow hidden
ul
  position absolute
  left 0
  top 0
  transition all .5s
li
  float left
button
  background rgba(153,153,153,0.6)
  width 20px
  line-height 44px
  position absolute
  color #ffffff
  font-size 16px
  top 100px
  z-index 9
  &.prev
    left 0
  &.next
    right 0
  &:hover
    background rgba(153,153,153,0.8)
</style>
