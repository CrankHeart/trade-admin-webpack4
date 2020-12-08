<template>
  <div class="refund-application-record">
    <!-- 退款申请记录 -->
    <lc-condition :condition="condition" label-width="100px" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button
          type="primary"
          v-if="$permissionValidateWithEnv( 1240, 1236 )"
          @click="submitRefundApplication"
        >提交退款申请</el-button>
      </template>
    </lc-condition>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane
        v-for="item in refundTabs"
        :key="item.prop"
        :label="item.label"
        :name="item.prop"
      ></el-tab-pane>
    </el-tabs>
    <template>
      <el-button
        v-if="$permissionValidateWithEnv( exportPermission ) && data.length && (!exportStatus || exportStatus == 3)"
        type="primary"
        size="small"
        @click="exportOut"
        style="margin-bottom: 10px"
      >导出excel</el-button>
      <!-- <span v-else-if="exportStatus==4" style="margin-bottom: 10px">导出失败</span> -->
      <el-button
        v-else-if="exportStatus==1 || exportStatus==2"
        type="primary"
        size="small"
        :loading="true"
        style="margin-bottom: 10px"
      >导出中...</el-button>
    </template>
    <lc-table
      :selection="false"
      :config="config"
      :data="data"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <!-- 操作 -->
        <template v-if="scope.con.prop == 'control'">
          <el-button
            type="info"
            size="mini"
            v-if="$permissionValidateWithEnv( detailsPermission )"
            @click="refundDeatailsView(scope.row)"
          >查看</el-button>
        </template>
        <!-- 服务单号	 -->
        <template v-else-if="scope.con.prop == 'serviceSn'">
          <p v-for="item in scope.row['serviceSnList']" :key="item">{{item}}</p>
        </template>
        <!-- 对账单号	 -->
        <template v-else-if="scope.con.prop == 'accountCheckSn'">
          <p v-for="v in scope.row.voucherStatements" :key="v.accountCheckSn">{{v.accountCheckSn}}</p>
        </template>
        <!-- 付款凭证申请状态	 -->
        <template
          v-else-if="scope.con.prop == 'voucherStatus'"
        >{{formatVoucherStatus(scope.row.voucherStatus)}}</template>
        <!-- 付款凭证编号	-->
        <template v-else-if="scope.con.prop==='voucherSn'">
          <div
            v-for="flow of scope.row.transactionFlowList"
            :key="flow.paymentSn"
          >{{ flow.paymentSn }}</div>
        </template>
        <template
          v-else-if="['createDate', 'updateDate', 'actualPayDate'].includes(scope.con.prop)"
        >{{formatMyDate(scope.row[scope.con.prop] && scope.row[scope.con.prop].time)}}</template>
        <!-- 申请退款金额	 -->
        <template v-else-if="['amount'].includes(scope.con.prop)">
          <span v-price-info="scope.row[scope.con.prop]"></span>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <!-- 点击【查看】弹出此对话框 -->
    <refund-applycation-dialog
      v-if="isShowRefundApplicationDialog"
      :isShowRefundApplicationDialog.sync="isShowRefundApplicationDialog"
      :curListData="curRefundData"
      @update-list="updateList"
      @show-rv-detail="showRvDetail"
    ></refund-applycation-dialog>
    <!-- 付款凭证详情弹框（从上面的 dialog 里弹框） -->
    <refund-voucher-dialog
      v-if="isShowRefundVocherDialog"
      :isShowRefundVocherDialog.sync="isShowRefundVocherDialog"
      :voucherSn="voucherSn"
      :model="false"
    ></refund-voucher-dialog>
    <sync-export
      ref="syncExport"
      :exportUrl="exportUrl"
      :checkExportStatusUrl="checkExportStatusUrl"
      @taskAddSuc="taskAddSuc"
      @taskAddFail="taskAddFail"
      @taskOk="taskOk"
      @taskFail="taskFail"
    ></sync-export>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Mutation, Getter, Action } from 'vuex-class'
import { refundApplicationStatus, voucherStatuses } from '../../server/const/paymentVoucherConst'
import lcCondition from '@/components/condition.vue'
import lcTable from '../../../components/table'
import RefundVoucherDialog from "./refundVoucherDialog.vue";
import API from '../../../API'
import { matchArrItem } from '../../../utils/index'
import RefundApplycationDialog from './refundApplycationDialog.vue'
import SyncExport from '../../server/components/syncExport.vue'


@Component( {
  name: 'refund-application-record',
  components: {
    lcCondition,
    lcTable,
    RefundApplycationDialog,
    RefundVoucherDialog,
    SyncExport
  }
} )
export default class RefundApplicationRecord extends Vue {
  @Inject() formatMyDate
  @Getter( 'receivable/refundApplicationRecordConfig' ) baseConfig

