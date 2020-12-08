<template>
  <div class="group-role box">
    <el-form label-width="80px">
      <el-form-item label="组织名称">
        <el-input v-model="groupName" :disabled="!$permissionValidate(683)"></el-input>
      </el-form-item>
      <el-form-item label="包含角色">
        <div class="box">
          <el-checkbox-group v-model="groupRoles" :disabled="!$permissionValidate(608)">
            <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">{{role.roleName}}-{{role.id}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="submitGroup">确定</el-button>
        <el-button type="text" @click="cancelGroup">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
@Component( {
  name: 'group-role'
} )
export default class GroupRole extends Vue {
  @State( state => state.permission.roleList ) roleList
  @Action( 'permission/getRoleList' ) getRoleList
  @Prop()
  group: any
  groupName: string = ''
  groupRoles: any[] = []
  initData () {
    let { name, roleIds } = this.group
    this.groupName = name
    this.groupRoles = roleIds.split( ':' ).map( v => +v ).filter(v=>v)
  }
  @Watch('group')
  groupWatcher(){
    this.initData()
  }
  created () {
    this.initData()
    this.getRoleList()
  }
  submitGroup () {
    this.$emit( 'submit', {
      ...this.group,
      name: this.groupName,
      roleIds: this.groupRoles.join( ':' )
    } )
  }
  cancelGroup () {
    this.$emit( 'cancel' )
  }
}
</script>
<style lang="stylus" scoped>
.el-checkbox
  display block
  margin-left 15px
</style>

