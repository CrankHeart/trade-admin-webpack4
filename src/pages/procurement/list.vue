<template>
  <div id="procurement-list">
    <lc-title text="采购列表">
      <slot>
        <el-button
          v-if="$permissionValidate(620)"
          type="primary"
          class="pull-right"
          @click="createProcurement"
        >新建采购单</el-button>
      </slot>
    </lc-title>
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button v-if="$permissionValidate(624)" type="primary" @click="exportExcel">导出</el-button>
      </template>
    </lc-condition>
    <!-- <lc-table-config :base-config="baseConfig"></lc-table-config> -->
    <lc-table-config :base-config="baseConfig" @set-config="setContrlConfig" />
    <lc-table
      :config="showBaseConfig"
      :data="myData"
      @cur-change="curChange"
      @size-change="sizeChange"
      :page="page"
      :key="showBaseConfig.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop==='createDate' || scope.con.prop==='supplierDeliveryDate'"
        >{{formatDate(scope.row[scope.con.prop])}}</template>
        <template v-else-if="scope.con.prop==='procurementSn'">
          <span
            class="procurementSn"
            @click="control('detail', scope.row)"
          >{{scope.row[scope.con.prop]}}</span>
        </template>
        <template v-else-if="scope.con.prop==='sourceOrderSn'">
          <span
            class="procurementSn"
            @click="control('detail', {deliverySource: scope.row.deliverySource,procurementSn:code})"
            v-for="(code,index) in scope.row[scope.con.prop].split(',')"
            :key="code"
          >
            <span v-if="index">,</span>
            {{code}}
          </span>
        </template>
        <template v-else-if="scope.con.prop==='planState' ">{{formatStatus(scope.row.planState)}}</template>
        <template v-else-if="scope.con.prop==='wareHouse' ">{{formatWareHouse(scope.row.wareHouse)}}</template>
        <template
          v-else-if="scope.con.prop==='deliverySource' "
        >{{formatDeliverySource(scope.row.deliverySource)}}</template>
        <template
          v-else-if="scope.con.prop==='settlementMethod' "
        >{{formatSettlementMethod(scope.row.settlementMethod)}}</template>
        <template v-else-if="scope.con.prop==='payState' ">{{formatPayState(scope.row.payState)}}</template>
        <template v-else-if="scope.con.prop==='control' ">
          <div class="control">
            <el-button
              type="info"
              v-if="$permissionValidate(621) && (scope.row.planState === 0 || scope.row.planState === 7)"
              @click="control('edit',scope.row)"
              size="mini"
            >编辑</el-button>
            <el-button
              type="success"
              v-if="$permissionValidate(622) && (scope.row.planState === 0 || scope.row.planState === 7)"
              @click="submitPurchase(scope.row)"
              size="mini"
            >提交</el-button>
            <!-- <el-button
              type="danger"
              v-if="$permissionValidate(623)"
              @click="delPurchase(scope.row)"
              size="mini"
            >删除</el-button>-->
            <!-- <el-button type="info" @click="control('detail', scope.row)" size="mini">查看</el-button> -->
            <!-- 条件待确定 -->
            <el-button
              type="danger"
              v-if="$permissionValidate(625) && (scope.row.planState === 0 || scope.row.planState === 1 || scope.row.planState === 5 || scope.row.planState === 7)"
              @click="cancelProcurement(scope.row)"
              size="mini"
            >取消</el-button>
            <!-- <el-button
              type="danger"
              v-if="$permissionValidate(626) && scope.row.planState===3 && scope.row.payState !== 3"
              size="mini"
              @click="settleProcurement(scope.row)"
            >结算</el-button>-->
            <el-button
              v-if="$permissionValidateWithEnv(1279, 1270) && (scope.row.planState === 5 || scope.row.planState === 6)"
              type="info"
              @click="approveLine(scope.row)"
              size="mini"
            >审核</el-button>
            <el-button
              type="primary"
              @click="myExport(scope.row.procurementSn)"
              v-if="$permissionValidate(624)"
              size="mini"
            >导出</el-button>
          </div>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <lc-dialog
      v-model="showApprove"
      title="审核"
      @confirm="approveConfirm"
      :dataset="approveConfirmConfig"
    >
      <lc-dataset :dataset="approveConfirmConfig"></lc-dataset>
    </lc-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTableConfig from '../../components/table/control.vue'
