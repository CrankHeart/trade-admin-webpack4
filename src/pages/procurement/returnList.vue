<template>
  <div id="procurement-return-list">
    <lc-title text="退款退货列表"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>

    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='applyTime'">{{formatDate(scope.row.applyTime)}}</template>
        <template
          v-else-if="scope.con.prop=='serviceType'"
        >{{formatServiceType(scope.row.serviceType)}}</template>
        <template v-else-if="scope.con.prop=='skuName'">
          <p>{{scope.row.skuName}}</p>
          <p>{{scope.row.specification}}</p>
        </template>
        <template
          v-else-if="scope.con.prop=='serviceStatus'"
        >{{formatServiceStatus(scope.row.serviceStatus)}}</template>
        <template v-else-if="scope.con.prop=='control'">
          <template v-if="scope.row.serviceStatus==12||scope.row.serviceStatus==21">
            <el-button type="primary" @click="complete(scope.row)">完成</el-button>
          </template>
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
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import { serviceStatus, serviceTypes } from './const/'
import { matchArrItem } from '../../utils/'
@Component( {
  name: 'procurement-return-list',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class ProcurementReturnList extends Vue {
  condition = [
    { value: '', key: 'serviceStatus', label: '状态', type: 'select', options: serviceStatus },
    { value: '', key: 'serviceType', label: '类型', type: 'select', options: serviceTypes },
    { value: '', key: 'procurementSn', label: '采购单号', type: 'text' },
    { value: '', key: 'serviceSn', label: '服务单号', type: 'text' },
    { value: '', key: 'applyTime', label: '申请时间', type: 'daterange' },
  ]
  config = [
    { prop: 'procurementSn', label: '采购单号', width: '205px' },
    { prop: 'serviceSn', label: '服务单号', width: '205px' },
    { prop: 'serviceType', label: '服务单类型' },
    { prop: 'skuName', label: '商品信息' },
    { prop: 'serviceStatus', label: '服务单状态' },
    { prop: 'skuNum', label: '商品数量' },
    { prop: 'skuAmount', label: '退款金额' },
    { prop: 'applyTime', label: '申请时间' },
    { prop: 'control', label: '操作' },
  ]
  activated () {
    this.urlToOption()
    this.search()
  }
  formatDate ( date ) {
    let timeStmp = date && date.time
    return timeStmp && this.formatMyDate( timeStmp, 'yyyy-MM-dd' )
  }
  formatServiceType ( serviceType ) {
    return matchArrItem( serviceType, serviceTypes, 'id' ).name
  }
  formatServiceStatus ( status ) {
    return matchArrItem( status, serviceStatus, 'id' ).name
  }

  myData: any[] = []
  page = {
    cur: 1,
    total: 0,
    num: 10
  }
  curChange ( v ) {
    this.page.cur = v
    this.search()
  }
  @Inject() formatMyDate
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
    }
    return o
  }
  urlToOption () {
    let { query } = this.$route
    this.condition.forEach( ( v: any ) => {
      let { key, type } = v
      let value = query[ key ]
      if ( type == 'select' && value ) {
        v.value = +query[ key ]
      } else {
        v.value = query[ key ] || ''
      }
    } )
  }
  optionToUrl ( query ) {
    this.$router.push( {
      path: 'procurement/procurementReturn',
      query
    } )
  }
  complete ( item ) {
    let { serviceSn } = item
    let serviceStatus = item.serviceStatus == 12 ? 19 : 29
    let completeTime = this.formatMyDate( new Date() )
    this.$confirm( '是否确认手动完成此服务单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    } ).then( () => {
      this.$http( API.updateProcurementServiceOrder, { serviceStatus, serviceSn, completeTime } ).then( res => {
        this.$message( {
          type: 'success',
          message: '已成功!'
        } );
        item.serviceStatus = serviceStatus
      } )
    } ).catch( () => {
      this.$message( {
        type: 'info',
        message: '已取消'
      } );
    } );

  }
  search () {
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
      this.myData = list
    } )
  }
}
</script>
<style lang="stylus" scoped>
.table-with-page
  p + p
    font-size 12px
</style>