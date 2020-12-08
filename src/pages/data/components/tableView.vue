<template>
  <lc-table
    :config="config"
    :data="sortedData"
    @cur-change="curChange"
    :page="page"
    :key="config.length"
    @data-sort-change="sortChange"
    class="table-view"
  >
    <template slot-scope="scope">
      <slot :row="scope.row" :con="scope.con"></slot>
    </template>
  </lc-table>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import lcTable from '../../../components/table'
import { Page } from '../../../typing/index'
@Component( {
  name: 'data-table-view',
  components: {
    lcTable
  }
} )
export default class DataTableView extends Vue {
  @Prop( { default: () => [] } )
  config: any[]
  @Prop( { default: () => [] } )
  data: any[]
  page: Page = {
    cur: 1,
    total: 0,
    num: 10
  }
  @Watch( 'data' )
  dataWatch ( v ) {
    this.page.total = v.length
  }
  sort: number = 1
  get sortedData () {
    let arr = this.data.concat()
    arr = this.sort ? arr : arr.reverse()
    arr.forEach( ( v, i ) => {
      v.index = i + 1
      if ( v.createDate ) {
        v.createDate = v.createDate.replace( '.0', '' )
      }
    } )
    let num = this.page.num
    let start = ( this.page.cur - 1 ) * num
    return arr.splice( start, num )
  }
  sortChange ( v ) {
    this.sort = v.order == 'ascending' ? 1 : 0
  }
  curChange ( cur ) {
    this.page.cur = cur
  }
}
</script>


