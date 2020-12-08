<template>
  <div id="payment-voucher-list">
    <lc-condition :condition="orderCondition" @submit="search" label-width="100px">
      <template class="setInOutBtn" slot="btn">
        <el-button
          v-if="$permissionValidateWithEnv( 1212, 1208 )"
          type="primary"
          @click="addPaymentVoucher"
        >新建付款凭证</el-button>
      </template>
    </lc-condition>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="对账单模式" name="serviceModule"></el-tab-pane>
      <el-tab-pane label="订单模式" name="orderModule"></el-tab-pane>
    </el-tabs>
    <!-- <lc-table-config :base-config="baseConfig" @set-config="setPaymentVoucherListConfig"></lc-table-config> -->
    <lc-table
      :selection="false"
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="config.length"
      @data-selection-change="dataSelectionChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop == 'orderSn'">
          <template v-if="scope.row.dimension == 2">
            <div v-for="(v,i) in scope.row.voucherStatements" :key="i">
              {{v.accountCheckSn}}
              <!-- <i class="el-icon-warning" @click="showServiceData( scope.row.id, v.accountCheckSn)"></i> -->
            </div>
          </template>
          <template v-else>
            <span v-for="(v,i) in scope.row.voucherOrders" :key="i">
              <template v-if="i < 3 || scope.row.showMore">
                {{v.orderSn}}
                <br />
              </template>
            </span>
            <el-button
              v-if="scope.row.voucherOrders.length>3 && !scope.row.showMore"
              type="text"
              @click="scope.row.showMore = true"
            >查看更多>></el-button>
          </template>
        </template>
        <template
          v-else-if="scope.con.prop == 'voucherStatus'"
        >{{formatVoucherStatus(scope.row.voucherStatus)}}</template>
        <template
          v-else-if="scope.con.prop == 'createDate' || scope.con.prop == 'updateDate' ||scope.con.prop == 'actualPayDate'"
        >{{formatMyDate(scope.row[scope.con.prop] && scope.row[scope.con.prop].time)}}</template>
        <div
          class="button-class"
          v-else-if="scope.con.prop == 'control'"
          @click="openPaymentVoucherDialog(scope.row)"
        >
          <!-- 两个编辑的区别是 编辑审批信息 与 编辑核销信息 -->
          <el-button
            type="info"
            size="mini"
            v-if="( scope.row.voucherStatus == 0 || scope.row.voucherStatus == 2 ) && $permissionValidateWithEnv( permission.editPaymentVoucher )"
          >编辑</el-button>
          <el-button
            type="info"
            size="mini"
            v-if="( scope.row.voucherStatus <= 6 && scope.row.voucherStatus >= 3 && scope.row.voucherStatus !== 5 ) && $permissionValidateWithEnv( permission.editPaymentVerification )"
          >编辑</el-button>
          <el-button
            type="warning"
            size="mini"
            v-if="scope.row.voucherStatus == 1 && $permissionValidateWithEnv( permission.approvalPaymentVoucher )"
          >审批</el-button>
          <el-button
            type="primary"
            size="mini"
            v-if="scope.row.voucherStatus == 5 && $permissionValidateWithEnv( permission.verificationPaymentVoucher )"
          >核销</el-button>
          <el-button
            type="danger"
            size="mini"
            v-if="scope.row.voucherStatus !== 0 && scope.row.voucherStatus !== 7 && scope.row.voucherStatus !== 8 && !scope.row.writtenOffAmount && $permissionValidateWithEnv( permission.deletePaymentVoucher )"
          >作废</el-button>
          <el-button
            type="info"
            size="mini"
            v-if="$permissionValidateWithEnv( permission.detailPaymentVoucher )"
            @click.stop="openPaymentVoucherDialog(scope.row, true)"
          >查看</el-button>
        </div>
        <template v-else-if="['writtenOffAmount','amount'].includes(scope.con.prop)">
          <span v-price-info="scope.row[scope.con.prop]"></span>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog
      size="large"
      v-if="paymentVoucherDialog"
      v-model="paymentVoucherDialog"
      :title="dialogTitle"
      :close-on-click-modal="false"
    >
      <create-payment-voucher
        :id="itemId"
        :isCheck="isCheck"
        :orderType="activeName == 'serviceModule' ? 1 : 0"
        :reverseSign="reverseSign"
        :voucherStatus="itemVoucherStatus"
        @change-payment-voucher-dialog="changePaymentVoucherDialog"
        @delete-data-update="deleteDataUpdate"
      ></create-payment-voucher>
    </el-dialog>
    <el-dialog v-if="serviceDialog" v-model="serviceDialog" size="small">
      <lc-table :config="serviceConfig" :data="serviceList" :key="config.length" :hasPage="false">
        <template slot-scope="scope">
          <template v-if="scope.con.prop=='serviceSn'">
            <template v-if="scope.row.serviceSns && scope.row.serviceSns.length">
              <span v-for="(serviceSn,i) in scope.row.serviceSns" :key="i">
                {{serviceSn}}
                <br />
              </span>
            </template>
            <span v-else>暂无服务单</span>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { voucherStatuses } from '@/pages/server/const/paymentVoucherConst'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import lcTableConfig from '../../components/table/control.vue'
