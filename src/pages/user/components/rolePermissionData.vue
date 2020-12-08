<template>
  <div class="role-permission-data box" style="height:600px;">
    <ul>
      <li v-for="item in permissionDataList" :key="item.permissionId">
        <el-checkbox v-model="value[item.id]" :disabled="disabled"/>
        {{item.permissionName}} - {{item.id}}
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
@Component( {
  name: 'role-permission-data'
} )
export default class RolePermissionData extends Vue {
  @Prop() value:any
  @Prop() disabled:boolean
  @State( state => state.permission.permissionData ) permissionDataList
  @Action( 'permission/getPermissionData' ) getPermissionData

  created () {
    this.getPermissionData()
  }
}
</script>
<style lang="stylus" scoped>

</style>

