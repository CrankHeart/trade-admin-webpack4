<template>
  <div class="top-nav main">
    <img src="../assets/xianshitejia.png" alt="">
    <div class="nav-wrap">
      <ul :style="{width:wrapWidth,left:wrapLeft}">
        <li v-for="(floor,index) in floors" :key="`${floor.id}`" :class="{'is-active':index == floorIndex}" @click="$emit('scroll',index)">
          <p class="date">
            {{floor.begin}}-{{floor.end}}
          </p>
          <p class="desc">
            <span :class="`status status-${floor.status}`">
              {{floor.status===0?'未开始':floor.status===1?'进行中':'已结束'}}</span>
            <span class="pull-right" v-if="floor.status!==2">
              <i class="icon-clock"></i>
              距离{{floor.status ? '结束':'开始'}}
              {{floor.sepTime}}
            </span>
          </p>
        </li>
      </ul>
    </div>
    <template v-if="floors.length>4">
      <div class="prev" @click="slide(-1)"></div>
      <div class="next" @click="slide(1)"></div>
    </template>
  </div>
</template>
<script>
import { formatMyDate } from '@/utils'

export default {
  name: 'top-nav',
  props: {
    list: Array,
    floorIndex: Number
  },
  data() {
    return {
      floors: [],
      wrapIndex: 0
    }
  },
  computed: {
    wrapWidth() {
      return `${this.list.length * 288}px`
    },
    wrapLeft() {
      return `-${this.wrapIndex * 288}px`
    }
  },
  methods: {
    formatFloor( floor ) {
      let { beginTime, endTime, id } = floor
      beginTime = beginTime && beginTime.time
      endTime = endTime && endTime.time
      let formater = 'MM月dd日'
      let begin = formatMyDate( new Date( beginTime ), formater )
      let end = formatMyDate( new Date( endTime ), formater )
      let status // 0 未开始  1 进行中  2 已结束
      return {
        beginTime,
        endTime,
        begin,
        end,
        status,
        id,
        sepTime: 0,
        timer: null
      }
    },
    computedSepTime( timeStamp ) {
      let hours = Math.floor( timeStamp / ( 60 * 60 * 1000 ) )
      let leftTime = timeStamp % ( 60 * 60 * 1000 )
      let min = Math.floor( leftTime / ( 60 * 1000 ) )
      let sec = Math.floor( leftTime % ( 60 * 1000 ) / 1000 )
      hours = hours < 10 ? `0${hours}` : hours
      min = min < 10 ? `0${min}` : min
      sec = sec < 10 ? `0${sec}` : sec
      return [ hours, min, sec ].join( ':' )
    },
    intervalFloors() {
      let now = Date.now()
      this.floors.forEach( val => {
        let { beginTime, endTime } = val
        val.timer = setInterval( () => {
          if ( beginTime > now ) {
            val.status = 0
            val.sepTime = this.computedSepTime( beginTime - now )
          } else if ( endTime < now ) {
            val.status = 2
            val.sepTime = ''
            clearInterval( val.timer )
          } else {
            val.status = 1
            val.sepTime = this.computedSepTime( endTime - now )
          }
          now += 1000
        }, 1000 )

      } )

    },
    slide( sep ) {
      let next = this.wrapIndex + sep
      let len = this.list.length
      if ( next < 0 ) {
        next = 0
      } else if ( next > len - 4 ) {
        next = len - 4
      }
      this.wrapIndex = next
    }
  },
  created() {
    this.floors = this.list.map( this.formatFloor )
    this.intervalFloors()
  }
}
</script>
<style lang="stylus" scoped>
.top-nav
  margin 100px auto 25px
  position sticky
  top 0
  left 0
  z-index 99
img
  position absolute
  left 50%
  top -85px
  transform translateX(-50%)
.nav-wrap
  margin 0 4px
  height 56px
  overflow hidden
  background #F8E71C
  position relative
  // ul
  //   transition all .5s
  //   position absolute
  //   left 0px
  //   top 0
  li
    float left
    width 282px
    height 56px
    margin 0 3px
    padding 5px 22px
    box-sizing border-box
    background #F5A623
    color #333
    cursor pointer
    &.is-active
      background #333
      color #fff
      .icon-clock
        background url('../assets/icon-clock__white.svg') no-repeat
      .status
        color #333
    .icon-clock
      width 14px
      height 14px
      display inline-block
      position relative
      top -1px
      vertical-align middle
      background url('../assets/icon-clock__black.svg') no-repeat
    p
      &.date
        font-size 18px
        line-height 26px
      &.desc
        font-size 12px
        .status
          display inline-block
          height: 16px
          line-height 14px
          background rgba(248,231,28,1)
          transform scale(.7)
          border-radius 8px
          padding 2px 6px
          &.status-0
          &.status-2
            background rgba(51,51,51,1)
            color #fff
.prev
.next
  position absolute
  bottom 6px
  right 0
  width 20px
  height 44px
  background url('../assets/right-arrow.svg') center center no-repeat
  background-color rgba(153,153,153,0.6)
  cursor pointer
.prev
  left 0
  right auto
  transform rotateY(180deg)
</style>
