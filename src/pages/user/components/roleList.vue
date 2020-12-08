<template>
  <div class="role-list box">
    <ul>
      <li v-for="item in list" :key="item.id" :class="{'is-active':item==value}" @click="$emit('select',item)">
        {{item.roleName}}
        <!-- -
        p:{{item.parentIds || 0}} -
        id:{{item.id}} -->
        <el-button type="text" size="small" class="pull-right" @click.stop="deleteItem(item)" v-if="$permissionValidate(602)">
          <i class="el-icon-delete"></i>
        </el-button>
        <!-- <el-button type="text" size="small" class="pull-right" >
          <i class="el-icon-edit"></i>
        </el-button> -->
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component( {
  name: 'role-list'
} )
export default class RoleList extends Vue {
  @Prop()
  list: any[]
  @Prop()
  value: any
  deleteItem ( item ) {
    this.$confirm( '此操作将删除角色, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$emit( 'delete', item )
    } )
  }
}
</script>
<style lang="stylus" scoped>
li
  line-height 30px
  cursor pointer
  padding 0 10px
  .el-button
    display none
  &:hover
  &.is-active
    background #e4e8f1
    .el-button
      display block
</style>
