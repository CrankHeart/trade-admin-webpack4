<template>
  <div class="manage-add">
    <el-form label-width="120px" :model="form" :rules="rules" ref="my-form">
      <el-form-item label="账户名" prop="affectedUserName" required>
        <el-input v-model="form.affectedUserName" placeholder="账户名不能为中文"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="emailAddress" required>
        <el-input v-model="form.emailAddress" placeholder="邮箱地址"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="affectedRealName" required>
        <el-input v-model="form.affectedRealName" placeholder="使用者姓名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="affectedPassword" required>
        <el-input
          v-model="form.affectedPassword"
          type="text"
          @focus="fixPassWordField"
          auto-complete="new-password"
          placeholder="密码长度至少为6位字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePassword" required>
        <el-input
          v-model="form.rePassword"
          type="text"
          @focus="fixPassWordField"
          auto-complete="new-password"
          placeholder="请再次输入密码"
        ></el-input>
      </el-form-item>

      <el-form-item label="经销商" prop="storeId" v-if="!storeId">
        <el-select v-model="form.storeId" value-key="id" filterable :disabled="storeId">
          <el-option
            v-for="store in storeList"
            :key="store.id"
            :value="store.id"
            :label="store.storeName"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="toList">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import API from '../../../API'
import { matchXSS } from '../../../utils/'
@Component( {
  name: 'manage-add',
  components: {
  }
} )
export default class ManageAdd extends Vue {
  @State( state => state.login.storeId ) storeId
  form: any = {}
  initForm () {
    this.form = {
      affectedUserName: '',
      affectedRealName: '',
      affectedPassword: '',
      rePassword: '',
      emailAddress: '',
      storeId: this.storeId
    }
  }
  rules = {
    affectedUserName: [
      { validator: this.validateUserName, trigger: 'blur,submit' }
    ],
    affectedRealName: [
      { validator: this.validateRealName, trigger: 'blur,submit' }
    ],
    affectedPassword: [
      { validator: this.validatePassWord, trigger: 'blur,submit' }
    ],
    rePassword: [
      { validator: this.validateRePassWord, trigger: 'blur,submit' }
    ],
    emailAddress: [
      { validator: this.validateEmailAddress, trigger: 'blur,submit' }
    ]
  }
  activated () {
    this.initForm()
    this.getStoreList()
  }
  storeList: any[] = []
  getStoreList () {
    if ( this.storeId ) {
      return
    }
    this.$http( API.listStore ).then( ( { data } ) => {
      this.storeList = data.data
    } )
  }
  validateUserName ( rule, value, cb ) { // 账户名验证
    value = value.trim()
    if ( value == '' ) {
      cb( new Error( '账户名不能为空' ) )
    }
    // if (!/^[0-9a-zA-Z]+$/.test(value)) {
    //   cb(new Error('账户名不能为中文及特殊字符'))
    // }
    // this.matchXSS(value, '账户名', cb)
  }
  // validatestoreId ( rule, value, cb ) {
  //   if ( !value ) {
  //     cb( new Error( '经销商不能为空' ) )
  //   }
  // }
  validateRealName ( rule, value, cb ) { // 用户名验证
    value = value.trim()
    if ( value == '' ) {
      cb( new Error( '用户名不能为空' ) )
    }
    // this.matchXSS( value, '用户名', cb )
  }
  validatePassWord ( rule, value, cb ) { // 密码验证
    value = value.trim()
    if ( value == '' ) {
      cb( new Error( '账户名不能为空' ) )
    }
    this.matchXSS( value, '密码', cb )
    if ( !/^[0-9a-zA-Z]{6,}$/g.test( value ) ) {
      cb( new Error( '密码不能含特殊字符，并且不能少于6位' ) )
    }
  }
  validateRePassWord ( rule, value, cb ) { // 二次密码验证
    if ( !value || value !== this.form.affectedPassword ) {
      cb( new Error( '两次密码不一致!' ) )
    }
  }
  validateEmailAddress ( rule, value, cb ) {
    if ( !/^[a-zA-Z0-9\._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test( value ) ) {
      cb( new Error( '请输入有效的邮箱地址' ) )
    }
  }
  fixPassWordField ( $event ) {
    $event.target.type = 'password'
    $event.target.autocomplete = 'off'
  }
  matchXSS ( str, type, cb ) {
    if ( matchXSS( str ) ) {
      cb( new Error( type + '不能输入特殊字符！' ) )
    }
  }
  toList () {
    this.$emit( 'tab-change', 'manageList' )
  }
  submitForm () {
    let myForm: any = this.$refs[ 'my-form' ]
    let isPassed = true
    myForm.fields.forEach( ( field, index ) => {
      field.validate( '', errors => {
        if ( errors ) {
          isPassed = false;
        }
      } );
    } )
    if ( isPassed ) {
      this.submit()
    }
  }
  submit () {
    this.$http( API.userAdd, { ...this.form, broadcast: true } ).then( ( { data } ) => {
      this.toList()
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-form-item
  margin-bottom 22px
.el-input, .el-select
  max-width 350px
.el-select
  width 100%
</style>
<style lang="stylus">
.manage-add
  .el-icon-loading
    display none
</style>


