<template>
  <lc-table
    :config="config"
    :data="sortedData"
    @data-expand="expandFun"
    @cur-change="curChange"
    :page="page"
    :expand="expand"
    :key="config.length"
    @data-sort-change="sortChange"
  >
    <template slot="expand-before" slot-scope="scope">
      <slot :row="scope.row" name="expand-before"></slot>
    </template>
    <template slot-scope="scope">
      <slot :row="scope.row" :con="scope.con"></slot>
    </template>
    <template slot="expand-after" slot-scope="scope">
      <slot :row="scope.row" name="expand-after"></slot>
    </template>
  </lc-table>
</template>
<script lang="ts">

import { Component, Prop, Inject } from 'vue-property-decorator'
import TableView from './tableView.vue'
@Component( {
  name: 'table-has-expand'
} )
export default class TableHasExpand extends TableView {
  @Prop()
  expand: any
  expandFun ( v ) {
    this.$emit( 'expand', v )
  }
}
</script>
