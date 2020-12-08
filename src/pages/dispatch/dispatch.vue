<template>
  <div id="dispatch"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { injectScript } from '../../utils'

@Component( {
  name: 'dispatch'
} )
export default class DispatchTack extends Vue {
  @State( state => state.login.token ) token
  @State( state => state.login.userName ) userName
  @State( state => state.login.userType ) userType

  dispatchItem:string = ''
  createIframe() {
    let dcs = new DcsFrame( {
      containerId: 'dispatch', // 插入iframe的外层div id
      token: this.token,
      roleType: this.userType == 1 ? 1 : 0, // 用户类型: 管理员1, 商家0
      userId: this.userName, // 用户为管理员时传管理员用户名，用户为商家时传商家编号
      dcsOrigin: 'https://dcs.lctest.cn:84', // 调度中心base url
      entry: this.dispatchItem // 入口
    } )
  }
  initData(){
    this.dispatchItem = this.$route.path.slice( this.$route.path.lastIndexOf('/')+1 )
    const dispatchTask = document.getElementById( 'dispatch' )
    const deviceWidth = document.documentElement.clientWidth
    const deviceHeight = document.documentElement.clientHeight
    dispatchTask.style.width = deviceWidth - 270 + 'px'
    dispatchTask.style.height = deviceHeight - 56 + 'px'
    this.createIframe()
  }
  @Watch( '$route', { deep: true } )
  routeWatcher( v ){
    const dispatchTask = document.getElementById( 'dispatch' )
    if ( v.path.indexOf( 'dispatch' )<0) return
    dispatchTask.removeChild( dispatchTask.childNodes[0] )
    this.initData()
  }
  activated() {
    injectScript( 'https://dcs.lctest.cn:84/plugins/plugin.js' ).then( res=>{
      this.initData()
    } )
  }
}
</script>
<style lang="stylus" scoped>
#dispatch
  width 100%
  height 100%
  position relative
</style>
