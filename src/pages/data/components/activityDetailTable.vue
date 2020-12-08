<template>
  <div class="activity-detail-table">
    <lc-table
      :data="tableData"
      :config="config"
      :has-page="false"
      :key="config.length"
      @cur-change="changePage"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'discountState'"
        >{{formatDiscountState( scope.row['discountState'] )}}</template>
        <template
          v-else-if="scope.con.prop === 'discountType'"
        >{{formatDiscountType( scope.row['discountType'] )}}</template>
        <template v-else-if="scope.con.prop === 'index'">{{ scope.$index + 1 }}</template>
        <template
          v-else-if="scope.con.prop === 'date'"
        >{{ `${scope.row['year']}年${scope.row['month']}月第${scope.row['week']}周` }}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import lcTitle from '../../../components/title.vue'
import lcTable from '../../../components/table'
import API from '../../../API'
import { discountType, discountState } from '../const'

@Component( {
  name: 'activity-detail-table',
  components: {
    lcTitle,
    lcTable
  }
} )
export default class activityDetailTable extends Vue {
  @Prop( { default: () => ( {} ) } ) activity: any

  @Inject() formatMyDate

  config = [
    // { prop: 'id', label: 'id' },
    // { prop: 'discountId', label: '促销id' },
    { prop: 'index', label: '序号', width: '70px' },
    { prop: 'discountName', label: '促销名称', width: '200px' },
    { prop: 'date', label: '所属时间', width: '150px' },
    { prop: 'discountType', label: '促销类型' },
    { prop: 'discountState', label: '状态' },
    { prop: 'discountStartTime', label: '起始时间', width: '130px' },
    { prop: 'discountEndTime', label: '结束时间', width: '130px' },
    { prop: 'totalSkuNum', label: '涉及sku数', width: '130px' },
    { prop: 'salesSkuNum', label: '产生销量sku数', width: '150px' },
    { prop: 'discountGmv', label: '销售额' },
    { prop: 'salesVolume', label: '销量' }
  ]
  tableData: any[] = []
  page = {
    num: 10,
    cur: 1,
    total: 0
  }

  @Watch( 'activity', { deep: true } )
  watchActivity ( newVal ) {
    if ( newVal ) {
      this.getActivity( newVal )
    }
  }

  formatDiscountType ( id ) {
    let type = discountType.filter( v => v.id === id )[ 0 ]
    return type.name || ''
  }
  formatDiscountState ( id ) {
    let type = discountState.filter( v => v.id === id )[ 0 ]
    return type.name || ''
  }

  changePage ( cur ) {
    this.page.cur = cur
  }

  getActivity ( activity ) {
    let { discountType, year, month, week, discountStartTime, discountEndTime } = activity
    // let num = this.page.
    this.$http( API.selectDiscountSales, {
      discountType,
      year,
      month,
      week,
      discountStartTime,
      discountEndTime
    } ).then( ( { data } ) => {
      let d = data.data
      this.tableData = []
      Object.keys( d ).forEach( key => {
        d[ key ].forEach( v => {
          let { discountStartTime, discountEndTime } = v
          v.discountStartTime = discountStartTime ? this.formatMyDate( discountStartTime.time, 'yyyy-MM-dd' ) : ''
          v.discountEndTime = discountEndTime ? this.formatMyDate( discountEndTime.time, 'yyyy-MM-dd' ) : ''
          this.tableData.push( v )
        } )
      } )


    } )
  }



}
</script>

<style lang='stylus' scoped></style>
