<template>
  <div id="server-check-order-list">
    <!-- <lc-title v-if="!fromPortraitComponent" :text="title"></lc-title> -->
    <lc-condition :condition="condition" @submit="search(1)" label-width="100px">
      <template slot="btn">
        <el-button
          class="counterattack-btn"
          type="warning"
          @click="counterattackAccount"
          v-if="$permissionValidateWithEnv(1265, 1256)"
        >抵冲</el-button>
      </template>
    </lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="config.length"
      selection
      @data-selection-change="selectionChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop==='initiateDate'">{{ formatInitiateDate(row[con.prop]) }}</template>
        <template v-else-if="['paymentAmount'].includes(con.prop)">
          <span v-price-info="row[con.prop]"></span>
        </template>
        <template
          v-else-if="con.prop === 'statementStatus'"
        >{{formatStatementStatus(row[con.prop])}}</template>
        <template v-else-if="con.prop === 'control'">
          <!-- <router-link :to="`/server/checkOrder/detail/${row['orderSn']}`" v-if="$permissionValidate(589)">查看详情</router-link> -->
          <div class="control">
            <el-button
              type="primary"
              size="mini"
              v-if="$permissionValidate(detailCheckOrderPermissionId)"
              @click.stop="viewStatementDetail(row)"
            >查看</el-button>
            <el-button
              type="primary"
              size="mini"
              v-if="$permissionValidate(checkBankStatePermissionId) && row.statementStatus === 0"
              @click.stop="confirmStatementBefore( row )"
            >确认核对</el-button>
            <el-button
              type="danger"
              size="mini"
              v-if="$permissionValidate(deleteCheckOrderPermissionId) && (row.statementStatus === 0||row.statementStatus === 1)"
              @click.stop="obsoleteStatement( row )"
            >作废</el-button>
            <template v-if="!row.exportStatus || row.exportStatus==0">
              <el-button
                type="primary"
                size="mini"
                v-if="$permissionValidate(exportPermissionId) && [0, 1, 2, 3].indexOf( row.statementStatus ) > -1"
                @click.stop="exportByAccountCheck( row )"
              >导出</el-button>
            </template>
            <template v-else-if="row.exportStatus==3">
              <el-button type="primary" size="mini" @click.stop="downLoad( row.exportUrl )">下载</el-button>
            </template>
            <template v-else-if="row.exportStatus==4">
              <span>导出失败</span>
            </template>

            <template v-else>
              <el-button type="primary" size="mini" :loading="true">导出中...</el-button>
            </template>

            <template v-if="!(row.storeInfo&&row.storeInfo.voucher)&&row.statementStatus===1">
              <el-button size="mini" @click="updateSettlementStatusConfirm(row)">结算</el-button>
            </template>
          </div>
        </template>

        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <invoice-selecter-dialog
      btnStr="确认核对"
      title="选择发票信息"
      :visible.sync="isShowInvoiceDialog"
      :tenantInfo="currentTenant"
      :selectStoreId="selectStoreId"
      :canSelectParams="canSelectParam"
      @invoice-selected="invoiceSelected"
    ></invoice-selecter-dialog>
    <syncExport
      ref="syncExport"
      :exportUrl="exportUrl"
      :checkExportStatusUrl="checkExportStatusUrl"
      @taskAddSuc="taskAddSuc"
      @taskAddFail="taskAddFail"
      @taskOk="taskOk"
      @taskFail="taskFail"
    ></syncExport>
    <el-dialog class="counterattack-dialog" title="抵冲确认" :visible.sync="dialogVisible" size="tiny">
      <p>请确认核销对账单</p>
      <p v-for="item in selectedLists" :key="item.id">
        <span>{{item.accountCheckSn}}</span>&nbsp;&nbsp;
        <span>{{item.paymentAmount}}</span>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import syncExport from '@/pages/server/components/syncExport.vue'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import { formatMyDate } from '../../utils/index'
