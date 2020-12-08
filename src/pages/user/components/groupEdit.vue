<template>
  <div class="group-edit">
    <el-tabs v-model="tabName" class="group-list">
      <el-tab-pane name="role" label="组织角色" v-if="$permissionValidate(608)">
        <group-role :group="group" @submit="$emit('submit',$event)" @cancel="$emit('cancel')" v-if="tabName == 'role'"></group-role>
      </el-tab-pane>
      <el-tab-pane name="user" label="所属用户" v-if="$permissionValidate(609)">
        <group-user :group="group" v-if="tabName == 'user'"></group-user>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import groupRole from './groupRole.vue'
import groupUser from './groupUser.vue'
@Component( {
  name: 'group-edit',
  components: {
    groupRole,
    groupUser
  }
} )
export default class GroupEdit extends Vue {
  @Prop()
  group: any
  tabName: string = 'role'
}
</script>

