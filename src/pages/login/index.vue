
<template>
  <div id="login" class="flex middle v-middle" :style="{height:clientHeight+'px'}">
    <div class="login-box border-light">
      <h2 class="center">欢迎来到运营后台</h2>
      <div id="dingding-login" v-show="isDDLoginMethod">
      </div>
      <el-form label-width="60px" :model="form" v-show="!isDDLoginMethod">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" size="small" @keydown.enter.native="submit"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="passWord">
          <el-input v-model="form.passWord" type="password" size="small" @keydown.enter.native="submit"></el-input>
        </el-form-item>
        <el-form-item class="error">
          <span v-if="errorMessage">{{errorMessage}}</span>
        </el-form-item>
        <el-form-item label-width="0" class="center">
          <el-button type="primary" class="btn-primary" @click="submit" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-method-toggle"  >
        <p @click="ssoLogin">授权登录</p>
      </div>
      <!-- <div class="login-method-toggle" @click="isDDLoginMethod=!isDDLoginMethod">
        <p>切换登陆方式</p>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts">

import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import oidc from 'oidc-client'
import { injectScript, encryptByDES } from '../../utils/'
import { isLogined } from '@/pages/sso/sso.js'
import { dingdignAppId, dingdignAppSecret } from './const/index'

import API, { baseURL } from '../../API'

interface formData {
  userName: string
  passWord: string
}


@Component<Login>( {
  name: 'login'
} )
export default class Login extends Vue {
  isDDLoginMethod: boolean = false
  form: formData = {
    userName: '',
    passWord: ''
  }
  @State( state => state.login.loginIfor ) loginIfor

  @Action( 'login/logInAsync' ) logInAsync
  @Action( 'login/extendRouteByPermission' ) extendRouteByPermission
  @Action( 'message/messageManage' ) messageManage

  errorMessage: string = ''
  loading: boolean = false

  @State( 'clientHeight' ) clientHeight

  encryptByDES = encryptByDES

  created () {
    let hasPassed = isLogined()
    if ( hasPassed ) {
      this.$router.push( { path: "/home" } )
    }
  }

  submit () {
    // 设置登录类型为普通登录COMMON还是单点登录SSO
    this.loading = true
    let { userName, passWord } = this.form
    this.logInAsync( {
      userName: userName,
      passWord: this.encryptByDES( passWord ),
      loginType: '0'
    } ).then( res => {
      this.$router.push( { path: "/home" } )
      this.loading = false
      this.extendRouteByPermission().then( ( { data } ) => {
        this.messageManage( data )
      } ).catch( err => {
        console.log( err )
      } )
    }, ( { data } ) => {
      this.loading = false
      this.errorMessage = data.msg
    } ).catch( res => {
    } )
  }

  ssoLogin () {
    this.$router.replace( '/ssologin' )
  }
}
</script>
<style lang="stylus">
#login
  height 100%
  #dingding-login
    max-height 350px
  h2
    margin 1em 0
  .login-box
    width 350px
    padding 10px 50px
    border-radius 5px
    margin-top -30px
    position relative
    overflow hidden
  .el-form-item.error
    margin-top -10px
    height 36px
  .login-method-toggle
    position absolute
    right 0
    top 0
    width 140px
    height 140px
    background #38adff
    font-size 12px
    color #fff
    line-height 20px
    transform rotate(-135deg) translateY(100px)
    text-align center
    cursor pointer
    p
      transform rotate(-180deg) translateY(-10px)
</style>


