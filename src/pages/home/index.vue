<template>
  <div id="index">
    <lc-header v-if="!justContent"></lc-header>
    <div id="container">
      <lc-nav-bar :height="height" v-if="!justContent"></lc-nav-bar>
      <main
        id="main"
        ref="main"
        :style="{ marginLeft: justContent ? 0 : mainMarginLeft,paddingTop: justContent ? '15px' : '70px' }"
      >
        <div class="container">
          <lc-bread-crumb v-if="!justContent"></lc-bread-crumb>
          <!-- 未知的问题导致促销创建在促销列表搜索时可能触发created -->
          <keep-alive
            :exclude="['promotion-create','promotion-detail','theme-event-create','theme-event-detail', 'order-detail','quote-detail', 'purchasing-plan-details', 'role','menu','permission']"
          >
            <router-view></router-view>
          </keep-alive>
        </div>
      </main>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'

import lcHeader from '../../components/header/index.vue'
import lcNavBar from '../../components/navbar/index.vue'
import lcBreadCrumb from '../../components/breadCrumb.vue'
import { State, Mutation } from 'vuex-class'
@Component( {
  name: 'index',
  components: {
    lcHeader,
    lcNavBar,
    lcBreadCrumb
  }
} )
export default class Index extends Vue {
  @State( 'clientHeight' ) clientHeight
  @State( 'mainMarginLeft' ) mainMarginLeft
  @State( 'clientType' ) clientType
  @Mutation( 'setMainMarginLeft' ) setMainMarginLeft
  @Mutation( 'setClientType' ) setClientType
  get height (): string {
    return this.clientHeight - 55 + 'px'
  }
  @Watch( '$route', { deep: true } )
  routeWatcher ( v, o ) {
    try {
      if ( v.fullPath !== o.fullPath ) {
        let $main = this.$refs[ 'main' ]
        this.$scrollTo( $main, 500, { offset: -110 } )
      }
    } catch ( e ) { }
  }
  get justContent () {
    return !!this.clientType
  }
  created () {
    let { path, query: { client } } = this.$route
    if ( path.indexOf( '/bmsQuote' ) > -1 || client == 'bms' ) {
      this.setClientType( 'bms' )
    }else if( client == 'blank' ){
      this.setClientType( 'blank' )
    }
  }
}
</script>
<style lang="stylus">
#main
  padding 0 15px 15px 20px
  box-sizing border-box
  overflow auto
  margin-left 180px
  transition all .5s
  z-index 10
</style>
