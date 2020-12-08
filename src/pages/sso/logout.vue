<template>
<div class="logout">

</div>
</template>
<script>
import oidc from 'oidc-client'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  name: 'callback',
  data() {
    return {
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    goSso() {
      this.$router.push( '/ssologin' )
    }
  },
  created() {
      // 这里根据不同的loginType 跳转到
      let loginType = localStorage.getItem( 'loginType' )
      // if ( loginType != 'SSO' ) {
      //   this.$router.push( { path: '/helloworld' } )
      // } else {
      //   this.$router.push( { path: '/ssologin' } )
      // }
      // 跳转到账户中心 url有时效性,所以,暂时还是跳回到本地home
      this.$router.push( { path: '/home' } )
  }
}
</script>
<style lang="stylus" scoped>
.logout
  display:flex
  justify-content center
  align-items center
  position fixed
  width 100%
  height 100%
</style>