import { State, Mutation, Getter, Action } from 'vuex-class'
import { formatMyDate, matchArrItem, openNewWebWin } from '../../utils/index'

import createPaymentVoucher from './createPaymentVoucher.vue'
import API from '../../API'
@Component( {
  name: 'payment-voucher-list',
  components: {
    lcCondition,
    lcTable,
    lcTableConfig,
    createPaymentVoucher
  }
} )
export default class paymentVoucherList extends Vue {
  @Action( 'server/saveBankSnBatch' ) saveBankSnBatch
  @Mutation( 'order/setPaymentVoucherListConfig' ) setPaymentVoucherListConfig
  @Getter( 'order/paymentVoucherListConfig' ) baseConfig
  activeName = 'orderModule'
  // @Prop( { default: 0 } ) // 0 保存, 1 核销 ( 两个编辑的区别是 编辑审批信息 与 编辑核销信息 )
  // tabModule: number
  paymentVoucherDialog: boolean = false
  itemId: any = ''
  isCheck: boolean = false
  itemVoucherStatus: number = 0
  reverseSign: number = 0
  serviceDialog: boolean = false
  serviceList: any = []

  get permission () {
    // 这里权限有问题,要用新的权限,
    return {
      editPaymentVoucher: [ 1214, 1210 ], // 客户线下付款() 编辑付款凭证审批信息
      editPaymentVerification: [ 1221, 1217 ], // 编辑核销付款凭证
      approvalPaymentVoucher: [ 1214, 1211 ], // 审批付款凭证
      verificationPaymentVoucher: [ 1222, 1218 ], // 核销付款凭证
      deletePaymentVoucher: [ 1216, 1212 ], // 作废付款凭证
      detailPaymentVoucher: [ 1213, 1209 ] // 查看付款凭证
    }
    // if ( this.tabModule === 0 ) {
    //   return {
    //     editPaymentVoucher: 1067, // 客户线下付款() 编辑付款凭证审批信息
    //     editPaymentVerification: 1068, // 编辑付款凭证核销信息
    //     approvalPaymentVoucher: 1069, // 审批付款凭证
    //     verificationPaymentVoucher: 1070, // 核销付款凭证
    //     deletePaymentVoucher: 1071, // 作废付款凭证
    //     detailPaymentVoucher: 1072, // 查看付款凭证
    //   }
    // } else if ( this.tabModule === 1 ) {
    //   return {
    //     editPaymentVoucher: 1056, // (用户画像详情)编辑付款凭证审批信息
    //     editPaymentVerification: 1057, // 编辑付款凭证核销信息
    //     approvalPaymentVoucher: 1058, // 审批付款凭证
    //     verificationPaymentVoucher: 1059, // 核销付款凭证
    //     deletePaymentVoucher: 1061, // 作废付款凭证
    //     detailPaymentVoucher: 1060, // 查看付款凭证
    //   }
    // }
  }
  get dialogTitle () {
    if ( this.itemId == undefined ) {
      return '新建付款凭证'
    } else if ( this.isCheck ) {
      return '查看付款凭证'
    } else if ( this.itemVoucherStatus == 1 ) {
      return '审批付款凭证'
    } else if ( this.itemVoucherStatus == 5 ) {
      return '核销付款凭证'
    } else if ( this.itemVoucherStatus < 7 ) {
      return '编辑付款凭证'
    }
  }
  get config () {
    this.baseConfig.forEach( v => {
      if ( v.prop == 'orderSn' ) {
        v.label = this.activeName == 'serviceModule' ? '对账单号' : '订单号'
      }
    } )
    return this.baseConfig.filter( v => v.isChecked )
  }
  condition = [
    { value: {}, key: 'tenant', label: '集团公司', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
    { value: '', key: 'orderSn', label: '订单', type: 'text' },
    { value: '', key: 'voucherSn', label: '付款凭证编号', type: 'text' },
    { value: [], key: 'createDate', label: '创建日期', type: 'daterange' },
    { value: '', key: 'accountCheckSn', label: '对账单号', type: 'text' },
    { value: '', key: 'lcTradeSn', label: '商家流水号', type: 'text' },
    { value: [], key: 'updateDate', label: '最后更新日期', type: 'daterange' },
    { value: '', key: 'voucherStatus', label: '付款凭证状态', type: 'radio', options: voucherStatuses, col: { lg: 24, sm: 24 } },
  ]
  serviceConfig = [
    { prop: 'orderSn', label: '订单号' },
    { prop: 'serviceSn', label: '服务单' }
  ]
  get orderCondition () {
    // return this.tabModule ? this.condition.slice( 1 ) : this.condition
    return this.condition
  }
  data = []
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  @Watch( 'activeName' )
  activeNameWatcher ( v, o ) {
    this.data = []
    if ( v && o !== v && v != '' ) {
      this.page.cur = 1
      this.search()
    }
  }
  // created () {
  //    // console.log('created')
  //    // this.selectedActiveName()
  // }
  created () {
    this.search()
  }
  activated () {
    if ( !this.activeName || this.activeName == '0' ) {
      this.activeName = 'orderModule'
    }
    this.search()
  }
  // deactivated() {
  //   // this.activeName = ''
  // }
  // selectedActiveName(){
  //   // let { query, fullPath } = this.$route
  //   // let vipPath = fullPath.indexOf( '/vip/' ) > -1
  //   // let orderPath = fullPath.indexOf( '/order/' ) > -1
  //   this.activeName = 'orderModule'
  //   // this.activeName = ( query.orderType == '0' ? 'orderModule' : ( ( ( orderPath && this.$permissionValidate( 1073 ) )
  //   // || ( vipPath && this.$permissionValidate( 1055 ) ) ) && 'serviceModule' ) || ( this.$permissionValidate( 1074 ) && 'orderModule' ) ) || ''
  // }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.search()
  }
  formatMyDate = formatMyDate
  voucherStatuses = voucherStatuses
  formatVoucherStatus ( id ) {
    return matchArrItem( id, voucherStatuses, 'id' ).name
  }
  search ( cur?: number ) {
    // let { fullPath } = this.$route
    // let vipPath = fullPath.indexOf( '/vip/' ) > -1
    // let orderPath = fullPath.indexOf( '/order/' ) > -1
    // order下跟vip下面现在都取消了tab,所以后期这里可以删除了
    // if (
    //   ( !this.activeName || this.activeName == '0' ) ||
    //   ( this.activeName == 'orderModule' && !this.$permissionValidate( 1074 ) ) ||
    //   ( this.activeName == 'serviceModule' && orderPath && !this.$permissionValidate( 1073 ) ) ||
    //   ( this.activeName == 'serviceModule' && vipPath && !this.$permissionValidate( 1055 ) )
    // ) {
    //   return
    // }
    // let { tenant_id, office_id } = this.$route.query
    this.$permissionValidateWithNotifyEnv( 1211, 1207 )
    this.dataAdapter()
    // let userInfo = tenant_id ? { tenantId: tenant_id, officeId: office_id } : {}
    let o = { ...this.params, dimension: ( this.activeName == 'serviceModule' ) ? 2 : 1 }
    this.$http( API.getPaymentVoucherList, { ...o } ).then( ( { data } ) => {
      this.data = data.data.list && data.data.list.map( v => ( { ...v, showMore: false, disabled: true } ) )
      this.page.total = data.data.total
    } )
  }
  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }
  selectedData: any = []
  params: any = {}
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    this.condition.forEach( val => {
      let { key, value, type } = val
      if ( key == 'createDate' || key == 'updateDate' || key == 'submitDate' ) {
        if ( value && value[ 0 ] ) {
          let myKeys = key == 'createDate' ? [ 'createDateStart', 'createDateEnd' ] : key == 'updateDate' ? [ 'updateDateStart', 'updateDateEnd' ] : [ 'submitDateStart', 'submitDateEnd' ]
          o[ myKeys[ 0 ] ] = this.formatMyDate( value[ 0 ] )
          o[ myKeys[ 1 ] ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
        }
      } else if ( type == 'tenantSearch' ) {
        o.tenantId = ( value as any ).tenantId
        o.tenantName = ( value as any ).tenantName
      } else if ( type == 'customerSearch' ) {
        o.customerId = ( value as any ).customerId
        o.customerName = ( value as any ).customerName
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        }
      }
    } )

    this.params = o
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  openPaymentVoucherDialog ( item, isCheck ) {
    this.paymentVoucherDialog = true
    this.itemId = item.id
    this.isCheck = !!isCheck
    this.itemVoucherStatus = item.voucherStatus
    this.reverseSign = item.reverseSign
  }
  changePaymentVoucherDialog ( v ) {
    if ( !v.dialog ) return
    this.paymentVoucherDialog = false
    this.data = []
    this.search()
  }
  deleteDataUpdate ( v ) {
    this.search()
  }
  addPaymentVoucher () {
    // openNewWebWin(`receivable/searchPayment`,"searchPayment")
    this.$router.push( '/receivable/searchPayment' )
  }
  showServiceData ( id, accountCheckSn ) {
    this.$http( API.paymentVoucherDetail, { id } ).then( ( { data } ) => {
      let voucherStatements = data.data.voucherStatements.filter( v => v.accountCheckSn == accountCheckSn )[ 0 ]
      this.serviceList = voucherStatements && voucherStatements.orderList
      this.serviceDialog = true
    } )
  }
}
</script>
<style lang="stylus" scoped>
.button-class
  padding 5px 0
  .el-button
    +.el-button
      margin-left 0
    &:nth-child(2n)
      margin-left 5px
</style>
