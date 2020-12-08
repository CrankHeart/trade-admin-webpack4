<template>
  <nav id="navbar" :style="{ height: height }">
    <div class="navbar" :class="{'is-fold':isFold}">
      <p class="center" @click="foldNav">
        <i class="iconfont icon-mulu"></i>
      </p>
      <ul>
        <li
          v-for="nav in navs"
          :key="nav.name"
          @click="select(nav)"
          :title="nav.name"
          :class="{'is-active': nav==curNav }"
        >
          <i :class="'iconfont icon-'+nav.icon"></i>
          {{nav.name}}
        </li>
      </ul>
    </div>
    <div class="sub-nav" :class="{'is-sub-fold':isSubFold}">
      <i class="iconfont icon-muluzhankai" @click="foldSub"></i>
      <p>{{curNav.name}}</p>
      <ul>
        <router-link
          :to="{path:sub.path}"
          tag="li"
          v-for="sub in curNav.children"
          :key="sub.name"
          :class="{'is-active':sub.name==$route.name}"
          v-if="sub.path!=='/helper/server'|| isCustomServer&&sub.path=='/helper/server'"
        >{{sub.name}}</router-link>
      </ul>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { availableNav } from '../../router/availableRouter'
import { State, Mutation } from 'vuex-class'
@Component( {
  name: 'navbar'
} )
export default class Navbar extends Vue {

  @Mutation( 'setMainMarginLeft' ) setMainMarginLeft
  navs = availableNav
  curNav: any = {}
  isFold = true
  isSubFold = false
  @State( state => state.login.isCustomServer )
  isCustomServer
  @Prop() height: string
  @Watch( '$route', { deep: true } )
  routerWatcher ( v, o ) {
    if ( v.path == o.path ) return
    if ( v.meta && v.meta.isDetail ) {
      sessionStorage.setItem( 'detailNav', JSON.stringify( this.curNav ) )
    }
    this.resetActiveNav( v.name )
  }

  foldNav () {
    this.isFold = !this.isFold
    this.fold()
  }
  foldSub () {
    this.isSubFold = !this.isSubFold
    this.fold()
  }
  fold () {
    let i = ( this.isFold ? 1 : 3 ) * 50 + ( this.isSubFold ? 0 : 4 ) * 30
    // this.$emit('fold', i)
    this.setMainMarginLeft( i + 'px' )
  }
  // 根据路由设置当前选中nav
  resetActiveNav ( pathName ) {

    outer: for ( let i = 0, navs = this.navs, l = navs.length; i < l; i++ ) {
      let children = navs[ i ].children

      for ( let m = 0, n = children.length; m < n; m++ ) {
        let nav = children[ m ]
        if ( nav.name == pathName ) {
          this.curNav = navs[ i ]
          break outer
        }
      }
    }
    if ( !Object.keys( this.curNav ).length ) {
      let session = sessionStorage.getItem( 'detailNav' ) || ''
      if ( session ) {
        this.curNav = JSON.parse( session )
      } else {
        this.curNav = availableNav[ 0 ] || {}
      }
    }
  }
  created () {
    this.fold()
    let routeWatcher = this.$watch( 'navs', ( newValue ) => {
      this.initActiveNav()
      routeWatcher()
    } )

    this.initActiveNav()
  }
  initActiveNav () {
    let pathName = this.$route.name
    this.resetActiveNav( pathName )
  }
  select ( nav ) {
    this.curNav = nav
    this.isFold = false
    this.isSubFold = false
    this.fold()

    let subNav = ( nav.children || [] ).filter( v => v.isHome )[ 0 ]
    if ( subNav ) {
      this.$router.push( subNav.path )
    } else {
      let child = nav.children && nav.children[ 0 ] || {}
      this.$router.push( child.path )
    }
  }
}
</script>
<style lang="stylus" scoped>
#navbar 
  display flex
  height 100%
  line-height 40px
  position fixed
  left 0
  top 56px
  z-index 9
  li 
    padding 0 15px
    cursor pointer
    height 40px
    overflow hidden
  .navbar 
    width 150px
    background #333
    color #fff
    transition all 0.3s
    overflow auto
    &.is-fold 
      width 50px
      .icon-mulu 
        transform rotate(0)
    li 
      border-top 0.5px solid rgba(34, 34, 51,.3)
      border-bottom 0.5px solid rgba(68, 68, 68,.3)
      
      .iconfont 
        margin-right 10px
      &:hover, &.is-active
        background #20a0ff
    p 
      background #222329
      line-height 36px
      height 36px
      cursor pointer
      position relative
    .icon-mulu 
      transform rotate(90deg)
      position absolute
      left 50%
      margin-left -10px
  .sub-nav 
    width 120px
    background #D9DEE4
    position relative
    transition all 0.3s
    &.is-sub-fold 
      width 0
      .icon-muluzhankai 
        right -20px
        transform rotate(0)
      li 
        padding 0
    li 
      padding 0 15px
      cursor pointer
      font-size 12px
      &.is-active, &:hover 
        background #efefef
    p 
      font-size 20px
      text-align center
      font-weight bold
      line-height 70px
      height 70px
      overflow hidden
      border-bottom 1px solid rgba(0, 0, 0, 0.1)
      margin-bottom 10px
    .icon-muluzhankai 
      position absolute
      top 49%
      right 0
      padding 10px 3px
      transform rotate(180deg)
      cursor pointer
      z-index 99999
      &:hover 
        font-weight bold
</style>

