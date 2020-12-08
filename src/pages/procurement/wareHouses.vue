<template>
  <div id="supplier-list">
    <lc-title text="仓库管理"></lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="100px"></lc-condition>
    <lc-table :config="config" :data="tableList" :has-page="false" :key="config.length">
      <template slot-scope="scope">
        <template>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'

@Component( {
  name: 'ware-houses',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class WareHouses extends Vue {
  @State( state => state.procurement.wareHousesList ) wareHousesList
  @Action( 'procurement/listWareHouses' ) listWareHouses

  condition = [
    { value: '', prop: 'code', type: 'select', label: '仓库', options: [] }
  ]
  config = [
    { prop: 'code', label: '编码', width: '90px' },
    { prop: 'name', label: '名称' },
    { prop: 'address', label: '地址' },
    { prop: 'requestUrl', label: '接口地址' },
    { prop: 'companyCode', label: '货主信息' },
    { prop: 'freightCostFactor', label: '运费因子', width: '120px' },
    { prop: 'heavyGoodsFactor', label: '重货因子', width: '120px' }
  ]
  page = {
    total: 0,
    cur: 1,
    num: 10
  }
  tableList = []

  activated () {
    this.$permissionValidateWithNotify( 760 )
    this.search()
    this.listWareHouses().then( list => this.condition[ 0 ].options = list )
  }

  formatOptions () {
    let params: any = {}
    this.condition.map( v => {
      if ( v.value.length ) {
        params[ v.prop ] = v.value
      }
    } )
    return params
  }

  search () {
    this.$http( API.searchWarehouse, this.formatOptions() ).then( ( { data } ) => {
      let d = data.data
      this.tableList = d.list
    } )
  }
}

</script>

<style lang="stylus" scoped>
.control
  button:nth-child(2n-1)
    margin-left 0
</style>
