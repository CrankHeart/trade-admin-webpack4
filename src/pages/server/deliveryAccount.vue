<template>
  <div id="server-check-order-list">
    <lc-condition :condition="condition" @submit="search(1)" label-width="100px">
      <template slot="btn">
        <div style="float:left">
          <el-checkbox v-model="selectAll">全选</el-checkbox>
          <el-button type="default" @click="checkAccount" :disabled="canInitiateChecks">发起核对</el-button>
        </div>
      </template>
    </lc-condition>
    <delivery-list
      ref="deliveryList"
      :data="list"
      :pageInfo="this.page"
      :select-all="selectAll"
      @curChange="listCurChange"
      @sizeChange="listSizeChange"
      @selectChange="selectChange"
    ></delivery-list>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import { deliverySettlementStatus } from '@/pages/order/const/orderSearchCondition'
import lcTable from '../../components/table/index'
import { formatMyDate } from '../../utils/index'
import { statementStatus, checkStatus } from './const/serverConstant'
import { matchArrItem } from '../../utils'
import invoiceList from '@/pages/invoice/invoiceList.vue'
import deliveryList from '@/pages/server/components/deliveryList.vue'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../API'
@Component( {
  name: 'delivery-account',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    invoiceList,
    deliveryList
  }
} )
export default class deliveryAccount extends Vue {
  // @State( state => state.stores.storeListData ) storeListData
  // @Mutation( 'stores/setStoreListData' ) setStoreListData
  statementStatus = statementStatus
  accountCheckDialog: boolean = false
  detailCheckOrderPermissionId = 589
  deleteCheckOrderPermissionId = 591
  checkBankStatePermissionId = 592
  exportPermissionId = 593

  selectAll = false

  selected = [] // 选中的

