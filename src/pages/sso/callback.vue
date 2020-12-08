<template>
  <div></div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  name: 'callback',
  data() {
    return {
      errorMessage: ''
    }
  },
  methods: {
    ...mapActions( {
      logInSso: 'login/logInSso',
      ssoCallback: 'sso/ssoCallback',
      logout: 'login/logout',
      ssoLogout: 'sso/ssoLogout'
    } ),
    loginout( err ) {
      this.errorMessage = err
      this.$message( {
        message: err,
        type: 'error'
      } )
      setTimeout( () => {
        this.ssoLogout()
      }, 5000 )
    }
  },
  created() {
    this.ssoCallback().then( user => {
      this.logInSso( {
        token: user.access_token
      } ).then( () => {
        this.$root.$emit( 'bindTokenEvent' )
        // 使用后销毁上次的路径
        let loginReturn = sessionStorage.getItem('loginReturn')
        if(!loginReturn|| loginReturn==''){
          loginReturn = '/home'
        }
        sessionStorage.setItem('loginReturn','')
        this.$router.replace( { path: loginReturn } )
      } ).catch( ( { data } ) => {
        this.loginout( data.msg || '账号内部授权异常' )
      } )
    } ).catch( err => {
      this.loginout( err.toString() )
    } )
  }
}
</script>
<style lang="stylus" scoped>

</style>

