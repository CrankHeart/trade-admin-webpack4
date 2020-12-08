<template>
  <div class="permission-menu box">
    <el-tree :data="menuList" :style="{height:height}" :props="defaultProps" :render-content="renderContent"></el-tree>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import API from '../../../API'
@Component( {
  name: 'permission-menu'
} )
export default class PermissionMenu extends Vue {
  @Prop()
  height: string
  @Action( 'permission/getPermissionMenu' ) getPermissionMenu
  @Getter( 'permission/getterPermissionMenu' ) permissionMenList
  get menuList () {
    let menuListObj = this.permissionMenList[ 0 ] || {}
    return Object.keys( menuListObj ).map( key => menuListObj[ key ] )
  }
  defaultProps = {
    children: 'children',
    label: 'name'
  }
  created () {
    if(this.$permissionValidateWithNotify(614)){
      this.getPermissionMenu()
    }
  }
  renderContent ( h, { node, data, store } ) {
    return h( 'span', { domProps: { innerHTML: `${data.name} - [${data.permissionId || '- -'}]` } } )
  }
}
</script>
<style lang="stylus" scoped>
.permission-menu
  .el-tree
    overflow auto
</style>