  params: any = {}
  isShowInvoiceDialog: boolean = false
  selectStoreId = null
  currentRow: any = {}
  currentInvoice: any = {}
  noInvoice: boolean = false // 不选择发票
  currentTenant: any = { tenantId: null, officeId: null }
  config = [
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'accountCheckSn', label: '对账单号', width: '220px' },
    { prop: 'paymentAmount', label: '对账单金额', width: '120px' },
    { prop: 'initiateDate', label: '核对发起时间', width: '220px' },
    { prop: 'statementStatus', label: '状态', width: '120px' },
    { prop: 'control', label: '操作', fixed: 'right' }
  ]
  fromPortraitComponent: boolean = false
  condition = [
    { value: {}, key: 'tenant', label: '集团公司', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
    // { value: '', key: 'storeId', label: '经销商', type: 'storeSearch' },
    { value: [], key: 'initiateDate', label: '下单时间', type: 'daterange' },
    { value: '', key: 'orderSn', label: '订单号', type: 'text' },
    { value: [ 0 ], key: 'checkStatusList', label: '对账状态', type: 'checkbox', options: checkStatus },
    { value: [ 0 ], key: 'settlementStatusList', label: '结算状态', type: 'checkbox', options: deliverySettlementStatus }
  ]
  list = []
  selectedData = []
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  activated () {
    this.search()
  }
 
  get canInitiateChecks () {
    return !!this.selected.length ? false : true
  }

  selectChange ( list ) {
    this.selected = list
  }

  listSizeChange ( num ) {
    this.page.num = num
    this.page.cur = 1
    this.search()
  }

  listCurChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }
  get canDisabled () {
    if ( this.noInvoice == true ) {
      return false
    }
    return !this.currentInvoice || !this.currentInvoice.id
  }

  formatParam () {
    let { num, cur } = this.page
    // dimension, //（维度 1：出库单，2：订单）
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num,
      dimension: 1
    }
    this.condition.forEach( con => {
      let { type, key, value } = con
      if ( type == 'tenantSearch' || type == 'customerSearch' ) {
        param[`${key}Id`] = (value as any)[`${key}Id`]
        param[`${key}Name`] = (value as any)[`${key}Name`]
      } else if (key == 'initiateDate' ) {
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


  formatMyDate = formatMyDate
  checkAccount () {
    // 检测权限
    this.$permissionValidateWithNotifyEnv( 1174, 1170 )
    let rets = this.$refs.deliveryList.getSelected()
    if ( rets.length == 0 ) {
      return;
    }
    this.$confirm( '确认发起核对吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$http( API.launchAccountDelivery, {
        itemList: rets
      } ).then( ( { data } ) => {
        this.search()
        this.$notify( {
          type: 'success',
          message: data.msg
        } )
      } ).catch( err => {
        this.$notify( {
          type: 'error',
          message: err.data.msg || '未知错误'
        } )
      } )
    } )
  }

  invoiceChanged ( invoice ) {
    if ( invoice == -1 ) {
      this.noInvoice = true
      this.currentInvoice = { id: -1 }
    } else {
      this.noInvoice = false
      this.currentInvoice = invoice
    }
  }

  operSubmit () {
    if ( !this.currentInvoice.id ) {
      this.$notify( {
        type: 'warning',
        message: '请先选择一个发票信息'
      } )
      return false
    }
    let sn = this.currentRow.accountCheckSn
    this.$confirm( '确认核对对账单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$http( API.confirmStatement, {
        accountCheckSn: sn,
        userInvoiceDataId: this.currentInvoice.id
      } ).then( ( { data } ) => {
        this.currentRow.statementStatus = 1
        this.resetInvoiceInfo()
        this.$notify( {
          type: 'success',
          message: data.msg
        } )
      } ).catch( err => {
        console.log( err )
        this.$notify( {
          type: 'error',
          message: err.data.msg
        } )
      } )
    } )
  }

  resetInvoiceInfo () {
    this.currentTenant = { tenantId: null, officeId: null }
    this.currentInvoice = {}
    this.currentRow = {}
    this.isShowInvoiceDialog = false
    this.selectStoreId = null
  }

  getDataUrl = API.statementList

  search ( cur?: number ) {
    this.$permissionValidateWithNotifyEnv( 1175, 1171 )
    this.page.cur = cur || this.page.cur
    let params = this.formatParam()
    this.$http( API.items4Account, this.formatParam() ).then( ( { data } ) => {
      this.list = data.data.list
      this.page.total = data.data.total
    } )
  }

  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
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
        route.tenantId = o.tenantId = (value as any).id
        route.tenantName = o.tenantName = (value as any).name
        delete route[ key ]
      } else if ( type == 'customerSearch' ) {
        route.customerId = o.customerId = (value as any).id
        route.customerName = o.customerName = (value as any).name
        delete route[ key ]
      }else {
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
    // this.$router.push( {
    //   path: '/server/deliveryAccount',
    //   query
    // } )
  }

  formatInitiateDate ( initiateDate ) {
    if ( initiateDate && initiateDate.time ) {
      return this.formatMyDate( initiateDate.time )
    } else {
      return ''
    }
  }

  openDialogInvoiceList () {
  }

  confirmStatement ( row ) {
    let sn = row.accountCheckSn
    //这里在增加一个步骤,需要弹窗,然后选择一个发票信息
    let tenObj = { tenantId: row.tenantId, officeId: row.officeId }
    this.currentTenant = tenObj
    this.currentRow = row
    // 这里传入storeId,方便判断是否是自营店铺,自营店铺能开电子发票,其他不能开
    this.selectStoreId = row.storeId
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
        this.$notify({
          type: 'success',
          message: data.msg || '对账单作废成功！'
        })
        row.statementStatus = 4
      } ).catch( err => {
        this.$notify( {
          type: 'error',
          message: err.data.msg || '对账单作废失败！'
        } )
      } )
    } )

  }

  exportByAccountCheck ( row ) {
    let sn = row.accountCheckSn
    if ( sn.length === 0 ) return
    this.$submit( API.exportAccountCheck, {
      accountCheckSn: sn
    } )
  }
}
</script>
<style lang="stylus" scoped>
.check-order-button
  margin 10px
.control a
  cursor pointer
</style>
