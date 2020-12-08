<template>
  <div></div>
</template>
<script>
import oidc from 'oidc-client'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { isLogined, logoutPage } from '@/pages/sso/sso.js'
export default {
  name: 'logout',
  data() {
    return {
    }
  },
  computed: {
    ...mapState( {
      mgr: state => state.sso.mgr
    } ),
  },
  methods: {
    ...mapActions( {
      ssoLogin: 'sso/ssoLogin',
      logout: 'login/logout'
    } )
  },
  created() {
    let loginType = localStorage.getItem( 'loginType' )
    if ( loginType && loginType == 'COMMON' ) { // SSO
      // 判断是否已经登录,如果已经登录,调到home页面
      if ( isLogined() ) {
        this.$router.push( { path: '/home' } )
        return;
      }
    }
    this.ssoLogin().catch( err => {
      this.$message( {
        duration: 0,
        showClose: true,
        message: '该地址域名尚未授权登录,请联系账号中心管理员授权域名',
        type: 'error'
      } )
    } )
  }
}
</script>

