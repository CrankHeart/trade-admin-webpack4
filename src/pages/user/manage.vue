<template>
  <div id="user-manage">
    <lc-title text="账户管理"></lc-title>
    <el-tabs v-model="activeName">
      <el-tab-pane label="用户列表" name="manageList" v-if="$permissionValidate(597)">
        <manage-list @tab-change="tabChange"></manage-list>
      </el-tab-pane>
      <el-tab-pane label="新增用户" name="manageAdd" v-if="$permissionValidate(599)">
        <manage-add @tab-change="tabChange"></manage-add>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import { State } from 'vuex-class'
import manageList from './components/manageList.vue'
import manageAdd from './components/manageAdd.vue'
@Component( {
  name: 'user-manage',
  components: {
    lcTitle,
    manageList,
    manageAdd
  }
} )
export default class UserManage extends Vue {
  activeName: string = ''
  tabChange ( v ) {
    this.activeName = v
  }
  activated () {
    if ( this.$permissionValidate( 599 ) ) {
      this.activeName = 'manageAdd'
    } else {
      this.activeName = 'manageList'
    }
  }
}
</script>
<style lang="stylus" scoped></style>