import lcTable from '../../components/table/index'
import { matchArrItem } from '../../utils/'
import { Mutation, Getter, Action, State } from 'vuex-class'
import tablePage from "./public/tablePage"
import approveConfirmConfig from './list/detail/approveConfirmConfig'
import {
  deliverySources,
  planStates,
  wareHouses,
  settlementMethods,
  payStates,
  procurementListConfig
} from './const/index'

@Component( {
  name: 'procurement-list',
  mixins: [ tablePage ],
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig
  }
} )
export default class ProcurementList extends Vue {
  @Action( 'supplier/getAllSuppliers' ) getAllSuppliers
  @State( state => state.supplier.supplierList ) supplierList
  @State( state => state.login.token ) accessToken;
  @State( state => state.login.memberId ) memberId;
  // @State( state => state.procurement.procurementListConfig ) baseConfig
  // @Getter('supplier/supplierObj') supplierObj
  baseConfig = procurementListConfig
  showBaseConfig = []
  condition = [
    { value: '', key: 'procurementSn', label: '采购编号', type: 'text' },
    { value: '', key: 'suppliers', label: '供应商', type: 'select', options: [] },
    { value: '', key: 'lcSkuCode', label: 'sku编码', type: 'text' },
    { value: '', key: 'createPerson', label: '采购员', type: 'text' },
    { value: '', key: 'wareHouse', label: '入库仓', type: 'select', options: wareHouses },
    { value: [], key: 'createDate', label: '采购日期', type: 'daterange' },
    { value: '', key: 'deliveryDateEnd', label: '最晚交期', type: 'date' },
    { value: '', key: 'deliverySource', label: '发货方式', type: 'select', options: deliverySources },
    { value: '', key: 'payState', label: '付款状态', type: 'select', options: payStates },
    { value: '', key: 'planState', label: '采购状态', type: 'select', options: planStates },
    { value: '', key: 'sourceOrderSn', label: '来源单号', type: 'text' }
  ]
  approveConfirmConfig

  activated () {
    this.getAllSuppliers().then( () => {
      let supplierOption: any = this.condition[ 1 ]
      supplierOption.options = this.supplierList.map( ( { id, name } ) => ( {
        id: name,
        name
      } ) )
    } )
    this.search()
  }

  myData: any[] = []
  showApprove = false
  @Inject() formatMyDate

