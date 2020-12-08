<template>
  <div id="procurement-return">
    <lc-title text="采购退货单"></lc-title>
    <lc-condition :condition="condition" @submit="search" labelWidth="105px"></lc-condition>
    <lc-table-config :base-config="baseConfig" @set-config="setProcurementReturnConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      @size-change="sizeChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='applyTime'">{{ formatDate(scope.row['applyTime']) }}</template>
        <template
          v-else-if="scope.con.prop === 'serviceType'"
        >{{ formatStatus(scope.row.serviceType, serviceTypes )}}</template>
        <template
          v-else-if="scope.con.prop === 'returnStatus'"
        >{{ formatStatus(scope.row.returnStatus, returnStatuses )}}</template>
        <template
          v-else-if="scope.con.prop === 'settleStatus'"
        >{{ formatStatus(scope.row.settleStatus, settleStatuses )}}</template>
        <template v-else-if="scope.con.prop === 'control'">
          <span
            class="settle-order"
            v-if="scope.row.settleStatus == 0 && scope.row.returnStatus != 2 && $permissionValidate(648)"
            @click="settleServiceOrder(scope.row)"
          >结算</span>
          <span
            class="settle-order"
            v-if="scope.row.returnStatus == 0 && $permissionValidateWithEnv(1245,1241)"
            @click="cancelServiceOrder(scope.row)"
          >取消</span>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/index'
import lcTableConfig from '../../components/table/control.vue'
import lcCondition from '../../components/condition.vue'
import { serviceTypes, settleStatuses, returnStatuses } from './const/'
import { matchArrItem } from '../../utils/'
import { Mutation, Getter } from 'vuex-class'
@Component( {
  name: 'procurement-return',
  components: {
    lcTitle,
    lcTable,
    lcTableConfig,
    lcCondition
  }
} )
export default class procurementReturn extends Vue {
  @Mutation( 'procurement/setProcurementReturnConf' ) setProcurementReturnConf
  @Getter( 'procurement/procurementReturnConfig' ) baseConfig
  serviceTypes = serviceTypes
  settleStatuses = settleStatuses
  returnStatuses = returnStatuses
  condition = [
    { value: '', key: 'procurementSn', label: '采购单号', type: 'text' },
    { value: '', key: 'serviceSn', label: '服务单号', type: 'text' },
    { value: '', key: 'applyTime', label: '退货申请日期', type: 'daterange' },
    { value: '', key: 'serviceType', label: '退货类型', type: 'radio', options: serviceTypes },
    { value: '', key: 'settleStatus', label: '结算状态', type: 'radio', options: settleStatuses },
    { value: '', key: 'returnStatus', label: '退货状态', type: 'radio', options: returnStatuses },
  ]
  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }

  @Inject() formatMyDate
  formatDate ( date ) {
    let time = date && date.time
    return time && this.formatMyDate( time, 'yyyy-MM-dd' )
  }
  formatStatus ( item, type ) {
    return matchArrItem( item, type, 'id' ).name
  }

  data: any[] = []
  page = {
    cur: 1,
    total: 0,
    num: 10,
    sizes: [ 10, 20, 50 ]
  }
  curChange ( v ) {
    this.page.cur = v
    this.search()
  }

  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.search()
  }

  requestOption () {
    let { cur, num } = this.page
    let o: any = {}
    this.condition.forEach( ( { value, key } ) => {
      if ( value !== '' ) {
        o[ key ] = value
      }
    } )
    o.start = ( cur - 1 ) * num
    o.num = num
    if ( o.applyTime && o.applyTime[ 0 ] ) {
      let [ startApplyTime, endApplyTime ] = o.applyTime
      o.startApplyTime = this.formatMyDate( startApplyTime )
      o.endApplyTime = this.formatMyDate( endApplyTime, 'yyyy-MM-dd hh:mm:ss', true )
      delete o.applyTime
    }
    return o
  }

  urlToOption () {
    let { query } = this.$route
    this.condition.forEach( ( v: any ) => {
      let { key, type } = v
      let value = query[ key ]
      if ( type == 'radio' && value ) {
        v.value = +query[ key ]
      } else {
        v.value = query[ key ] || ''
      }
    } )
  }
  optionToUrl ( query ) {
    this.$router.replace( {
      path: '/procurement/procurementReturn',
      query
    } )
  }

  search ( cur?: number ) {
    this.$permissionValidateWithNotify( 647 )
    let requestOption = this.requestOption()
    this.optionToUrl( requestOption )
    this.$http( API.selectServiceOrder, requestOption ).then( ( { data } ) => {
      let list = ( data.list || [] ).map( v => {
        let { skuDetail } = v
        let sku = JSON.parse( skuDetail || '[]' ) || [ {} ]
        return {
          ...v,
          ...sku[ 0 ]
        }
      } )
      this.page.total = data.num
      this.data = list
    } )
    this.page.cur = cur || this.page.cur
  }
  settleServiceOrder ( item ) {
    let { serviceSn } = item
    this.$confirm( '是否确定结算?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.settleServiceOrder, { serviceSn } ).then( res => {
        item.settleStatus = 1
        this.$message( {
          message: res.data.msg,
          type: 'success'
        } )
      }, rej => {
        this.$message( {
          message: rej.data.msg,
          type: 'warning'
        } )
      } )
    } )
  }
  cancelServiceOrder ( item ) {
    let { serviceSn } = item
    this.$confirm( '是否取消?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.cancelServiceOrder, { serviceSn } ).then( res => {
        item.settleStatus = 2
        this.$message( {
          message: res.data.msg,
          type: 'success'
        } )
      }, rej => {
        this.$message( {
          message: rej.data.msg,
          type: 'warning'
        } )
      } )
    } )
  }
  activated () {
    this.urlToOption()
    this.search()
  }
}
</script>
<style lang="stylus" scoped>
.settle-order
  cursor pointer
  color #20a0ff
  &:hover
    text-decoration underline
</style>
