<template>
  <div class="proportion-img" ref="proportionImg">
    <span class="img-item" v-for="(item, index) in not0Config" :key="index" :style='{color: item.color, backgroundColor: item.bgColor}'>{{item.content+item.number}}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
@Component( {
  name: 'proportion-img'
} )
export default class proportionImg extends Vue {
  @Prop( { default: () => [] } ) config: any[]
  $proportionImg: any = ''
  tWidth
  get totalNum () {
    let tNum = this.config.reduce( ( total, item ) => {
      return total + item.number
    }, 0 )
    return tNum
  }
  get not0Config () {
    return this.config.filter( item => item.required || item.number !== 0 ) || []
  }
}
</script>

<style lang='stylus' scoped>
.proportion-img
  display table
  .img-item
    color #fff
    width 100px
    height 38px
    display table-cell
    vertical-align middle
    line-height normal !important
    text-align center
    font-size 13px
    word-break break-word
</style>
