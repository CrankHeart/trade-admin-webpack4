<template>
  <div class="role-permission box">
    <el-form label-width="90px">
      <el-form-item label="角色名称">
        <el-input v-model="myRole.roleName" size="small" :disabled="!$permissionValidate(676)" />
      </el-form-item>

       <el-form-item label="角色编码">
           <el-input v-model="myRole.roleCode" size="small" :disabled="true" />
      </el-form-item>

      <el-form-item label="角色类型">
        <el-select v-model="myRole.roleType" size="small">
          <el-option v-for="item in listRoleType" :label="item.typeName" :value="item.typeCode" :key="item.typeCode"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联角色">
        <template v-for="(item,key) in parentMenu" >
          <el-tag :key="key" v-if="!!(name=converParent(key))" :closable="$permissionValidate(603)" @close="closeParent(key)" >
            <template v-if="!!+key">{{name}}</template>
          </el-tag>
        </template>
        
        <el-autocomplete v-model="parentName" :disabled="!$permissionValidate(603)" :fetch-suggestions="querySearch" placeholder="请输入内容" @select="handleSelect" size="small" :props="{value:'roleName',label:'roleName'}">
        </el-autocomplete>
      </el-form-item>
      <el-form-item label="权限详情">
        <el-tabs v-model="tab">
          <el-tab-pane label="菜单权限" name="menu"></el-tab-pane>
          <el-tab-pane label="数据权限" name="data"></el-tab-pane>
        </el-tabs>
        <role-permission-menu v-if="tab == 'menu'" :disabled="!$permissionValidate(603) || hasParent" :key="permissionMenuKey" v-model="permissionMenu" :tree="getterPermissionMenu"></role-permission-menu>

        <role-permission-data v-if="tab == 'data'" :disabled="!$permissionValidate(603)" v-model="permissionData" :key="permissionDataKey"></role-permission-data>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button type="text" @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, State } from 'vuex-class'
import rolePermissionMenu from './rolePermissionMenu.vue'
import rolePermissionData from './rolePermissionData.vue'
@Component( {
  name: 'role-permission',
  components: {
    rolePermissionMenu,
    rolePermissionData
  }
} )
export default class RolePermission extends Vue {
  @State( state => state.permission.permissionMenu ) permissionMenuList
  @Getter( 'permission/getterPermissionMenu' ) getterPermissionMenu
  @Action( 'permission/getPermissionMenu' ) getPermissionMenu

  @State( state => state.permission.listRoleType ) listRoleType
  @Action( 'permission/getListRoleType' ) getListRoleType

  @State( state => state.permission.permissionData ) permissionDataList
  @Action( 'permission/getPermissionData' ) getPermissionData

  @Prop( { default: () => ( {} ) } )
  role: any
  myRole: any = {}
  tab: string = 'menu'
  @Watch( 'role' )
  roleWatcher () {
    this.myRole = Object.assign( {}, this.role || {} )
  }
  get permissionMenuObj () {
    return this.permissionMenuList.reduce( ( total, prev ) => {
      let { id, permissionId } = prev
      total[ id ] = permissionId
      return total
    }, {} )
  }
  @Prop()
  list: any[]

  permissionMenu: any = {}
  permissionData: any = {}
  parentName: string = ''
  @Prop()
  parentMenu: any
  @Watch( 'parentMenu', { deep: true } )
  parentWatcher ( val ) {
    this.permissionMenu = Object.keys( val ).reduce( ( total, prev ) => {
      let arr = val[ prev ]
      return arr.reduce( ( t, pre ) => {
        let { id } = pre
        total[ id ] = true
        return total
      }, {} )
    }, {} )

    this.permissionMenuKey = Object.keys( this.permissionMenu ).join( ':' )

  }
  permissionMenuKey: string = ''

  @Prop()
  parentData: any
  @Watch( 'parentData', { deep: true } )
  curParentDataWatcher ( val ) {
    this.permissionData = Object.keys( val ).reduce( ( total, prev ) => {
      let arr = val[ prev ]
      return arr.reduce( ( t, pre ) => {
        let { id } = pre
        if ( id !== undefined ) {
          total[ id ] = true
        }
        return total
      }, {} )
    }, {} )
    this.permissionDataKey = Object.keys( this.permissionData ).join( ':' )
  }
  permissionDataKey: string = ''

  get hasParent () {
    let keys = Object.keys( this.parentMenu )
    return !!keys.filter( key => !!+key ).length
  }
  closeParent ( parentId ) {
    this.$emit( 'parent-delete', parentId )
  }

  querySearch ( str, cb ) {
    let { id, parentIds } = this.myRole
    if ( !id ) return
    let arr = this.list.filter( v => !parseInt( v.parentIds ) && v.id != id && v.roleName.indexOf( str ) > -1 )
    parentIds.split( ':' ).forEach( v => {
      arr = arr.filter( val => val.id != v )
    } )
    // arr = arr.filter(v=>v.id)
    cb( arr )
  }
  handleSelect ( item ) {
    this.parentName = ''
    this.$emit( 'parent-insert', item )
  }
  validate () {
    let { roleName } = this.myRole

    return true
  }
  confirm () {
    if ( !this.role || !this.validate() ) return
    let { roleName, id, roleType } = this.myRole

    let myMenuIds = Object.keys( this.permissionMenu ).filter( v => this.permissionMenu[ v ] ).map( v => this.permissionMenuObj[ v ] ).join( ':' )
    roleName = roleName == this.role.roleName ? undefined : roleName

    let parentIds = this.parentMenu && Object.keys( this.parentMenu ).filter( v => v != id ).join( ':' ) || 0
    myMenuIds = !parseInt( `${parentIds}` ) && myMenuIds || undefined
    let permissionIds = Object.keys( this.permissionData ).filter( v => this.permissionData[ v ] ).join( ':' )
    this.$emit( 'submit', {
      id,
      roleName,
      parentIds,
      menuIds: myMenuIds,
      permissionIds,
      roleType
    } )
  }
  cancel () {
    this.$emit( 'submit', null )
  }
  converParent ( value ) {
    let o = this.list.filter( v => v.id == value )[ 0 ] || {}
    return o.roleName
  }
  created () {
    this.getPermissionMenu()
    this.getListRoleType()
  }
}
</script>

