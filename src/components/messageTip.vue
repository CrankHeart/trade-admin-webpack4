<template>
  <div id="message-tip">
    <el-popover ref="popover" placement="bottom" width="400" trigger="click" title="收到通知" popper-class="message-tip" v-if="href.indexOf('print')<0">
      <div v-for="item in msgTotalArr" :key="item.key" @click="linkTo(item.path)">
        <h4>{{item.key}}</h4>
        <p>
          <el-icon name="warning"></el-icon>{{item.msg}}
        </p>
      </div>
    </el-popover>
    <el-badge :is-dot="!!msgTotalArr.length" class="item">
      <el-button class="iconfont icon-messagenoti" type="text" v-popover:popover v-show="msgTotalArr.length"></el-button>
      <el-button class="iconfont icon-messagenoti" type="text" v-show="!msgTotalArr.length"></el-button>
    </el-badge>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { Component, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component( {
  name: 'messageTip'
} )
export default class LcHeader extends Vue {

  isInited = false
  get popover () {
    return this.$refs[ 'popover' ]
  }
  @Getter( 'message/msgTotalArr' ) msgTotalArr

  linkTo ( path ) {
    try {
      this.popover[ 'doToggle' ]()
      if ( path ) {
        this.$router.push( path )
      }
    } catch ( e ) {

    }
  }
  @Watch( 'msgTotalArr' )
  msgTotalArrWatcher( v ) {
    this.initToggle()
  }
  href:any = ''
  mounted() {
    this.href = window.location.href
    this.initToggle()
  }
  initToggle () {
    this.$nextTick( () => {
      try {
        if ( this.msgTotalArr.length && !this.isInited ) {
          this.popover[ 'doToggle' ]()
          this.isInited = true
        }
      } catch ( e ) {

      }
    } )
  }
}
</script>
<style lang="stylus" scoped>
#message-tip
  .el-badge
    line-height 15px
    margin-right 30px
  .el-button--text
    padding 0
    color #fff
  .iconfont
    font-size 24px!important
.message-tip
  i
    height 25px
    width 25px
    text-align center
    line-height 25px
  h4
    padding 10px 12px
    border-radius 8px
    background #8492a6
    color #ffffff
    font-size 14px
  p
    cursor pointer
  // .el-table--fit
  //   margin-top 10px
  //   border 0
  //   font-size 14px
  // .el-table
  //   th
  //     border-radius 8px
</style>
<style lang="stylus">
  .message-tip
    .el-popover__title
      height 40px
      line-height 40px
      width 100%
      background-color #20a0ff
      color #fff
      padding-left 20px
      box-sizing border-box
      border-radius 4px
      font-size 16px
      & ~ div:not([class])
        margin-top 10px
</style>



