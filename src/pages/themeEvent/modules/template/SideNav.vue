<template>
  <div :class="`side-nav type-${type}`">
    <h4 @click="exExpand = !exExpand">主题活动 <i class="icon-arrow-down"></i></h4>
    <ul :style="ulStyle">
      <li v-for="(item,index) in list" :key="item.id" @click="$emit('scroll',index)" :class="{'is-active':index == floorIndex}">
        {{item.floorName}}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'side-nav',
  props: {
    list: Array,
    floorIndex: Number,
    type: Number
  },
  data() {
    return {
      exExpand: true
    }
  },
  computed: {
    ulHeight() {
      return this.list.length * 36
    },
    ulStyle() {
      return {
        height: `${this.exExpand ? this.ulHeight : 0}px`
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.side-nav
  min-width 140px
  position fixed
  right 40px
  bottom 3px
  background rgba(255,255,255,1)
  box-shadow 0px 0px 3px 0px rgba(187,187,187,1)
  z-index 99
  text-align center
  &.type-4
    h4
      background linear-gradient(337deg,rgba(0,166,201,1) 0%,rgba(43,222,218,1) 100%)
  &.type-5
    h4
      background linear-gradient(142deg,rgba(103,216,239,1) 0%,rgba(112,94,244,1) 45%,rgba(42,21,216,1) 100%)
  &.type-6
    h4
      background linear-gradient(155deg,rgba(250,125,132,1) 0%,rgba(185,19,213,1) 100%)
  h4
    line-height 36px
    height 36px
    color #ffffff
    font-size 14px
    font-weight normal
    cursor pointer
  .icon-arrow-down
    display inline-block
    width 14px
    height 14px
    position relative
    top 7px
    background url('../assets/right-arrow.svg') no-repeat
    transform rotate(90deg)
  ul
    transition all .5s
  li
    margin 0 4px
    line-height 36px
    height 36px
    color rgba(102,102,102,1)
    border-bottom 1px solid rgba(232,232,232,1)
    cursor pointer
    &:last-child
      border-bottom none
    &.is-active
      color rgba(0,168,203,1)
</style>

