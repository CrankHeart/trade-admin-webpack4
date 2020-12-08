<template>
  <div class="infor-update-password">
    <el-form label-width="120px">
      <el-form-item label="账户名">
        <el-input v-model="user.userName" :disabled="true"></el-input>
      </el-form-item>

      <el-form-item label="原始密码" prop="passWord">
        <el-input v-model="form.passWord" type="password"></el-input>
      </el-form-item>

      <el-form-item label="重设密码" prop="newPassWord">
        <el-input v-model="form.newPassWord" type="password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="reNewPassWord">
        <el-input v-model="form.reNewPassWord" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import API from '../../../API'
import { encryptByDES, matchXSS } from '../../../utils/'
@Component( {
  name: 'info-update-password',
  components: {
  }
} )
export default class InfoUpDatePassWord extends Vue {
  @State( state => state.login.usr ) user
  @Mutation( 'login/logIn' ) logIn
  form = {
    passWord: '',
    newPassWord: '',
    reNewPassWord: ''
  }
  cancel () {
    this.$emit( 'tab-change', 'infoInfo' )
  }
  validate () {
    for ( let i in this.form ) {
      let item = this.form[ i ]
      if ( item.length < 6 || matchXSS( item ) ) {
        this.$notify( {
          type: 'error',
          message: '密码长度必须大于6 且不能为特殊字符'
        } )
        return false
      }
    }

    if ( this.form.reNewPassWord !== this.form.newPassWord ) {
      this.$notify( {
        type: 'error',
        message: '两次输入的密码不一致'
      } )
      return false
    }
    return true
  }
  submit () {
    if ( !this.validate() ) {
      return
    }
    let userName = this.user.userName
    let { passWord, newPassWord } = this.form
    this.$http( API.updatePass, {
      userName,
      newPassWord: encryptByDES( newPassWord ),
      passWord: encryptByDES( passWord )
    } ).then( () => {
      this.logIn( {} )
      window.location.reload()
    }, ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-form-item
  margin-bottom 22px
.el-input
  max-width 350px
</style>
<style lang="stylus"></style>