  formatStatus ( status ) {
    return matchArrItem( status, planStates, 'id' ).name
  }
  formatSettlementMethod ( settlementMethod ) {
    return matchArrItem( settlementMethod, settlementMethods, 'id' ).name
  }
  formatPayState ( payState ) {
    return matchArrItem( payState, payStates, 'id' ).name
  }
  formatDeliverySource ( deliverySource ) {
    return matchArrItem( deliverySource, deliverySources, 'id' ).name
  }
  formatWareHouse ( wareHouse ) {
    return matchArrItem( wareHouse, wareHouses, 'id' ).name
  }
  formatDate ( date ) {
    let time = date && date.time
    if ( !time ) return
    return this.formatMyDate( time, 'yyyy-MM-dd' )
  }
  formatOption () {
    let o: any = {}
    let date = [ 'supplierDeliveryDate', 'createDate', 'deliveryDateEnd' ]
    this.condition.forEach( v => {
      if ( v.value !== '' ) {
        o[ v.key ] = v.value
      }
    } )

    date.forEach( prop => {
      if ( o[ prop ] && o[ prop ][ 0 ] ) {
        o[ prop + 'Start' ] = this.formatMyDate( o[ prop ][ 0 ] )
        o[ prop + 'End' ] = this.formatMyDate( o[ prop ][ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
        delete o[ prop ]
      } else if ( o[ prop ] && o[ prop ] instanceof Date ) {
        o[ prop ] = this.formatMyDate( o[ prop ], 'yyyy-MM-dd hh:mm:ss', true )
      } else if ( o[ prop ] && !o[ prop ][ 0 ] ) {
        delete o[ prop ]
      }
    } )
    o.num = this.page.num
    o.start = ( this.page.cur - 1 ) * o.num
    return o
  }

  created () {
    this.approveConfirmConfig = this.$dataSet( approveConfirmConfig )
    this.approveConfirmConfig.value = {}
    this.baseConfig.forEach( item => {
      item.isChecked = true
    } )
  }

  currentRecord

  approveLine ( record ) {
    this.showApprove = true
    this.currentRecord = record
  }

  approveConfirm () {
    let form = this.approveConfirmConfig.value
    if ( form.auditState === '' || form.auditState === undefined ) {
      this.$notify.error( {
        message: '请选择审核类型'
      } );
      return
    }
    let params = {
      broadcast: true,
      procurementSn: this.currentRecord.procurementSn,
      remark: form.remark,
      auditState: form.auditState
    }
    let state = form.auditState
    this.$http( API.procurementListApprove, params ).then( ( { data } ) => {
      if ( state === 1 ) {
        if ( this.currentRecord.planState === 5 ) {
          this.currentRecord.planState = 1
        } else {
          this.currentRecord.planState = 4
        }
      } else {
        if ( this.currentRecord.planState === 5 ) {
          this.currentRecord.planState = 7
        } else {
          this.currentRecord.planState = 1
        }
      }
    } )
  }

  search () {
    this.$permissionValidateWithNotify( 619 )
    this.$http( API.selectProcurement, this.formatOption() ).then( ( { data } ) => {
      let d = data.data || {}
      this.myData = d.list
      this.page.total = d.total
    } )
  }

  setContrlConfig ( config ) {
    let list = []
    this.baseConfig.forEach( item => {
      let index = config.indexOf( item.prop )
      if ( index > -1 ) {
        list.push( item )
      }
    } );
    this.showBaseConfig = list
  }

  control ( type: 'edit' | 'detail', item ) {
    // if (type == 'edit' || type == 'detail') {
    this.$router.push( `/procurement/${type}/${item.procurementSn}?deliverySource=${item.deliverySource}` )
    // } else if (type == 'submit') {
    //   this.submitPurchase(item)
    // } else if (type == 'delete') {
    //   this.delPurchase(item)
    // }
  }
  createProcurement () {
    this.$router.push( '/procurement/commomProcurement' )
    // this.$router.push( `/procurement/create?deliverySource=0` )
  }
  submitPurchase ( item ) {
    this.$confirm( '请确认是否提交采购单审核', '提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let { planSkuDetails, ...myItem } = item
      delete myItem.memberOrders
      delete myItem.deliveryOrders
      delete myItem.remarkJson
      delete myItem.remarkVOS
      delete myItem.subPurchaseOrderVOS
      delete myItem.createDate
      if ( planSkuDetails && planSkuDetails.length > 0 ) {
        planSkuDetails.forEach( element => {
          element.firstDeliveryDate = ''
        } );
      }
      this.$http( API.submitProcurement, {
        broadcast: true,
        ...myItem,
        planSkuDetails: planSkuDetails.map( v => ( {
          ...v,
          deliveryDate: this.formatMyDate( v.deliveryDate && v.deliveryDate.time )
        } ) )
      } ).then( ( res ) => {
        item.planState = 5
      }, () => {
        this.errHandler( '提交' )()
      } ).catch( this.errHandler( '提交' ) )
    } );
  }
  cancelProcurement ( item ) {
    this.$confirm( '请确认是否取消采购单；如果是审核后需取消采购单，则需要进行审核，审核通过后才能取消', '取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let { procurementSn, planState } = item
      this.$http( API.cancelProcurement, {
        procurementSn,
        planState,
        broadcast: true
      } ).then( () => {
        if ( item.planState === 0 || item.planState === 5 ) {
          item.planState = 4
        } else if ( item.planState === 1 ) {
          item.planState = 6
        } else {
          item.planState = 0
        }
      } )
    } )
  }

  settleProcurement ( item ) {
    let { procurementSn } = item
    this.$confirm( '是否确定结算?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.settleProcurement, { procurementSn } ).then( res => {
        item.payState = 3
        this.$message( {
          message: res.data.msg,
          type: 'warning'
        } )
      } )
    }, rej => {
      this.$message( {
        message: rej.data.msg,
        type: 'warning'
      } )
    } )
  }

  errHandler ( msg ) {
    return () => {
      this.$notify( {
        type: 'error',
        message: msg + '失败！'
      } )
    }
  }
  delPurchase ( item ) {
    this.$http( API.deleteProcurement, { procurementSn: item.procurementSn } ).then( res => {
      let i = this.myData.indexOf( item )
      this.myData.splice( i, 1 )
    } )
  }
  myExport ( procurementSn ) {
    this.$submit( API.exportProcurement, {
      procurementSn
    } )
  }
  exportExcel () {
    let param = this.formatOption();
    delete param.num;
    delete param.start;
    this.$submit( API.exportProcurementList, {
      ...param,
      memberId: this.memberId,
      accessToken: this.accessToken
    } );
  }
}
</script>
<style lang="stylus" scoped>
.control
  button:nth-child(2n-1)
    margin-left 0
.procurementSn
  color blue
  cursor pointer
</style>

