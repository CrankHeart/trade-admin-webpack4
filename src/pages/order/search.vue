<template>
  <div id="order-search">
    <lc-title text="订单查询"></lc-title>
    <lc-condition :condition="condition" @submit="searchOrder"></lc-condition>
    <!-- <el-checkbox v-model="isAllChecked">全选</el-checkbox> -->
    <!-- <template v-if="$permissionValidate(533)">
      <el-button class="launch-order-check" type="primary" :disabled="OrderCheckButtonDisabled" size="small" @click="launchOrderCheck([])">发起订单核对</el-button>
      <el-tooltip class="tool-tip" effect="dark" placement="top-start" content="只有月结订单可发起审核,请确认您选择的订单">
        <i class="el-icon-warning"></i>
      </el-tooltip>
    </template>-->
    <!-- <template v-if="$permissionValidate(1045)">
      <el-button class="create-payment-voucher" type="warning" :disabled="paymentVoucherButtonDisabled" size="small" @click="createPaymentVoucher({})">新建付款凭证</el-button>
      <el-tooltip class="tool-tip" effect="dark" placement="top-start" content="经过配置需要进行新建付款凭证的普通订单">
        <i class="el-icon-warning"></i>
      </el-tooltip>
    </template>-->
    <!-- <div class="pull-right" v-if="$permissionValidate(1106)">
      <el-button @click="batchStatement" v-loading.fullscreen.lock="fullscreenLoading" type="primary" size="small">批量发起上月对账</el-button>
      <el-tooltip class="tool-tip" effect="dark" placement="top-start" content="系统将自动把上月已经完成且无在处理服务单的订单按客户批量发起对账">
        <i class="el-icon-warning"></i>
      </el-tooltip>
    </div>-->
    <SearchList
      :data="data"
      @cur-change="curChange"
      @size-change="sizeChange"
      :page="page"
      :params="params"
      @emit-search="linkSearch"
      @launchOrderCheck="launchOrderCheck"
      @createPaymentVoucher="createPaymentVoucher"
    ></SearchList>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Provide, Prop, Inject, Watch } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import SearchList from './components/searchList.vue'
import { State, Action, Getter, Mutation } from 'vuex-class'
import { orderTypes, userTypes, settlementStatus, orderStatus, shoppingTypes, firstOrderStatus, labelStatus } from './const/orderSearchCondition'
import createPaymentVoucher from '../server/createPaymentVoucher.vue'

