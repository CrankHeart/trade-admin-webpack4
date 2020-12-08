<template>
  <div class="permission-data-list box">
    <ul>
      <li v-for="(item,index) in list" :key="item.id" :class="{'is-active':value == item}">

        <el-button type="text" class="pull-right" @click="$emit('delete', item, index)" v-if="$permissionValidate(618)"><i class="el-icon-delete"></i></el-button>

        <el-button type="text" class="pull-right" @click="$emit('edit', item)" v-if="$permissionValidate(617)"><i class="el-icon-edit"></i></el-button>
        {{item.permissionName}} - {{item.id}}
      </li>
      <li>
        <el-button type="primary" size="small" @click="$emit('edit')" v-if="$permissionValidate(616)"><i class="el-icon-plus"></i></el-button>
      </li>
    </ul>

  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component( {
  name: 'permission-data-list'
} )
export default class PermissionDataList extends Vue {
  @Prop()
  list: any[]
  @Prop()
  value: any
}
</script>
<style lang="stylus" scoped>
li
  line-height 36px
  padding 0 10px
  cursor pointer
  &:hover
  &.is-active
    background #e4e8f1
  .el-button.pull-right
    display none
  &:hover
    .el-button.pull-right
      display block
</style>

