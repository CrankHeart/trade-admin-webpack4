<template>
  <div id="coupon-list">
    <lc-title text="券码列表"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table-config :base-config="baseConfig" @set-config="setCouponConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='control'">
          <div class="el-button-group">
            <router-link
              :to="'detail/'+scope.row.id"
              tag="button"
              class="el-button el-button--text"
              v-if="$permissionValidate(553)"
            >查看</router-link>
            <!-- <el-button type="text" @click="exportExcel(scope.row)">导出券码</el-button> -->
          </div>
        </template>
        <template v-else-if="scope.con.prop=='status'">
          <el-switch
            v-model="scope.row.status"
            :on-value="0"
            :off-value="1"
            @change="toggleActivity(scope.row)"
            :disabled="!$permissionValidate(554)"
          ></el-switch>
        </template>
        <template v-else-if="scope.con.prop=='type'">{{decodeType(scope.row.type)}}</template>
        <template
          v-else-if="scope.con.prop=='time'"
        >{{formatTime(scope.row.beginTime)}} - {{formatTime(scope.row.endTime)}}</template>
        <template
          v-else-if="scope.con.prop=='stockLevel'"
        >{{scope.row.couponTotals - scope.row.unUsedCouponTotals}} / {{scope.row.couponTotals}}</template>
        <template
          v-else-if="scope.con.prop=='writeOffRate'"
        >{{((scope.row.couponTotals - scope.row.unUsedCouponTotals) /(scope.row.couponTotals||1)*100).toFixed(2)+'%'}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts"> 
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API, { baseURL } from '../../API'
// import '../../vuex/coupon'
import { State, Mutation, Action, Getter } from 'vuex-class'

import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTableConfig from '../../components/table/control.vue'
import lcTable from '../../components/table/'
import { couponTypes } from './const'
import { Page } from '../../typing/index'
@Component( {
  name: 'coupon-list',
  components: {
    lcTitle,
    lcCondition,
    lcTableConfig,
    lcTable
  }
} )
export default class CouponList extends Vue {
  @State( state => state.coupon.couponTypes ) couponTypes
  @Mutation( 'coupon/setCouponConf' ) setCouponConf
  condition = [
    { value: [], key: 'time', label: '有效期', type: 'daterange' },
    { value: '', key: 'type', label: '类别', type: 'radio', options: couponTypes }
  ]
  @Getter( 'coupon/couponConfig' ) baseConfig
  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  data = []
  page: Page = {
    cur: 1,
    num: 10,
    total: 0
  }
  @Inject() formatMyDate
  activated () {
    this.search()
  }
  search () {
    this.$permissionValidateWithNotify( 552 )
    let o: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      if ( key === 'time' ) {
        let time: any = value
        let [ beginTime, endTime ] = time
        o.beginTime = beginTime && this.formatMyDate( beginTime )
        o.endTime = endTime && this.formatMyDate( endTime, 'yyyy-MM-dd hh:mm:ss', true )
      } else if ( key === 'type' ) {
        if ( value !== null ) {
          o.type = value + ''
        }
      }
    } )
    o.num = this.page.num
    o.start = ( this.page.cur - 1 ) * o.num

    this.$http( API.getAllActivities, o ).then( ( { data } ) => {
      this.data = data.data.couponList
      this.page.total = data.data.total
    }, rej => {
      this.data = []
      this.page.total = 0
    } )
  }
  decodeType ( type ) {
    switch ( type ) {
      case 0:
        return '满减券'
      case 1:
        return '满折券'
      case 2:
        return '特价券'
      case 3:
        return '代金券'
      default:
        return 'unknow'
    }
  }
  formatTime ( time ) {
    return time && time.time && this.formatMyDate( new Date( time.time ), 'yyyy年MM月dd日' )
  }
  toggleActivity ( item ) {
    this.$http( API.updateActivityStatus, {
      activityId: item.id,
      status: +item.status
    } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '已成功将【' + item.activityName + '】活动状态修改为' + ( item.status ? '失效' : '有效' ) + '!'
      } )
    } )
  }
  exportExcel ( item ) {
    this.$submit( API.exportCoupons, {
      activityId: item.id,
      type: '0'
    } )
  }
}
</script>
