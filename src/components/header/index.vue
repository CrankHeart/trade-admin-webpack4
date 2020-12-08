<template>
  <header id="header" class="pramary-bg">
    <div class="logo pull-left">
      <img src="../../assets/images/logo.png" alt>
    </div>
    <div class="pull-right" v-if="!userName">
      <router-link to="/ssologin" tag="button" class="el-button el-button--text white">登录</router-link>
    </div>
    <el-dropdown class="pull-right" v-else>
      <span class="el-dropdown-link">
        <router-link
          to="#/user/info"
          tag="button"
          class="el-button el-button--text white"
        >{{userName}}</router-link>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="logoutOper">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <message-tip class="login-info pull-right" v-if="isPassed"></message-tip>

    <global-store-check class="pull-right" v-if="userName"></global-store-check>
    <h2>欢迎来到领健交易管理平台</h2>
  </header>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { Component } from 'vue-property-decorator'
import { State, Getter, Action, Mutation, namespace } from 'vuex-class'
import messageTip from '../messageTip.vue'
import GlobalStoreCheck from '../globalStoreCheck.vue'

@Component({
  components: {
    messageTip,
    GlobalStoreCheck
  }
})
export default class LcHeader extends Vue {

  @State(state => state.login.userName) userName

  @State(state => state.login.memberId) memberId

  @Getter('login/permissionList') permissionList
  get isPassed() {
    return this.$permissionValidate(419)
  }

  @Mutation('login/logIn') logIn

  @Action('login/logout') logout

  @Action('sso/ssoLogout') ssoLogout

  logoutOper() {
    // this.$router.push('/login')
    this.logout().then(() => {
      // 这里要执行sso logout逻辑
      let loginType = localStorage.getItem('loginType')
      if (loginType == 'SSO') {
        this.ssoLogout()
      } else {
        window.location.reload()
      }
    })
  }
}
</script>
<style lang="stylus" scoped>
#header
  line-height 40px
  padding 8px 12px
  height 56px
  overflow hidden
  position fixed
  left 0
  top 0
  width 100%
  box-sizing border-box
  z-index 999
  .logo
    img
      height 40px
      margin-right 10px
</style>

