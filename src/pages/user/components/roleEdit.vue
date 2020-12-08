<template>
  <div class="permission-data-edit box">
    <el-form label-width="80px">
      <el-form-item label="角色名称">
        <el-input v-model.trim="myData.roleName" />
      </el-form-item>
      <el-form-item label="角色标识">
        <el-input v-model.trim="myData.roleCode" />
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="confirm">确认</el-button>
        <el-button type="text" @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
@Component( {
  name: 'role-edit'
} )
export default class RoleEdit extends Vue {
  myData: any = {}

  confirm () {
    if ( !this.validate() ) {
      return
    }
    this.$emit( 'submit', this.myData )
    this.myData = Object.assign( {}, { roleName: '', roleCode: '' } )
  }
  validate () {
    let { roleName = '', roleCode = '' } = this.myData
    roleName = roleName.replace( /\s/g, '' )
    roleCode = roleCode.replace( /\s/g, '' )
    if ( !roleName || !roleCode ) {
      this.$notify( {
        type: 'error',
        message: '请确保数据输入正确'
      } )
      return false
    }
    Object.assign( this.myData, { roleName, roleCode } )
    return true
  }
  cancel () {
    this.$emit( 'close-dialog' )
    this.myData = Object.assign( {}, { roleCode: '', roleCode: '' } )
  }
}
</script>
<style lang="stylus" scoped>
h3
  margin-bottom 30px
</style>
