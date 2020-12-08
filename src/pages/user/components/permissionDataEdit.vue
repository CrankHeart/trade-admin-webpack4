<template>
  <div class="permission-data-edit box">
    <h3>{{!isEdit?'新增':'编辑'}}数据权限</h3>
    <el-form label-width="80px">
      <el-form-item label="权限名称">
        <el-input v-model.trim="myPermission.permissionName" />
      </el-form-item>
      <el-form-item label="数据接口">
        <el-input v-model.trim="myPermission.permissionValue" />
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" @click="confirm">确认</el-button>
        <el-button type="text" @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
@Component( {
  name: 'permission-data-edit'
} )
export default class PermissionDataEdit extends Vue {
  @Prop()
  value: any
  myPermission: any = {}
  @Watch( 'value' )
  permissionWatcher ( v ) {
    this.myPermission = Object.assign( {
      permissionName: '',
      permissionValue: ''
    }, v )
  }
  get isEdit () {
    return this.myPermission && this.myPermission.id
  }
  confirm () {
    if ( !this.validate() ) {
      return
    }
    this.$emit( 'submit', this.myPermission )
  }
  validate () {
    let { permissionName = '', permissionValue = '' } = this.myPermission
    permissionName = permissionName.replace( /\s/g, '' )
    permissionValue = permissionValue.replace( /\s/g, '' )
    if ( !permissionName || !permissionValue ) {
      this.$notify( {
        type: 'error',
        message: '请确保数据输入正确'
      } )
      return false
    }
    Object.assign( this.myPermission, { permissionName, permissionValue } )
    return true
  }
  cancel () {
    this.$emit( 'edit' )
  }
}
</script>
<style lang="stylus" scoped>
h3
  margin-bottom 30px
</style>
