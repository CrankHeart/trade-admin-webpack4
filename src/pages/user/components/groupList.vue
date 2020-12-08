<template>
  <el-tabs value="" class="group-list">
    <el-tab-pane name="" label="组织结构">
      <div class="box">
        <ul>
          <li v-for="item in groupList" :key="item.id" @click="$emit('select',item)" :class="{'is-active': group == item }">
            <i class="el-icon-delete pull-right" @click="confirmGroupDelete(item)" v-if="$permissionValidate(607)"></i>
            {{item.name}}
          </li>
          <li v-if="$permissionValidate(606)">
            <el-button type="primary" size="small" @click="confirmGroupInsert">新增组织</el-button>
          </li>
        </ul>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import API from '../../../API'
@Component( {
  name: 'group-list'
} )
export default class GroupList extends Vue {
  @Prop()
  group: any
  groupList: any[] = []
  getGroupList () {
    this.$permissionValidateWithNotify( 605 )
    this.$http( API.groupList ).then( ( { data } ) => {
      this.groupList = data.data
    } )
  }
  created () {
    this.getGroupList()
  }
  confirmGroupInsert () {
    this.$prompt( '请输入组织名称', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
      inputErrorMessage: '新建组织名称不能为空'
    } ).then( ( { value } ) => {
      this.groupInsert( value )
    } )
  }
  groupInsert ( name ) {
    this.$http( API.groupInsert, { name } ).then( ( { data } ) => {
      this.groupList.push( data.data )
    } )
  }
  confirmGroupDelete ( group ) {
    this.$confirm( `此操作将会删除【${group.name}】组织, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.delGroup( group )
    } )
  }
  delGroup ( group ) {
    this.$http( API.groupDelete, {
      id: group.id
    } ).then( () => {
      this.groupList = this.groupList.filter( v => v.id !== group.id )
    } )
  }
}
</script>
<style lang="stylus" scoped>
li
  line-height 30px
  padding 0 10px
  .el-icon-delete
    cursor pointer
    display none
    margin-top 8px
  &:not(:last-child):hover
  &.is-active
    background #e4e8f1
    .el-icon-delete
      display block
  &:last-child
    margin-top 10px
</style>
