<template>
  <div id="user-role">
    <lc-title text="角色管理"></lc-title>
    <el-row :gutter="20" type="flex">
      <el-col :span="10" :xs="24">
        <el-button type="primary" size="small" @click="addNew" v-if="$permissionValidate(601)">新建角色</el-button>
        <el-tabs value="">
          <el-tab-pane label="角色列表"></el-tab-pane>
        </el-tabs>
        <role-list :list="roleList" @select="selectRole" v-model="curRole" @delete="roleDelete"></role-list>
      </el-col>
      <el-col :span="14" :xs="24" v-show="curRole">
        <el-tabs v-model="tab" @tab-click="tabChange">
          <el-tab-pane label="编辑角色" name="permission">
            <role-permission :list="roleList" :role="curRole" @submit="roleSubmit" :parent-menu="curParentMenu" @parent-insert="parentInsert" @parent-delete="parentDelete" :parent-data="curParentData"></role-permission>
          </el-tab-pane>
          <el-tab-pane label="所属用户" name="user" v-if="$permissionValidate(604)">
            <role-user :role="curRole" v-model="roleUser"></role-user>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <div>
        <el-dialog title="新增角色" size="small" :show-close="true" :visible="roleDialagVisible" :before-close="closeRoleEdit"  class="role-dialog">
           <role-edit @close-dialog="closeRoleEdit" @submit="submitRole"></role-edit>
        </el-dialog>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import API from '../../API'
import { State, Action, Mutation } from 'vuex-class'
import roleList from './components/roleList.vue'
import rolePermission from './components/rolePermission.vue'
import roleUser from './components/roleUser.vue'
import roleEdit from './components/roleEdit.vue'
@Component( {
  name: 'role',
  components: {
    lcTitle,
    rolePermission,
    roleList,
    roleUser,
    roleEdit
  }
} )
export default class Role extends Vue {
  @State( state => state.permission.roleList ) roleList

  @Action( 'permission/getRoleList' ) getRoleList
  @Action( 'permission/roleInsert' ) roleInsert
  @Action( 'permission/roleUpdate' ) roleUpdate
  @Action( 'permission/roleDelete' ) roleDelete
  @Mutation( 'permission/setRoleList' ) setRoleList
  roleDialagVisible = false
  created () {
    if ( this.$permissionValidateWithNotify( 600 ) ) {
      this.getRoleList()
    }
  }
  tab: string = 'permission'
  tabChange ( { name } ) {
    this.tab = name
    this.selectRole( this.curRole )
  }
  addNew () {
    this.roleDialagVisible = true
    // this.$prompt( '请输入新角色名称', '提示', {
    //   confirmButtonText: '确定',
    //   cancelButtonText: '取消',
    //   inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
    //   inputErrorMessage: '新建角色名称不能为空'
    // } ).then( ( { value } ) => {
    //   this.roleInsert( { roleName: value } )
    // } ).catch( () => {

    // } )
  }
  cancelRoleEdit () {

  }
  submitRole ( data ) {
    this.roleInsert( data )
    this.roleDialagVisible = false
  }

  closeRoleEdit () {
    this.roleDialagVisible = false
  }

  curRole: any = null
  roleUser: any[] = []

  selectRole ( role ) {
    this.curRole = role
    if ( !this.curRole ) {
      return
    }
    if ( this.tab == 'permission' ) {
      this.getRolePermission( this.curRole ).then( ( [ rolePermissionMenu, rolePermissionData ] ) => {
        this.rolePermissionMenu = rolePermissionMenu
        this.rolePermissionData = rolePermissionData
        let { id } = this.curRole
        this.curParentMenu = this.rolePermissionMenu.reduce( ( total, prev ) => {
          let { roleId } = prev
          roleId = roleId == id ? 0 : roleId
          total[ roleId ] = total[ roleId ] || []
          total[ roleId ].push( prev )
          return total
        }, {} )
        this.curParentData = this.rolePermissionData.reduce( ( total, prev ) => {
          let { roleId } = prev
          roleId = roleId == id ? 0 : roleId
          total[ roleId ] = total[ roleId ] || []
          total[ roleId ].push( prev )
          return total
        }, {} )
      } )
    } else {
      this.getRoleUser( this.curRole )
    }

  }
  getRoleUser ( role ) {
    return this.$http( API.roleListUser, { id: role.id } ).then( ( { data } ) => {
      this.roleUser = data.data
    } )
  }
  roleSubmit ( item ) {
    if ( !item ) {
      this.curRole = item
      return
    } else {
      this.roleUpdate( {
        role: item,
        curRole: this.curRole
      } )
    }
  }
  rolePermissionMenu: any[] = []
  rolePermissionData: any[] = []
  curParentMenu: any = {}
  curParentData: any = {}
  parentInsert ( item ) {
    if ( parseInt( item.parentIds ) ) {
      return this.$notify( {
        type: 'error',
        message: '父级节点选择错误'
      } )
    }
    this.getRolePermission( item ).then( ( [ permissionMenu, permessionData ] ) => {
      this.parentDelete( 0 )
      this.$set( this.curParentMenu, item.id, permissionMenu )
      this.$set( this.curParentData, item.id, permessionData )
    } )
  }
  parentDelete ( parentId ) {
    let curParentMenu = Object.assign( {}, this.curParentMenu )
    delete curParentMenu[ parentId ]
    this.curParentMenu = curParentMenu

    let curParentData = Object.assign( {}, this.curParentData )
    delete curParentData[ parentId ]
    this.curParentData = curParentData
  }
  getRolePermission ( role ) {
    return Promise.all( [ this.getRolePermissionMenu( role ), this.getRolePermissionData( role ) ] ).then( ( [ permissionMenu, permissionData ] ) => {
      try {
        let rolePermissionMenu = permissionMenu.data.data
        let rolePermissionData = permissionData.data.data
        let roleId = parseInt( role.parentIds )
        if ( roleId ) {
          if ( !rolePermissionMenu.length ) {
            rolePermissionMenu = [ { roleId } ]
          }
          if ( !rolePermissionData.length ) {
            rolePermissionData = [ { roleId } ]
          }
        }
        return [ rolePermissionMenu, rolePermissionData ]
      } catch ( e ) {
        return []
      }
    } )
  }

  getRolePermissionMenu ( item ) {
    let { id, parentIds } = item
    return this.$http( API.rolePermissionMenu, {
      id,
      parentIds
    } )
  }
  getRolePermissionData ( item ) {
    let { id, parentIds } = item
    return this.$http( API.rolePermissionList, {
      id,
      parentIds
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-col
  display flex
  flex-direction column
  position relative
  .el-tabs
    flex-shrink 1
  .box
    flex-grow 1
  .el-button
    position absolute
    right 0
    top 0
    z-index 999
</style>
<style lang="stylus" >
#user-role
  h3
    margin-bottom 30px

</style>
