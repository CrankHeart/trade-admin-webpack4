<template>
  <div class="countdown">
    <slot></slot>
    <span v-html="timeStr"></span>
    <slot name="append" :time="time"></slot>
  </div>
</template>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component
export default class Countdown extends Vue {
  @Prop( { type: [ String, Number ] } )
  value
  @Prop()
  status: number
  @Prop()
  fill
  time = 0
  timer = null
  get timeStr () {
    if ( this.time <= 0 ) {
      return '--:--:--'
    } else {
      let d = Math.floor( this.time / ( 60 * 60 * 24 ) ) // 转换为天
      let sd = this.time % ( 60 * 60 * 24 ) // 除去天的毫秒数
      let h = Math.floor( sd / ( 60 * 60 ) ) // 除去天的毫秒数转换成小时
      let sh = this.time % ( 60 * 60 ) // 除去天、小时的毫秒数
      let m = Math.floor( sh / 60 ) // 除去天的毫秒数转换成分钟
      let s = Math.floor( this.time % 60 ) // 除去天、小时、分的毫秒数
      let arg = [ d, h, m, s ].map( v => ( v < 10 ? `0${v}` : `${v}` ) )
      return typeof this.fill == 'function' && this.fill( ...arg ) || this.fillTimeCount( ...arg )
    }
  }
  init ( timer = 1000 ) {
    clearTimeout( this.timer )
    this.timer = setTimeout( () => {
      this.time = ( this.value - Date.now() ) / 1000
      if ( this.time <= 0 ) {
        this.time = 0
        clearTimeout( this.timer )
      } else if ( Math.floor( this.time / ( 60 * 60 * 24 ) ) > 1 ) {
        let left = this.time % ( 60 * 24 )
        console.log( left, ( Math.floor( left % 60 ) || 60 ) )
        this.init( ( Math.floor( left % 60 ) || 60 ) * 1000 )
      } else {
        this.init( 1000 )
      }
    }, timer )
  }
  fillTimeCount ( ...arg ) {
    let hasDay = +arg[ 0 ] > 0
    let separator
    if ( hasDay ) {
      arg.pop()
      separator = [ '日', '时', '分' ]
    } else {
      arg.shift()
      separator = []
    }
    let className = separator.length ? 'sep' : ''
    let sep = hasDay ? '-' : ':'
    return arg.map( ( v, i ) => `${v}<span class="${className}">${separator[ i ] || ( i !== ( arg.length - 1 ) ? sep : '' )}</span>` ).join( '' )
  }
  created () {
    this.init()
  }
  beforeDestroy () {
    clearTimeout( this.timer )
  }
}
</script>
<style lang="stylus" >
.countdown
  .sep
    font-size 12px
    padding 0 3px
</style>
