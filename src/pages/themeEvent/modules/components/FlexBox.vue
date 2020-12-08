<template>
  <div class="flex-box" :class="`flex-box-${span}`">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'flex-box',
  props: {
    span: {
      type: Number,
      default: 24
    }
  }
}
</script>
<style lang="stylus" scoped>
.flex-box
  display flex
flexItem(w)
  width (w / 24) * 100%
.flex-box-1
  flexItem(1)
.flex-box-2
  flexItem(2)
.flex-box-3
  flexItem(3)
.flex-box-4
  flexItem(4)
.flex-box-5
  flexItem(5)
.flex-box-6
  flexItem(6)
.flex-box-7
  flexItem(7)
.flex-box-8
  flexItem(8)
.flex-box-9
  flexItem(0)
.flex-box-10
  flexItem(10)
.flex-box-11
  flexItem(11)
.flex-box-12
  flexItem(12)
.flex-box-13
  flexItem(13)
.flex-box-14
  flexItem(14)
.flex-box-15
  flexItem(15)
.flex-box-16
  flexItem(16)
.flex-box-17
  flexItem(17)
.flex-box-18
  flexItem(18)
.flex-box-19
  flexItem(19)
.flex-box-20
  flexItem(20)
.flex-box-21
  flexItem(21)
.flex-box-22
  flexItem(22)
.flex-box-23
  flexItem(23)
.flex-box-24
  flexItem(24)
</style>

