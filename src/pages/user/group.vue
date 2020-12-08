<template>
  <div id="group">
    <lc-title text="组织结构"></lc-title>
    <el-row :gutter="30">
      <el-col :sm="12">
        <group-list @select="selectGroup" :group="curGroup"></group-list>
      </el-col>
      <el-col :sm="12" v-if="curGroup">
        <group-edit :group="curGroup" @submit="groupRoleSubmit" @cancel="groupRoleCancel" ></group-edit>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import groupList from './components/groupList.vue'
import groupEdit from './components/groupEdit.vue'
import API from '../../API'
@Component( {
  name: 'group',
  components: {
    lcTitle,
    groupList,
    groupEdit
  }
} )
export default class Group extends Vue {
  curGroup: any = null
  selectGroup ( group ) {
    this.curGroup = group
  }
  groupRoleSubmit ( item ) {
    let { id, name, roleIds } = item
    name = name == this.curGroup.name ? undefined : name
    let o: any = {id,roleIds}
    if(name){
      o.name = name
    }
    this.$http( API.groupUpdate, {
      ...o,
      broadcast: true
    } ).then( () => {
      Object.assign( this.curGroup, o )
    } )
    console.log( item )
  }
  groupRoleCancel () {
    this.curGroup = null
  }
}
</script>