import { Page } from '../../typing/index'
@Component( {
  name: 'order-search',
  components: {
    lcTitle,
    lcCondition,
    SearchList,
    createPaymentVoucher
  }
} )
export default class OrderSearch extends Vue {
  @Provide( "app" )
  app = {
    refreshOrder: this.searchOrder
  }
  fullscreenLoading: boolean = false // 是否显示整页loading
  condition = [
    { value: '', key: 'sn', label: '订单编号', type: 'text' },
    { value: '', key: 'tradeNo', label: '支付单号', type: 'text' },
    { value: '', key: 'label', label: '订单分类', type: 'select', options: labelStatus },
    { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
    { value: '', key: 'name', label: '用户名', type: 'text' },
    { value: '', key: 'lcCode', label: 'sku编码', type: 'text' },
    { value: '', key: 'skuName', label: '商品名称', type: 'text' },
    // { value: '', key: 'shoppingType', label: '订单类型', type: 'select', options: shoppingTypes },
    { value: '', key: 'orderType', label: '结算类型', type: 'select', options: orderTypes },
    { value: [], key: 'theDate', label: '下单时间', type: 'daterange' },
    { value: [], key: 'sendDate', label: '发货时间', type: 'daterange' },
    // { value: '', key: 'storeId', label: '经销商', type: 'storeSearch' },
    // {value: '', key: 'userType', label: '用户类型', type: 'select', options: userTypes},
    { value: '', key: 'firstOrder', label: '首次下单', type: 'radio', options: firstOrderStatus },
    // { value: '', key: 'settlementStatus', label: '结算状态', type: 'radio', options: settlementStatus,  col: { lg: 24, sm: 24 } },
    { value: [], key: 'status', label: '状态', type: 'checkbox', options: orderStatus, col: { lg: 24, sm: 24 } }
  ]
  get isAllChecked () {
    return this.data.length && ( this.data.filter( v => v.isChecked ) || [] ).length == this.data.length
  }
  set isAllChecked ( v ) {
    let checked = this.isAllChecked
    this.data.forEach( v => {
      v.isChecked = !checked
    } )
  }
  get OrderCheckButtonDisabled () {
    return !this.OrderCheckFilterData.length
  }
  get paymentVoucherButtonDisabled () {
    return !this.paymentVoucherFilterData.length
  }

  get OrderCheckFilterData () {
    return this.data.filter( v => v.isChecked && v.orderType == 1 && v.orderStatus !== 6 ) || []
  }
  get paymentVoucherFilterData () {
    return this.data.filter( v => v.isChecked ) || []
  }

  launchOrderCheck ( v ) {
    let orderList = v.length ? v : this.OrderCheckFilterData
    if ( !v.length ) {
      for ( let i = 0, l = orderList.length; i < l - 1; i++ ) {
        let order1 = orderList[ i ]
        let order2 = orderList[ i + 1 ]
        if ( order1.tenantId !== order2.tenantId || order1.officeId !== order2.officeId ) {
          this.$notify( {
            type: 'error',
            message: `已选订单中，订单${order1.sn}与订单${order2.sn}所属门诊不一致，请保持所选诊所一致后，再次发起核对`
          } )
          return
        }
      }
    }
    let orderSns = orderList && orderList.map( val => val.sn ).join( ';' )
    this.$http( API.launchedAccountChecking, { orderSns } ).then( ( { data } ) => {
      let successOrderSns = data.successList && data.successList.map( val => val.orderSn )
      this.data.forEach( value => {
        if ( successOrderSns.indexOf( value.sn ) > -1 ) {
          value.settlementStatus = 1
        }
      } )
      if ( successOrderSns && !data.failedList.length ) {
        this.$notify( {
          type: 'success',
          message: '月结订单的核对已发起'
        } )
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
  getPaymentVoucherOrderItem ( v ) {
    return this.$http( API.getPaymentVoucherOrderItem, v ).then( res => {
      return res.data.data
    } )
  }
  paymentVoucherDialog: boolean = false
  paymentVoucherOfficeName: string = ''
  createPaymentVoucher ( v ) {
    if ( ( v.auditStatus == 1 || v.auditStatus == 3 ) && !v.orderType ) {
      this.$notify( {
        type: 'error',
        message: '该订单SaaS审核未通过！'
      } )
      return
    }
    if ( Object.keys( v ).length ) {
      let addPaymentVoucherItem = {}
      this.getPaymentVoucherOrderItem( { orderSns: v.sn } ).then( res => {
        let memberName = v.memberName
        let officeName = memberName ? memberName.slice( 0, memberName.lastIndexOf( ':' ) ) : ''
        addPaymentVoucherItem[ officeName ] = res
        localStorage.setItem( 'addPaymentVoucherItem', JSON.stringify( addPaymentVoucherItem ) )
        this.paymentVoucherOfficeName = officeName
        this.paymentVoucherDialog = true
      } )
    } else {
      let { tenantId, officeId, memberName } = ( this.paymentVoucherFilterData && this.paymentVoucherFilterData[ 0 ] )
      let bo = this.paymentVoucherFilterData.every( v => v.tenantId == tenantId && v.officeId == officeId && v.orderType == 0 && v.orderStatus == 0 && ( v.storeInfo && v.storeInfo.voucher ) )
      if ( bo ) {
        let addPaymentVoucherItem = {}
        this.getPaymentVoucherOrderItem( { orderSns: this.paymentVoucherFilterData.map( v => v.sn ).join() } ).then( res => {
          let officeName = memberName ? memberName.slice( 0, memberName.lastIndexOf( ':' ) ) : ''
          addPaymentVoucherItem[ officeName ] = res
          localStorage.setItem( 'addPaymentVoucherItem', JSON.stringify( addPaymentVoucherItem ) )
          this.paymentVoucherOfficeName = officeName
          this.paymentVoucherDialog = true
        } )

      } else {
        this.$notify( {
          type: 'warning',
          message: '请选择经过配置的未付款的且为相同门诊的普通订单'
        } )
      }
    }
  }

  @Watch( 'condition', { deep: true } )
  conditionWatcher ( cond: any[] ) { // 监听orderType变化控制settlementStatus状态
    let orderType, settlementStatus
    for ( let i = 0, l = cond.length; i < l; i++ ) {
      let con = cond[ i ]
      if ( con.key == 'orderType' ) {
        orderType = con
      } else if ( con.key == 'settlementStatus' ) {
        settlementStatus = con
      }
    }
    // if ( orderType.value === 1 ) {
    //   settlementStatus.disabled = false
    // } else {
    //   settlementStatus.disabled = true
    // }
  }
  data = []
  page: Page = {
    cur: 1,
    num: 50,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  linkSearch () { // 点击订单号 支付单号 重置url 快速查询
    this.initCondition()
    this.searchOrder()
  }
  sizeChange ( v ) {
    this.page.num = v
    this.searchOrder()
  }
  activated () {
    this.initCondition()
    this.searchOrder()
  }
  initCondition () {
    let query = this.$route.query
    this.condition.forEach( val => {
      let { key, type } = val
      val.value = query[ key ]
      if ( type == 'tenantSearch' ) {
        val.value = {
          name: query.tenantName,
          id: query.tenantId
        }
      } else if ( type == 'customerSearch' ) {
        val.value = {
          customerName: query.customerName,
          customerId: query.customerId
        }
      } else if ( type.indexOf( 'daterange' ) > -1 ) {
        if ( val.value && val.value[ 0 ] ) {
          let value = val.value
          val.value = []
          val.value[ 0 ] = new Date( value[ 0 ] )
          val.value[ 1 ] = new Date( value[ 1 ] )
        }
      } else if ( type == 'checkbox' ) {
        val.value = ( query[ key ] && query[ key ].length !== 0 && query[ key ].split( ',' ) ) || []
      } else if ( type == 'select' || type == 'radio' || type == 'storeSearch' ) {
        val.value = val.value && +val.value || ''
      }
    } )
  }
  @Inject() formatMyDate
  curChange ( cur ) {
    this.page.cur = cur
    this.searchOrder()
  }
  searchOrder ( cur?: number ) {
    this.$permissionValidateWithNotify( 526 )
    this.page.cur = cur || this.page.cur
    this.dataAdapter()
    let o = this.params
    this.$http( API.getOrderList, o ).then( ( { data } ) => {
      let d = data.orders || []
      d.forEach( val => {
        val.disabled = false
        val.isChecked = false
      } )
      this.data = d
      this.page.total = data.total
    } ).catch( err => {
      console.log( err )
    } )
  }
  params: any = {}
  dataAdapter () {
    let o: any = {}
    let route: any = {}
    o.start = ( this.page.cur - 1 ) * this.page.num
    o.num = this.page.num
    this.condition.forEach( val => {
      let { key, type, value } = val

      route[ key ] = value

      if ( type == 'tenantSearch' ) {
        route.tenantName = o.tenantName = value && ( value as any ).name
        route.tenantId = o.tenantId = value && ( value as any ).id
        delete route[ key ]
      } else if ( type == 'customerSearch' ) {
        route.customerName = o.customerName = value && ( value as any ).name
        route.customerId = o.customerId = value && ( value as any ).id
        delete route[ key ]
      } else if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          route[ key ] = []
          let myKeys = key == 'theDate' ? [ 'startDate', 'endDate' ] : [ 'startSendDate', 'endSendDate' ]
          route[ key ][ 0 ] = o[ myKeys[ 0 ] ] = this.formatMyDate( value[ 0 ] )
          route[ key ][ 1 ] = o[ myKeys[ 1 ] ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
        }
      } else if ( key == 'status' ) {
        if ( ( value as any ).length ) {
          ( value as any ).forEach( v => {
            o[ v ] = true
          } )
          route[ key ] = ( value as any ).join( ',' )
        } else {
          delete route[ key ]
        }
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        } else {
          delete route[ key ]
        }
      }
    } )
    this.routeChange( route )

    if ( o.orderType != -1 ) {
      if ( o.orderType === 1 ) {
        if ( o.settlementStatus === -1 ) {
          delete o.settlementStatus
        }
      }
    } else {
      delete o.orderType
    }
    if ( o.officeId ) {
      // delete o.tenantId
      // delete o.tenantName
      // delete o.officeId
      // delete o.officeName
      o.officeId = o.officeId + ''
    }
    this.params = o
  }
  routeChange ( query ) {
    this.$router.push( {
      path: '/order/search',
      query
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
<style lang="stylus" scoped>
.launch-order-check, .create-payment-voucher
  margin 0 0 20px 20px
</style>
