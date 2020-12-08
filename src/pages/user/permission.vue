<template>
  <div id="permission">
    <lc-title text="权限管理"></lc-title>
    <el-tabs v-model="tab">
      <el-tab-pane v-for="item in tabs" :key="item.prop" :label="item.label" :name="item.prop"></el-tab-pane>
    </el-tabs>
    <component :is="tab" :height="boxHeight"></component>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import permissionData from './components/permissionData.vue'
import permissionMenu from './components/permissionMenu.vue'

@Component( {
  name: 'permission',
  components: {
    lcTitle,
    permissionMenu,
    permissionData
  }
} )
export default class Permission extends Vue {
  tabs = [
    { prop: 'permissionMenu', label: '菜单权限' },
    { prop: 'permissionData', label: '数据权限' }
  ]
  tab = 'permissionMenu'
  @State( 'clientHeight' ) clientHeight
  get boxHeight () {
    return this.clientHeight - 240 + 'px'
  }
}
</script>
