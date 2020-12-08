<template>
  <el-row :gutter="30" class="permission-data">
    <el-col :span="12">
      <permission-data-list @edit="editItem" v-model="curPermission" :list="permissionDataList" @delete="deleteItem"></permission-data-list>
    </el-col>
    <el-col :span="12">
      <permission-data-edit @edit="editItem" v-model="curPermission" @submit="submitItem"></permission-data-edit>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Action, Mutation } from 'vuex-class'
import permissionDataList from './permissionDataList.vue'
import permissionDataEdit from './permissionDataEdit.vue'
import API from '../../../API'
@Component( {
  name: 'permission-data',
  components: {
    permissionDataList,
    permissionDataEdit
  }
} )
export default class PermissionData extends Vue {
  @State( state => state.permission.permissionData ) permissionDataList
  @Mutation( 'permission/setPermissionData' ) setPermissionDataList
  @Action( 'permission/getPermissionData' ) getPermissionDataList
  // permissionDataList: any[] = []
  created(){
    if(this.$permissionValidateWithNotify(615)){
      this.getPermissionDataList()
    }
  }

  editItem ( item = null ) {
    this.curPermission = item
  }
  submitItem ( item ) {
    if ( !this.validate( item ) ) {
      return
    }
    if ( item.id ) {
      this.updateItem( item )
    } else {
      this.addItem( item )
    }
  }
  validate ( item ) {
    for ( let i = 0, l = this.permissionDataList.length; i < l; i++ ) {
      let { permissionName, permissionValue } = this.permissionDataList[ i ]
      if ( permissionName == item.permissionName || permissionValue == item.permissionValue ) {
        this.$notify( {
          type: 'error',
          message: `存在重复权限，重复权限为${permissionName},请确保权限名称与数据接口均唯一`
        } )
        return false
      }
    }
    return true
  }
  deleteItem ( item, index ) {
    this.$http( API.permissionDelete, {
      id: item.id,
      broadcast: true
    } ).then( () => {
      this.permissionDataList.splice( index, 1 )
      this.setPermissionDataList( this.permissionDataList )
    } )
  }
  updateItem ( item ) {
    this.$http( API.permissionUpdate, {
      ...item,
      broadcast: true
    } ).then( ( { data } ) => {
      Object.assign( this.curPermission, item )
      this.editItem( {} )
    } )
  }
  addItem ( item ) {
    this.$http( API.permissionInsert, {
      ...item,
      permissionType: 2,
      broadcast: true
    } ).then( ( { data } ) => {
      this.setPermissionDataList( this.permissionDataList.concat( data.data ) )
      this.editItem( {} )
    } )
  }
  curPermission: any = null
}
</script>

