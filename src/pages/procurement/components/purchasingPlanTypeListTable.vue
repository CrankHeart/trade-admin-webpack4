<template>
  <lc-table :config="config" :data="data" :has-page="false">
    <template slot-scope="scope">
      <template v-if="scope.con.prop=='control'">
        <span @click="toPlanDetails(scope.row)" v-if="status == 3" class="pramary pointer">盘点</span>
        <span @click="toPlanDetails(scope.row)" v-else class="pramary pointer">详情</span>
      </template>
      <template
        v-else-if="scope.con.prop=='startAndEndDate'"
      >{{formatePlanTime(scope.row['startDate']['time']) + '~' + formatePlanTime(scope.row['endDate']['time'])}}</template>
      <!-- <template
        v-else-if="scope.con.prop=='deliveryCompletionRate' || scope.con.prop=='deliveryTimelyRate'"
      >{{scope.row[scope.con.prop]}}</template>-->
      <template v-else>{{scope.row[scope.con.prop]}}</template>
    </template>
  </lc-table>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table/index'
import API from '../../../API'
@Component( {
  name: 'purchasing-plan-type-list-table',
  components: {
    lcTable
  }
} )
export default class purchasingPlanTypeListTable extends Vue {
  @Inject() formatMyDate
  @Prop( { default: () => [] } ) config: any[]
  @Prop( { default: () => [] } ) data: any[]
  @Prop( { type: String || Number, default: 4 } ) status

  formatePlanTime ( time ) {
    return this.formatMyDate( time, 'yyyy/MM/dd hh:mm' )
  }
  async getPurchasingPlanListData ( status ) {
    let { data, data: { plan } } = await this.$http( API.getPlanByStatus, { status } )
    return plan
  }
  createPurchasingPlan () {
    this.$router.push( '/procurement/createPurchasingPlan' )
  }
  toPlanDetails ( { id, status } ) {
    this.$emit( 'toPlanDetails', id, +this.status )
  }
}
</script>