import { statementStatus } from './const/serverConstant'
import { matchArrItem } from '../../utils'
import invoiceSelecterDialog from '@/pages/invoice/invoiceSelecterDialog.vue'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../API'
import { Object } from 'core-js';
@Component( {
  name: 'server-check-order-list',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    invoiceSelecterDialog,
    syncExport
  }
} )
export default class MonthCustomerAccount extends Vue {
  title = '月结客户对账'
  statementStatus = statementStatus
  accountCheckDialog: boolean = false
  detailCheckOrderPermissionId = 589
  deleteCheckOrderPermissionId = 591
  checkBankStatePermissionId = 592
  exportPermissionId = 593
  isShowInvoiceDialog: boolean = false
  selectStoreId = null
  currentRow: any = {}
  currentInvoice: any = {}
  noInvoice: boolean = false // 不选择发票
  currentTenant: any = { tenantId: null, officeId: null }
  canSelectParam: any = {} // 发票类型是否可切换条件传参
  config = [
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'accountCheckSn', label: '对账单号', width: '220px' },
    { prop: 'paymentAmount', label: '对账单金额', width: '120px' },
    { prop: 'initiateDate', label: '核对发起时间', width: '220px' },
    { prop: 'statementStatus', label: '状态', width: '120px' },
    { prop: 'salesSupport', label: '销售支持', width: '220px' },
    { prop: 'control', label: '操作', fixed: 'right' }
  ]
  // 在 客户中心 中的tab页中不展示lc-title组件
  fromPortraitComponent: boolean = false
  condition = [
    { value: '', key: 'accountCheckSn', label: '对账流水号', type: 'text' },
    { value: '', key: 'orderSn', label: '订单号', type: 'text' },
    { value: {}, key: 'tenant', label: '集团公司', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
    { value: [], key: 'initiateDate', label: '核对发起时间', type: 'daterange' },
    { value: '', key: 'salesSupport', label: '销售支持', type: 'text' },
    { value: '', key: 'statementStatus', label: '状态', type: 'radio', col: { lg: 16, sm: 16 }, options: statementStatus },
  ]
  data = []
  selectedLists = []
  exportUrl = API.exportAccountCheck
  checkExportStatusUrl = API.getBatchJobResult

  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  taskAddSuc ( info ) {
    let jobId = info.jobId
    let sn = info.accountCheckSn
    let exportItem = this.data.find( item => item.accountCheckSn == sn );
    if ( exportItem ) {
      exportItem.exportStatus = info.exportStatus
      exportItem.jobId = jobId
    }
  }
  taskAddFail ( err ) {
    this.$message( {
      type: 'error',
      message: err.msg
    } )
  }
  taskOk ( okJobs ) {
    okJobs.forEach( itemOk => {
      let exportItem = this.data.find( item => item.jobId == itemOk.jobId );
      if ( exportItem ) {
        exportItem.exportStatus = itemOk.exportStatus
        exportItem.exportUrl = itemOk.filePath
      }
    } )
  }
  taskFail ( failJobs ) {
    failJobs.forEach( itemFail => {
      let exportItem = this.data.find( item => item.jobId == itemFail.jobId );
      if ( exportItem ) {
        exportItem.exportStatus = itemFail.exportStatus
      }
    } )
  }
  downLoad ( url ) {
    window.open( url )
  }
  exportByAccountCheck ( row ) {
    let sn = row.accountCheckSn
    if ( sn.length === 0 ) return
    if ( this.$refs.syncExport ) {
      ( this.$refs.syncExport as any ).addTask( { accountCheckSn: sn } )
    }
  }
  activated () {
    this.search()
  }
  created () {
    console.log( "xxxxxxx created" );
    this.search()
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.search()
  }
  invoiceSelected ( invoice ) {
    this.currentInvoice = invoice
    this.operSubmit( false )
  }
  formatMyDate = formatMyDate
  formatStatementStatus ( id ) {
    return matchArrItem( id, statementStatus, 'id' ).name
  }
  operSubmit ( needConfirm = true ) {
    if ( !this.currentInvoice.id ) {
      this.$notify( {
        type: 'warning',
        message: '请先选择一个发票信息'
      } )
      return false
    }
    let sn = this.currentRow.accountCheckSn
    let params = { accountCheckSn: sn, userInvoiceDataId: this.currentInvoice.id }
    if ( needConfirm ) {
      this.$confirm( '确认核对对账单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      } ).then( () => {
        this.confirmStatementRemote( params )
      } )
    } else {
      this.confirmStatementRemote( params )
    }
  }

  confirmStatementRemote ( params ) {
    this.$http( API.confirmStatement, params ).then( ( { data } ) => {
      this.currentRow.statementStatus = 1
      this.resetInvoiceInfo()
      this.$notify( {
        type: 'success',
        message: data.msg
      } )
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg
      } )
    } )
  }

  resetInvoiceInfo () {
    this.currentTenant = { tenantId: null, officeId: null }
    this.currentInvoice = {}
    this.currentRow = {}
    this.selectStoreId = null
    this.canSelectParam = {}
  }
  getDataUrl = API.statementList
  search ( cur?: number ) {
    console.log( "xxxxx search" );

    this.$permissionValidateWithNotify( 588 )
    this.page.cur = cur || this.page.cur

    this.$http( this.getDataUrl, this.formatParam() ).then( ( { data } ) => {
      this.data = data.list
      // 加上导出的状态标识
      this.data = this.data.map( item => {
        return { ...item, exportStatus: 0 }
      } )
      this.page.total = data.total
    } )
  }
  formatParam () {
    let { num, cur } = this.page
    // dimension, //（维度 1：出库单，2：订单）
    let o: any = {
      start: ( cur - 1 ) * num,
      num: num
    }
    let route: any = {}
    this.condition.forEach( val => {
      let { key, value, type } = val
      route[ key ] = value
      if ( key == 'initiateDate' ) {
        route[ key ] = []
        if ( value && value[ 0 ] ) {
          o[ 'initiateDateBegin' ] = route[ 'initiateDateBegin' ] = this.formatMyDate( value[ 0 ], 'yyyy-MM-dd hh:mm:ss' )
          o[ 'initiateDateEnd' ] = route[ 'initiateDateEnd' ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          // delete o[ key ]
        }
      } else if ( type == 'tenantSearch' ) {
        route.tenantId = o.tenantId = ( value as any ).tenantId
        route.tenantName = o.tenantName = ( value as any ).tenantName
        delete route[ key ]
      } else if ( type == 'customerSearch' ) {
        route.customerId = o.customerId = ( value as any ).customerId
        route.customerName = o.customerName = ( value as any ).customerName
        delete route[ key ]
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        } else {
          delete route[ key ]
        }
      }
    } )
    return o
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  formatInitiateDate ( initiateDate ) {
    if ( initiateDate && initiateDate.time ) {
      return this.formatMyDate( initiateDate.time )
    } else {
      return ''
    }
  }
  viewStatementDetail ( row ) {
    let sn = row.accountCheckSn
    this.$router.push( {
      path: `/server/statementDetail/${sn}`
    } )
  }
  confirmStatementBefore ( row ) {
    // 先检测是随货还是
    // allInvoiced  ：0 :没全部开票  1：全部开票
    this.$http( API.checkIfAllInvoiced, {
      accountCheckSn: row.accountCheckSn
    } ).then( ( { data } ) => {
      // 如果全部开票了,不需要再次弹窗确认,但是要传后台一个发票id并且id=-1
      if ( data.data.allInvoiced == 1 ) {
        this.currentRow = row
        // 后端要求传入id=-2,作为处理条件
        this.currentInvoice = { id: -2 }
        this.operSubmit( true )
      } else {
        this.confirmStatement( row )
      }
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '对账单类型检测失败！'
      } )
    } )
  }

  params: any = {}
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    let route: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      route[ key ] = value
      if ( key == 'initiateDate' ) {
        route[ key ] = []
        if ( value && value[ 0 ] ) {
          o[ 'initiateDateBegin' ] = route[ 'initiateDateBegin' ] = this.formatMyDate( value[ 0 ], 'yyyy-MM-dd hh:mm:ss' )
          o[ 'initiateDateEnd' ] = route[ 'initiateDateEnd' ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          // delete o[ key ]
        }
      } else if ( key == 'office' ) {
        let officeValue: any = value || {}
        let { officeId, officeName, tenantId, tenantName } = officeValue
        route.tenantId = o.tenantId = tenantId
        if ( officeId ) {
          route.officeId = o.officeId = officeId
        }
        delete route[ key ]
      } else {
        if ( value !== '' ) {
          o[ key ] = value
        } else {
          delete route[ key ]
        }
      }
    } )
    this.params = o
    this.routeChange( route )
  }
  routeChange ( query ) {
    this.$router.push( {
      path: '/server/monthCustomerAccount',
      query
    } )
  }
  confirmStatement ( row ) {
    let sn = row.accountCheckSn
    // 这里在增加一个步骤,需要弹窗,然后选择一个发票信息
    let tenObj = { tenantId: row.tenantId, officeId: row.officeId }
    this.currentTenant = tenObj
    this.currentRow = row
    // 这里传入storeId,方便判断是否是自营店铺,自营店铺能开电子发票,其他不能开
    this.selectStoreId = row.storeId
    this.canSelectParam = { dimension: row.dimension }
    this.isShowInvoiceDialog = true
  }
  obsoleteStatement ( row ) {
    this.$permissionValidateWithNotify( this.deleteCheckOrderPermissionId )
    this.$confirm( '确认作废对账单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let sn = row.accountCheckSn
      this.$http( API.obsoleteStatement, {
        accountCheckSn: sn
      } ).then( ( { data } ) => {
        this.$notify( {
          type: 'success',
          message: data.msg || '对账单作废成功！'
        } )
        row.statementStatus = 4
      } ).catch( err => {
        this.$notify( {
          type: 'error',
          message: err.data.msg || '对账单作废失败！'
        } )
      } )
    } )
  }
  updateSettlementStatusConfirm ( item ) {
    this.$confirm( '此操作将会使订单状态更新为已结算, 是否继续?', '结算提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.updateSettlementStatus( item )
    } ).catch( () => {

    } )
  }
  updateSettlementStatus ( item ) {
    this.$http( API.updateSettlementStatus, {
      accountCheckSn: item.accountCheckSn,
      broadcast: true
    } ).then( res => {
      item.statementStatus = 3
      this.$emit( 'reload' )
    } )
  }
  selectionChange ( items ) {
    console.log( items )
    if ( items.length > 2 ) {
      items.shift()
    }
    this.selectedLists = items
  }
  counterattackAccount () {
    if ( this.selectedLists.length !== 2 ) {
      this.$notify( {
        message: '请选择两个对账单进行抵冲',
        type: 'error'
      } )
      return
    }
    const sum = this.selectedLists.reduce( ( total, cur ) => {
      total += cur.paymentAmount
      return total
    }, 0 )
    if ( sum !== 0 ) {
      this.$notify( {
        message: '对账单金额之和不为0',
        type: 'error'
      } )
    }
    this.dialogVisible = true
  }
  dialogVisible = false
  cancel () {
    this.dialogVisible = false
  }
  confirm () {
    this.dialogVisible = false
    const checkSnList = this.selectedLists.map( item => item.accountCheckSn )
    this.$http( API.hedgeStatement, { checkSnList } ).then( ( { data } ) => {
      this.$notify( {
        message: data.msg,
        type: 'success'
      } )
    } ).catch( err => {
      this.$notify( {
        message: err.data.msg,
        type: 'error'
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.check-order-button
  margin 10px
.control
  button
    margin-right 10px
    +button
      margin-left 0
  a
    cursor pointer
.counterattack-dialog
  p
    line-height 2
</style>