  activeName: string = 'server'
  // 查看凭证详情，会从弹窗回传一个 sn 过来
  voucherSn: string = ''
  // 查看凭证详情，会从弹窗回传一个开启信号
  isShowRefundVocherDialog: boolean = false
  refundTabs: any[] = [
    { prop: 'server', label: '按服务单申请', dim: 3 },
    { prop: 'account', label: '按对账单申请', dim: 2 },
    { prop: 'voucher', label: '按付款凭证申请', dim: 4 },
  ]
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  data: any[] = []
  isShowRefundApplicationDialog: boolean = false
  curRefundData = {}
  exportUrl = API.paymentVoucherExport
  checkExportStatusUrl = API.getBatchJobResult
  exportStatus: any = null
  jobId: any
  filePath: string

  get is3rdParty () {
    return this.$store.getters[ 'stores/is3rdParty' ]
  }
  // 搜索表单
  get condition () {
    const formItems: any[] = [
      { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
      { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
      { value: '', key: 'voucherSn', label: '退款申请编号', type: 'text' },
      { value: '', key: 'serviceSn', label: '服务单号', type: 'text' },
      { value: '', key: 'accountCheckSn', label: '对账单号', type: 'text' },
      { value: '', key: 'paymentSn', label: '付款凭证编号', type: 'text' },
      { value: '', key: 'refundNo', label: '退款流水号', type: 'text' },
      { value: [], key: 'createDate', label: '创建日期', type: 'daterange' },
      { value: [], key: 'updateDate', label: '最后更新日期', type: 'daterange' },
      { value: '', key: 'voucherStatus', label: '状态', type: 'radio', col: { lg: 24, sm: 24 }, options: refundApplicationStatus }
    ]
    // 第三方，去掉 4 个选项
    if ( this.is3rdParty ) {
      formItems.splice( 2, 4 )
    }
    return formItems
  }

  get config () {
    const item = this.baseConfig
      .find( v => [ 'serviceSn', 'accountCheckSn', 'voucherSn' ].includes( v.prop ) )
    if ( this.activeName == "server" ) {
      Object.assign( item, {
        label: '服务单号',
        prop: 'serviceSn'
      } )
    } else if ( this.activeName == "account" ) {
      Object.assign( item, {
        label: '对账单号',
        prop: 'accountCheckSn'
      } )
    } else {
      Object.assign( item, {
        label: '付款凭证编号',
        prop: 'voucherSn'
      } )
    }
    return this.baseConfig.filter( v => v.isChecked )
  }
  /**
   * 导出权限控制
   */
  get exportPermission () {
    switch ( this.activeName ) {
      case 'server':
        return [ 1241, 1237 ]
      case 'account':
        return [ 1242, 1238 ]
      case 'voucher':
        return [ 1283, 1283 ]
      default:
        return null
    }
  }
  /**
   * 查看详情权限控制
   */
  get detailsPermission () {
    switch ( this.activeName ) {
      case 'server':
        return [ 1243, 1239 ]
      case 'account':
        return [ 1244, 1240 ]
      case 'voucher':
        return [ 1284, 1284 ]
      default:
        return null
    }
  }

  formatVoucherStatus ( id ) {
    return matchArrItem( id, refundApplicationStatus, 'id' ).name
  }

  // 付款凭证详情弹框
  showRvDetail ( evt ) {
    this.voucherSn = evt.voucherSn
    this.isShowRefundVocherDialog = evt.isShowRefundVocherDialog
  }

  params: any = {}
  dataAdapter () {
    let o: any = { dimension: this.refundTabs.find( v => v.prop === this.activeName ).dim, financialType: 2 }
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

  created () {
    this.search()
  }

  activated () {
    this.search()
  }

  @Watch( 'activeName' )
  activeNameWatcher ( v, o ) {
    // this.data = []
    this.exportStatus = null
    if ( v && o !== v && v != '' ) {
      this.page.cur = 1
      this.search()
    }
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

  search () {
    this.$permissionValidateWithNotifyEnv( 1239, 1235 )
    this.dataAdapter()
    this.$http( API.refundList, { ...this.params } )
      .then( ( { data } ) => {
        this.data = data.data.list
        this.page.total = data.data.total
      } )
  }

  updateList () {
    this.search()
  }

  submitRefundApplication () {
    this.$router.push( '/receivable/submitRefundApply' )
  }

  refundDeatailsView ( data ) {
    this.curRefundData = data
    this.isShowRefundApplicationDialog = true
  }

  exportOut () {
    // this.$submit( API.exportApplyDetail, { } )
    const syncExport = this.$refs.syncExport
    if ( !syncExport ) {
      return
    }
    ( syncExport as any ).addTask( { ...this.params } )
  }
  taskAddSuc ( info ) {
    let jobId = info.jobId
    this.exportStatus = info.exportStatus
    this.jobId = jobId
  }
  taskAddFail ( err ) {
    this.$message( {
      type: 'error',
      message: err.msg || '导出任务失败'
    } )
  }
  taskOk ( okJobs ) {
    this.exportStatus = okJobs[ 0 ].exportStatus
    this.filePath = okJobs[ 0 ].filePath
    window.open( this.filePath )
  }
  taskFail ( failJobs ) {
    this.exportStatus = failJobs[ 0 ].exportStatus
    // ? 暂时设定导出失败提示关闭时按钮变回导出按钮
    this.$notify( {
      type: 'error',
      message: '导出失败',
      onClose: () => this.exportStatus = null
    } )
  }
}
</script>
