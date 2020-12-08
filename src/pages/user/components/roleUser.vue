<template>
  <div class="role-user">
    <div class="role-member-add">
      <el-select v-model="newUser" value-key="id" filterable clearable placeholder="请选择" size="small">
        <el-option v-for="user in filteredUser" :label="user.user.userName" :value="user.user" :key="user.user.id">
        </el-option>
      </el-select>
      <el-button icon="plus" type="primary" size="small" @click="addUser" v-if="$permissionValidate(674)">新增</el-button>
    </div>
    <hr>
    <template v-if="$permissionValidate(604)">
      <el-tag :key="user.userName" v-for="user in value" :closable="$permissionValidate(675)" :close-transition="false" @close="confirmDeleteUser(user)">
      {{user.userName}}
    </el-tag>
    </template>
   
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import API from '../../../API'
@Component( {
  name: 'role-user'
} )
export default class RoleUser extends Vue {
  @Prop() value: any[]
  @Prop() role: any
  @State( state => state.permission.userList ) userList
  @Action( 'permission/getUserList' ) getUserList
  created () {
    this.getUserList( { start: 0, num: 1000 } )
  }
  newUser: any = null
  get filteredUser () {
    let roleUserIds = this.value.map( val => val.id )
    return this.userList.filter( val => ( roleUserIds.indexOf( val.user.id ) < 0 ) )
  }
  addUser () {
    if ( !this.newUser ) return
    if ( this.value.filter( v => v.id == this.newUser.id ).length ) {
      return
    }

    this.$http( API.roleInsertUser, {
      roleId: this.role.id,
      userId: this.newUser.id,
      broadcast: true
    } ).then( ( { data } ) => {
      this.$emit( 'input', this.value.concat( this.newUser ) )
    } )
  }
  confirmDeleteUser ( user ) {
    this.$confirm( `此操作将删除用户【${user.userName}】的【${this.role.roleName}】角色身份, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.delUser( user )
    } )
  }
  delUser ( user: any ) {
    this.$http( API.roleDeleteUser, {
      roleId: this.role.id,
      userId: user.id,
      broadcast: true
    } ).then( ( { data } ) => {
      this.$emit( 'input', this.value.filter( v => v.id !== user.id ) )
    } )

  }
}
</script>
