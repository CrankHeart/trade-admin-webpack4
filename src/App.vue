<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { isLogined, logoutPage } from '@/pages/sso/sso.js'
export default {
  name: 'App',
  computed: {
    ...mapState( {
      loginIfor: state => state.login.loginIfor,
      mgr: state => state.sso.mgr
    } ),
  },
  methods: {
    ...mapActions( {
      extendRouteByPermission: 'login/extendRouteByPermission',
      messageManage: 'message/messageManage',
      logout: 'login/logout',
      ssoLogout: 'sso/ssoLogout'
    } ),
    ...mapMutations( {
      fitClient: 'fitClient',
      logIn: 'login/logIn',
      freshToken: 'login/freshToken'
    } ),
    addEvents() {
      const initOidcManager = this.mgr
      initOidcManager.events.addUserLoaded( user => {
        // 刷新token,自动续期
        // 当slient掉完更新localStorage之后,触发
        this.freshToken( user.access_token )
      } )

      initOidcManager.events.addUserSignedOut( function () {
        window.localStorage.setItem( 'isLogin', 'false' )
      } )
    },
    userLogined() {
      // 如果是slice路由 续期回调,不需要再调用菜单注入
      if ( this.isFromSilce() ) {
        return
      }
      if ( !this.loginIfor.token ) {
        // 授权错误或者token失效,登出账号
        this.showMsgAndLogout( 'token不存在' )
        return
      }
      // 如果是silent续期,这里也不做任何操作
      this.logIn( this.loginIfor )
      this.extendRouteByPermission().then( ( { data = [] } ) => {
        this.messageManage( data )
      } ).catch( err => {
        // 权限写入错误,登出账号
        this.showMsgAndLogout( err.data.msg )
      } )
    },
    showMsgAndLogout( msg ) {
      this.$message( {
        message: msg,
        type: 'error'
      } )
      setTimeout( () => {
        this.logout().then( () => {
          this.$router.push( logoutPage )
        } )
      }, 5000 );
    },
    userTokenEvent() {
      // COMMON 登录模式,不需要监听
      let loginType = localStorage.getItem( 'loginType' )
      if ( loginType != 'SSO' ) {
        return false;
      }
      this.mgr.getUser().then( user => {
        if ( user ) {
          this.addEvents()
        }
      } ).catch( err => {
        this.showMsgAndLogout( err.data.msg )
      } )
    },
    isFromSilce() {
      // 如果是slice 续期回调,不需要再调用菜单注入
      // http://localhost:6061/#/silent?code=xxxx
      let url = window.location.href
      // return url.indexOf( '/#/silent' ) == -1 ? false : true;
      return url.indexOf( '/#/silent' ) !== -1;
    }
  },
  created() {
    this.fitClient()
    this.$root.$on( 'bindTokenEvent', () => {
      this.userTokenEvent()
    } )
    let hasPassed = isLogined()
    if ( hasPassed ) {
      this.userLogined()
      this.userTokenEvent()
    }
  }
}
</script>
<style lang='stylus'>
body
  overflow-x hidden
</style>
