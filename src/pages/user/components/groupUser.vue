<template>
  <div class="group-user box" v-if="$permissionValidate(609)">
    <template v-if="$permissionValidate(679)">
      <div class="group-user-add">
        <el-select v-model="newUser" value-key="id" filterable clearable placeholder="请选择" size="small">
          <el-option v-for="user in filteredUser" :label="user.user.userName" :value="user.user" :key="user.user.id">
          </el-option>
        </el-select>
        <el-button icon="plus" type="primary" size="small" @click="addUser">新增</el-button>
      </div>
      <hr>
    </template>
    <el-tag :key="user.userName" v-for="user in groupUserList" :closable="!$permissionValidate(680)" :close-transition="false" @close="confirmDeleteUser(user)">
      {{user.userName}}
    </el-tag>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import API from '../../../API'
@Component( {
  name: 'group-user'
} )
export default class GroupUser extends Vue {
  @State( state => state.permission.userList ) userList
  @Action( 'permission/getUserList' ) getUserList
  @Prop()
  group: any
  created () {
    this.getGroupUserList()
    this.getUserList( { start: 0, num: 1000 } )
  }
  @Watch( 'group' )
  groupWatcher () {
    this.getGroupUserList()
  }
  newUser: any = null
  groupUserList: any[] = []
  getGroupUserList () {
    this.$http( API.groupListUser, {
      id: this.group.id
    } ).then( ( { data } ) => {
      this.groupUserList = data.data
    } )
  }
  get filteredUser () {
    let groupUserIds = this.groupUserList.map( val => val.id )
    return this.userList.filter( val => ( groupUserIds.indexOf( val.user.id ) < 0 ) )
  }
  addUser () {
    if ( !this.newUser ) return
    if ( this.groupUserList.filter( v => v.id == this.newUser.id ).length ) {
      return
    }

    this.$http( API.groupInsertUser, {
      userId: this.newUser.id,
      groupId: this.group.id,
      broadcast: true
    } ).then( ( { data } ) => {
      this.groupUserList.push( this.newUser )
    } )
  }
  confirmDeleteUser ( user ) {
    this.$confirm( `此操作将会使用户【${user.userName}】从【${this.group.name}】组织中移除, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.delUser( user )
    } )
  }
  delUser ( user: any ) {
    this.$http( API.groupDeleteUser, {
      groupId: this.group.id,
      userId: user.id,
      broadcast: true
    } ).then( ( { data } ) => {
      this.groupUserList = this.groupUserList.filter( v => v.id !== user.id )
    } )
  }
}
</script>

