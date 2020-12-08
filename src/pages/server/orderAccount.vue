<!--按订单对账-->
<template>
  <div id="server-check-order-list">
    <lc-condition :condition="condition" @submit="search" label-width="100px">
      <template slot="btn">
        <div style="float:left">
          <el-checkbox v-model="selectAll">全选</el-checkbox>
          <el-button
            type="default"
            @click="initiateChecks"
            v-currentLimiting2:click="2000"
            :disabled="canInitiateChecks"
          >发起核对</el-button>
        </div>
        <!-- <el-button
          type="primary"
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="batchStatement"
        >批量发起上月对账</el-button>-->
      </template>
    </lc-condition>
    <lc-table
      ref="orderAccountTable"
      class="order-account-table table-margin"
      :scroll-options="{offset: -350}"
      :config="config"
      :data="tableListData"
      :page="page"
      :key="config.length"
      selection
      @data-selection-change="selectionChange"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'checkStatus' ">{{ formatCheckStatus( row[ con.prop ] )}}</template>
        <template
          v-else-if="con.prop === 'settlementStatus' "
        >{{ formatSettlementStatus( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'orderDate' ">{{ formatMyDate( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'control' ">
          <el-button size="mini" type="text" @click="toOrderDetails(row['orderSn'])">订单详情</el-button>
        </template>
        <template v-else>{{row[ con.prop ]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import { deliverySettlementStatus } from '@/pages/order/const/orderSearchCondition'
import lcTable from '../../components/table/index'
import { formatMyDate } from '../../utils/index'
import { checkStatus, settlementStatus } from './const/serverConstant'
import { matchArrItem } from '../../utils'
import API from '../../API'
@Component( {
  name: 'order-account',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class orderAccount extends Vue {
  @Action( 'stores/getAllStoresWithCache' ) getAllStoresWithCache
  checkStatus = checkStatus
  settlementStatus = settlementStatus
  fullscreenLoading: boolean = false // 是否显示整页loading
  orderAccountElTable: any = null
  config = [
    { prop: 'orderSn', label: '订单号', width: '280px' },
    { prop: 'storeName', label: '经销商', width: '220px' },
    { prop: 'orderDate', label: '下单时间', width: '280px' },
    { prop: 'checkAmount', label: '对账金额', width: '220px' },
    { prop: 'checkStatus', label: '对账状态', width: '220px' },
    { prop: 'settlementStatus', label: '结算状态', width: '220px' },
    { prop: 'control', label: '操作', width: '220px' }
  ]
  tableListData = []
  condition = [
    { value: {}, key: 'tenant', label: '集团公司', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
    // { value: '', key: 'storeId', label: '经销商', type: 'storeSearch' },
    { value: [], key: 'initiateDate', label: '下单时间', type: 'daterange' },
    { value: '', key: 'orderSn', label: '订单号', type: 'text' },
    { value: [ 0 ], key: 'checkStatusList', label: '对账状态', type: 'checkbox', options: checkStatus },
    { value: [ 0 ], key: 'settlementStatusList', label: '结算状态', type: 'checkbox', options: deliverySettlementStatus }
  ]
  data = []
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 50 ]
  }
  mounted () {
    this.orderAccountElTable = this.findComponentDownward( this.$refs.orderAccountTable, 'ElTable' )
  }

  activated () {
    this.search()
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.search()
  }
  checkedOrderSn: Array<any> = []
  // * table未提供selection全选方法，当用户把table所有选项选中之后，selectAll设为true会又触发一次toggleRowSelection，使table中selection状态变为未选中，故设一个变量控制table选项是否toggle
  canToggle: boolean = true
  selectionChange ( v ) {
    this.checkedOrderSn = v
    if ( this.checkedOrderSn.length === this.tableListData.length ) {
      this.canToggle = false
      this.selectAll = true
    } else {
      this.canToggle = true
      this.selectAll = false
    }
  }
  get canInitiateChecks () {
    return !!this.checkedOrderSn.length ? false : true
  }
  initiateChecks () {
    this.$permissionValidateWithNotifyEnv( 1177, 1173 )
    if ( this.checkedOrderSn.length > 1 ) {
      for ( let i = 0, l = this.checkedOrderSn.length; i < l - 1; i++ ) {
        let order1 = this.checkedOrderSn[ i ]
        let order2 = this.checkedOrderSn[ i + 1 ]
        if ( order1.storeId !== order2.storeId ) {
          this.$notify( {
            type: 'error',
            message: `已选订单中，订单${order1.orderSn}与订单${order2.orderSn}所属门诊不一致，请保持所选诊所一致后，再次发起核对`
          } )
          return
        }
      }
    }
    let orderSns = this.checkedOrderSn && this.checkedOrderSn.map( val => val.orderSn ).join( ';' )
    this.$http( API.launchedAccountChecking, { orderSns } ).then( ( { data } ) => {
      let successOrderSns = data.successList && data.successList.map( val => val.orderSn )
      this.tableListData.forEach( value => {
        if ( successOrderSns.indexOf( value.sn ) > -1 ) {
          value.settlementStatus = 1
        }
      } )
      if ( successOrderSns && !data.failedList.length ) {
        this.$notify( {
          type: 'success',
          message: '月结订单的核对已发起'
        } )
        this.search()
      }
      data.failedList.forEach( ( v, i ) => {
        setTimeout( () => {
          this.$notify( {
            type: 'error',
            message: `订单:${v.orderSn}发起核对失败,原因:${v.msg}`
          } )
        }, i * 50 );
      } )
    }, rej => {
      if ( rej.data.msg.indexOf( '跨门店' ) > -1 ) {
        this.$notify( {
          type: 'error',
          message: '您所选择的订单跨门店,请拆分门店后重试'
        } )
      } else {
        this.$notify( {
          type: 'error',
          message: rej.data.msg
        } )
      }
    } )
  }
  toOrderDetails ( sn ) {
    this.$router.push( `/order/detail/${sn}` )
  }
  selectAll = false
  @Watch( 'selectAll' )
  watchSelectAll ( val ) {
    if ( val ) {
      this.tableListData.forEach( row => {
        if ( this.canToggle ) {
          this.orderAccountElTable.toggleRowSelection( row )
        }
      } )
    } else {
      this.orderAccountElTable.clearSelection()
    }
  }


  findComponentDownward ( context, componentName ) {
    const childrens = context.$children
    let children = null
    if ( childrens.length ) {
      for ( const child of childrens ) {
        const name = child.$options.name

        if ( name === componentName ) {
          children = child
          break
        } else {
          children = this.findComponentDownward( child, componentName )
          if ( children ) break
        }
      }
    }
    return children
  }
  formatCheckStatus ( id ) {
    return matchArrItem( id, checkStatus, 'id' ).name
  }

  formatSettlementStatus ( id ) {
    return matchArrItem( id, settlementStatus, 'id' ).name
  }

  formatMyDate = formatMyDate
  formatParam () {
    let { num, cur } = this.page
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num
    }
    this.condition.forEach( con => {
      let { type, key, value } = con
      if ( type == 'tenantSearch' || type == 'customerSearch' ) {
        param[ `${key}Id` ] = ( value as any )[ `${key}Id` ]
        param[ `${key}Name` ] = ( value as any )[ `${key}Name` ]
      } else if ( key == 'initiateDate' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ]: any = value
          param[ 'startTime' ] = this.formatMyDate( start )
          param[ 'endTime' ] = this.formatMyDate( end, void 0, true )
        }
      } else if ( value !== undefined && value != '' ) {
        param[ key ] = value
      }
    } )

    return param
  }
  search () {
    this.$permissionValidateWithNotifyEnv( 1178, 1174 )
    let params = this.formatParam()
    this.getitems4Account( params )
  }
  dealTableListData ( list, val ) {
    this.tableListData = list.map( item => {
      let field = val.find( field => item.storeId == field.storeId )
      return {
        ...item,
        storeName: !!field ? field.storeName : '',
        orderDate: !!item.orderDate ? this.formatMyDate( item.orderDate.time ) : null,
        checkAmount: Number.isFinite( item.checkAmount ) ? item.checkAmount.toFixed( 2 ) : null
      }
    } )
  }
  getitems4Account ( params ) {
    this.getAllStoresWithCache().then( storeList => {
      this.$http( API.items4Account, { ...params, dimension: 2 } ).then( ( { data: { data } } ) => {
        let tableListData = data.list || []
        this.page.total = data.total
        this.dealTableListData( tableListData, storeList )
      } )
    } ).catch( res => {
      this.$notify( {
        type: 'warning',
        message: res.data.msg || 'warning'
      } )
    } )

  }
  batchStatement () {
    const message = '系统将自动把上月已经完成且无在处理服务单的订单按客户批量发起对账，确定开始执行吗？'
    this.$confirm( message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( res => {
      this.fullscreenLoading = true
      this.$http( API.initiateBatchKey ).then( res => {
        this.fullscreenLoading = false
        this.$notify( {
          type: 'success',
          message: res.data.msg || 'success'
        } )
      } ).catch( res => {
        this.fullscreenLoading = false
        this.$notify( {
          type: 'warning',
          message: res.data.msg || 'warning'
        } )
      } )
      // 已向XX家客户的XX笔订单新建完对账单，仍有XX笔订单由于有正在处理的服务单的订单无法完成新建，请手动处理
    } )
  }
}
</script>
<style lang="stylus">
.order-account-table .el-table
  .el-table__fixed-header-wrapper
    .el-checkbox
      visibility hidden
</style>
<style lang="stylus" scoped>
.check-order-button
  margin 10px
.control a
  cursor pointer
</style>
