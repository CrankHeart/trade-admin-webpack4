<template>
  <el-tabs v-model="activeName" :key="procurementSn">
    <el-tab-pane label="详情" name="detail">
      <div id="procurement-detail">
        <div style="padding: 10px 0">
          <el-button
            v-if="$permissionValidateWithEnv(1279, 1270) && (data.planState === 5 || data.planState === 6)"
            type="primary"
            @click="doApprove"
          >审核</el-button>
          <el-button
            v-if="$permissionValidateWithEnv(1280, 1271) && (data.planState === 2 && data.splitOrderFlag === 0)"
            type="primary"
            @click="doBreakPage"
          >拆单</el-button>
          <el-button
            v-if="$permissionValidate(625) && (data.planState === 0 || data.planState === 1 || data.planState === 5 || data.planState === 7)"
            type="primary"
            @click="doCancel"
          >取消</el-button>
          <el-button
            v-if="$permissionValidate(622) && (data.planState === 0 || data.planState === 7)"
            type="primary"
            @click="doSubmit"
          >提交</el-button>
          <el-button v-if="$permissionValidate(624)" type="primary" @click="doExport">导出PDF合同</el-button>
          <el-button v-if="$permissionValidate(624)" type="primary" @click="doExportExcel">导出Excel合同</el-button>
        </div>
        <lc-title text="采购单详情"></lc-title>
        <lc-card>
          <div class="item-content">
            <div class="item">
              <div class="item-left">采购单号：</div>
              <div class="item-right">{{procurementSn}}</div>
            </div>
            <div class="item">
              <div class="item-left">来源单号：</div>
              <div class="item-right">
                <template v-if="data.sourceOrderSn">
                  <span
                    class="source-order"
                    v-for="(code,index) in data.sourceOrderSn.split(',')"
                    :key="code"
                    @click="goDetail(code)"
                  >
                    <span v-if="index">，</span>
                    {{code}}
                  </span>
                </template>
              </div>
            </div>
            <div class="item">
              <div class="item-left">入库仓：</div>
              <div class="item-right">{{formatStatus( data.wareHouse, wareHouses )}}</div>
            </div>
          </div>
          <div class="item-content">
            <div class="item">
              <div class="item-left">采购状态：</div>
              <div class="item-right">{{procurementState}}</div>
            </div>
            <div class="item">
              <div class="item-left">采购员：</div>
              <div class="item-right">{{data.createPerson}}</div>
            </div>
            <div class="item">
              <div class="item-left">下单时间：</div>
              <div class="item-right">{{formatDate(data.createDate)}}</div>
            </div>
          </div>
          <div class="item-content">
            <div class="item">
              <div class="item-left">发货方式：</div>
              <div class="item-right">{{formatDeliverySource(data.deliverySource)}}</div>
            </div>
            <div class="item" v-if="data.planState === 7">
              <div class="item-left">驳回原因：</div>
              <div class="item-right">{{data.auditRemark}}</div>
            </div>
            <div class="item"></div>
          </div>
        </lc-card>

        <lc-card key="breakPageMsg" v-if="data.splitOrderFlag === 1" title="拆单信息">
          <lc-dataset :dataset="breakPageMsg"></lc-dataset>
        </lc-card>

        <lc-card key="goodsMsg" title="商品信息">
          <template slot="title">
            <span style="padding-left:30px">SKU编码：</span>
            <el-input v-model="searchValue" style="width:200px;"></el-input>
            <el-button type="primary" @click="queryList">查询</el-button>
            <el-button @click="cancelQuery">重置</el-button>
            <el-button
              v-if="data.planState===3 && data.splitOrderFlag !== 1 && $permissionValidate(644)"
              @click="bathReturnGoods"
              style="float:right"
              type="primary"
            >申请退换货</el-button>
          </template>
          <lc-table
            :config="config"
            :data="formatData"
            @cur-change="curChange"
            @size-change="sizeChange"
            :page="page"
            selection
            @data-selection-change="selectionChange"
          >
            <template slot-scope="scope">
              <template v-if="scope.con.prop =='applyAfterSales'">
                <p>
                  <a
                    v-if="scope.row.storedNum > 0 && data.planState===3 && data.splitOrderFlag !== 1 && $permissionValidate(644) "
                    @click="actionReturn([scope.row])"
                  >申请退换货</a>
                  <template v-if="editDeliveryDate( scope.row ) ">
                    <a
                      v-if="$permissionValidate(645)"
                      @click.prevent.stop="updateDeliveryInfo( [ scope.row ] )"
                    >更新</a>
                  </template>
                </p>
                <template v-if="scope.row.serviceOrderList">
                  <!-- <router-link v-if=" serviceSnItem = scope.row.serviceOrderList[0] && !serviceSnItem.returnStatus && !serviceSnItem.settleStatus" :to="`/procurement/procurementReturn?serviceSn=${scope.row.serviceOrderList[0]}`">已申请</router-link> -->
                  <p v-for="(serviceSnList,index) in scope.row.serviceOrderList" :key="index">
                    <router-link
                      :to="`/procurement/procurementReturn?serviceSn=${serviceSnList.serviceSn}`"
                    >查看服务单{{index+1}}</router-link>
                    {{formatStatus( serviceSnList.returnStatus, returnStatuses )}}
                    {{formatStatus( serviceSnList.settleStatus, settleStatuses )}}
                  </p>
                </template>
              </template>
              <template v-else-if="scope.con.prop=='deliveryDate'">
                <div style="display：flex">
                  预计：
                  <el-date-picker
                    v-if="editDeliveryDate( scope.row ) "
                    v-model="scope.row.deliveryDate"
                    type="date"
                    placeholder="选择日期"
                  ></el-date-picker>
                  <span v-else>{{scope.row.deliveryDate}}</span>
                </div>
                <div v-if="scope.row.actualDeliveryDate">实际： {{scope.row.actualDeliveryDate}}</div>
              </template>
              <template v-else-if="scope.con.prop=='remark'">
                <el-input v-model.trim="scope.row[scope.con.prop]" placeholder="请输入"></el-input>
              </template>
              <template
                v-else-if="scope.con.prop=='skuLabel'"
              >{{formeSkuLableType(scope.row[scope.con.prop])}}</template>
              <!-- 优惠单价 -->
              <template
                v-else-if="scope.con.prop=='skuDiscountPrice'"
              >{{skuDiscountPriceFun(scope.row)}}</template>
              <!-- 实付金额 -->
              <template v-else-if="scope.con.prop=='pay_amount'">{{pay_amountFun(scope.row)}}</template>
              <template v-else-if="scope.con.prop=='goodsAmount'">{{goodsAmountFun(scope.row)}}</template>
              <template
                v-else-if="scope.con.prop=='supplyNum'"
              >{{ scope.row.supplyNum + scope.row.number }}</template>
              <template v-else>{{scope.row[scope.con.prop]}}</template>
            </template>
          </lc-table>
          <div style="height:200px">
            <div class="total pull-right">
              货币金额：¥ {{data.goodsAmount}}
              <br />
              运 费：¥ {{data.freight}}
              <br />
              优惠金额：¥ {{data.discountAmount}}
              <br />
              实付金额：¥ {{data.totalAmount}}
              <br />
              <template v-if="editAllDeliveryDates">
                <el-button
                  v-if="$permissionValidate(645)"
                  @click="updateAllDeliveryDate"
                  type="primary"
                  class="pull-right"
                >全部更新</el-button>
              </template>
              <!-- <template v-else-if="data.planState==3 || data.planState ==4">
                <el-button
                  v-if="$permissionValidate(645)"
                  @click="updateAllDeliveryDate"
                  type="primary"
                  class="pull-right"
                >更新备注</el-button>
              </template>-->
            </div>
          </div>
        </lc-card>

        <lc-card key="supplierMsg" title="供应商信息">
          <lc-dataset :dataset="supplerPayMsg"></lc-dataset>
        </lc-card>

        <!-- 直发订单信息 -->
        <template v-if="data.directOrderInfoVO">
          <procurement-member :member-order="data.directOrderInfoVO" :key="index"></procurement-member>
        </template>

        <lc-card key="absturctMsg" title="备注信息">
          <lc-dataset :dataset="absturctMsg"></lc-dataset>
          <template slot="title">
            <el-button
              v-if="$permissionValidateWithEnv(1281, 1272)"
              type="primary"
              size="mini"
              @click="openAddAbs"
            >添加</el-button>
          </template>
        </lc-card>

        <refund-dialog
          v-if="!!deliveryListItem"
          @change-refund-state="changeRefundState"
          :delivery-list-item="deliveryListItem"
          :refundDetailData="data"
          :is-procurement="true"
        ></refund-dialog>

        <lc-dialog v-model="showAddAbst" title="添加备注" @confirm="addConfirm" @cancel="addCancel">
          <el-input type="textarea" v-model="addRemarks"></el-input>
        </lc-dialog>

        <lc-dialog
          v-model="showApprove"
          title="审核"
          @confirm="approveConfirm"
          :dataset="approveConfirmConfig"
        >
          <lc-dataset :dataset="approveConfirmConfig"></lc-dataset>
        </lc-dialog>
      </div>
    </el-tab-pane>
    <!-- <el-tab-pane v-if="$permissionValidateWithEnv(1286, 1275)" label="发货记录" name="timingJob">
      <keep-alive>
        <timingJobHistory v-if="activeName==='timingJob'"></timingJobHistory>
      </keep-alive>
    </el-tab-pane>-->
    <el-tab-pane v-if="$permissionValidateWithEnv(1287, 1276)" label="入库记录" name="warehous">
      <keep-alive>
        <warehousHistory v-if="activeName==='warehous'" :procurementSn="this.data.procurementSn"></warehousHistory>
      </keep-alive>
    </el-tab-pane>
    <el-tab-pane v-if="$permissionValidateWithEnv(1288, 1277)" label="退换货记录" name="backGoods">
      <keep-alive>
        <backGoodsHistory v-if="activeName==='backGoods'" :procurementSn="this.data.procurementSn"></backGoodsHistory>
      </keep-alive>
    </el-tab-pane>
    <el-tab-pane v-if="$permissionValidateWithEnv(1289, 1278)" label="操作记录" name="roleManagement">
      <keep-alive>
        <roleManagementHistory v-if="activeName==='roleManagement'"></roleManagementHistory>
      </keep-alive>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/index'
import refundDialog from '../../components/refundDialog.vue'
import procurementMember from './components/procurementMember.vue'
import { planStates, wareHouses, returnStatuses, settleStatuses } from './const/'
import { matchArrItem } from '../../utils/'
import breakPageMsgConfig from './list/detail/breakPageMsgConfig'
import supplerPayMsgConfig from './list/detail/supplerPayMsgConfig'
import absturctMsgConfig from './list/detail/absturctMsgConfig'
import approveConfirmConfig from './list/detail/approveConfirmConfig'
import warehousHistory from './list/warehousHistory/warehousHistory.vue'
import roleManagementHistory from './list/roleManagementHistory/roleManagementHistory.vue'
import timingJobHistory from './list/timingJobHistory/timingJobHistory.vue'
import backGoodsHistory from './list/backGoodsHistory/backGoodsHistory.vue'
import { skuLableTypes } from '../product/const/'
import { deliverySources } from './const/index'
import returnGoods from './list/returnGoods/returnGoods.vue'
@Component( {
  name: 'procurement-detail',
  components: {
    lcTitle,
    lcTable,
    refundDialog,
    procurementMember,
    warehousHistory,
    roleManagementHistory,
    timingJobHistory,
    backGoodsHistory
  }
} )
export default class ProcurementDetail extends Vue {

  deliveryListItem: object = null
  data: any = {}
  page = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 50, 100, 200 ]
  }
  deliveryDate2: any[] = []
  searchValue: string = ''
  curSearchValue: string = ''

  baseConfig = [
    { prop: 'lcSkuCode', label: 'LC编码', width: '150px' },
    { prop: 'skuLabel', label: '类型', width: '100px' },
    { prop: 'storeSkuCode', label: '自有编码', width: '150px' },
    { prop: 'name', label: '名称', width: '200px' },
    { prop: 'specification', label: '规格', width: '150px' },
    { prop: 'storedNum', label: '已入库', width: '120px' },
    { prop: 'onWayNum', label: '待入库', width: '120px' },
    { prop: 'deliveryDate', label: '到货日期', width: '300px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'supplyNum', label: '采购数量', width: '100px' },
    { prop: 'price', label: '单价', width: '100px' },
    { prop: 'goodsAmount', label: '金额', width: '100px' },
    { prop: 'skuDiscountAmount', label: '优惠总额', width: '100px' },
    { prop: 'skuDiscountPrice', label: '优惠单价', width: '100px' },
    { prop: 'pay_amount', label: '实付金额', width: '100px' },
    { prop: 'taxPoint', label: '税点', width: '100px' },
    // { prop: 'remark', label: '备注', width: '150px' },
    { prop: 'applyAfterSales', label: '操作', width: '215px', fixed: 'right' },
  ]

  breakPageMsg
  supplerPayMsg
  absturctMsg
  approveConfirmConfig
  addRemarks = ''
  activeName = 'detail'
  showAddAbst = false
  showApprove = false
  currentSelect = []

  isEditRemark = false // 是否编辑备注
  // 待入库， 部分入库
  get isEditDate () {
    const planState = this.data.planState
    return [ 1, 2 ].indexOf( planState ) > -1
  }

  get procurementState () {
    return this.formatStatus( this.data.planState, this.planStates )
  }

  set procurementState ( v ) {
    this.data.planState = 3
  }

  get config () {
    let config = [ ...this.baseConfig ]
    return config
  }

  @Watch( 'procurementSn' )
  onProcurementSn ( val, oldVal ) {
    this.getData()
  }

  created () {
    this.breakPageMsg = this.$dataSet( breakPageMsgConfig )
    this.breakPageMsg.on( 'fieldClick', field => {
      this.$router.push( `/procurement/detail/${field.value}?deliverySource=${this.data.deliverySource}` )
    } )
    this.supplerPayMsg = this.$dataSet( supplerPayMsgConfig )
    this.supplerPayMsg.value = {}
    this.absturctMsg = this.$dataSet( absturctMsgConfig )
    this.approveConfirmConfig = this.$dataSet( approveConfirmConfig )
    this.approveConfirmConfig.value = {}
  }

  selectionChange ( v ) {
    this.currentSelect = v;
  }

  bathReturnGoods () {
    if ( this.currentSelect.length === 0 ) {
      this.$message( {
        message: '请先勾选需要退换货的商品',
        type: 'warning'
      } );
      return
    }
    for ( let item of this.currentSelect ) {
      if ( item.storedNum <= 0 ) {
        this.$message( {
          message: '请取消勾选不可退换货的商品',
          type: 'warning'
        } );
        return
      }
    }
    this.actionReturn( this.currentSelect )
  }

  goDetail ( value ) {
    this.$router.push( `/procurement/detail/${value}?deliverySource=${this.data.deliverySource}` )
  }

  formatDeliverySource ( deliverySource ) {
    return matchArrItem( deliverySource, deliverySources, 'id' ).name
  }

  queryList () {
    this.curSearchValue = this.searchValue
    this.page.cur = 1
  }

  cancelQuery () {
    this.searchValue = ''
    this.curSearchValue = ''
  }

  skuDiscountPriceFun ( record ) {
    if ( record.skuDiscountAmount > 0 && record.supplyNum > 0 ) {
      let val = record.skuDiscountAmount / record.supplyNum
      return val.toFixed( 2 )
    }
    return '0.00'
  }
  goodsAmountFun ( record ) {
    if ( record.supplyNum > 0 && record.price > 0 ) {
      let val = record.supplyNum * record.price
      return val.toFixed( 2 )
    }
    return '0.00'
  }
  pay_amountFun ( record ) {
    let total = parseFloat( this.goodsAmountFun( record ) )
    if ( total > 0 ) {
      let val = total - ( record.skuDiscountAmount || 0 )
      return val.toFixed( 2 )
    }
    return '0.00'
  }

  formeSkuLableType ( id ) {
    let record = skuLableTypes.find( item => item.id === id )
    return record.name
  }

  addConfirm () {
    if ( this.addRemarks === '' || this.addRemarks === undefined ) {
      this.$notify.error( {
        message: '请填写备注信息'
      } );
      return
    }
    this.$http( API.addRemarkBySn, { broadcast: true, procurementSn: this.data.procurementSn, remark: this.addRemarks } ).then( ( { data } ) => {
      this.addRemarks = ''
      this.formeRemarkVOS( data.data )
    }, ( err ) => {
      this.addRemarks = ''
    } )
  }

  addCancel () {
    this.addRemarks = ''
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
      procurementSn: this.data.procurementSn,
      remark: form.remark,
      auditState: form.auditState
    }
    let state = form.auditState
    this.$http( API.procurementListApprove, params ).then( ( { data } ) => {
      if ( state === 1 ) {
        if ( this.data.planState === 5 ) {
          this.data.planState = 1
        } else {
          this.data.planState = 4
        }
      } else {
        if ( this.data.planState === 5 ) {
          this.data.planState = 7
        } else {
          this.data.planState = 1
        }
      }
    } )
  }

  doBreakPage () {
    this.$confirm( '请确认是否拆单，拆单后将生成两个子采购单；一个已完成子采购单，另一个则是待入库子采购单', '拆单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let params = {
        broadcast: true,
        procurementSn: this.data.procurementSn
      }
      this.$http( API.procurementBreakLine, params ).then( ( { data } ) => {
        this.data.splitOrderFlag = 1
        this.getData()
      } )
    } );
  }

  doCancel () {
    this.$confirm( '请确认是否取消采购单；如果是审核后需取消采购单，则需要进行审核，审核通过后才能取消', '取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let { procurementSn, planState } = this.data
      this.$http( API.cancelProcurement, {
        procurementSn,
        planState,
        broadcast: true
      } ).then( () => {
        if ( this.data.planState === 0 || this.data.planState === 5 ) {
          this.data.planState = 4
        } else if ( this.data.planState === 1 ) {
          this.data.planState = 6
        } else {
          this.data.planState = 0
        }
      } )
    } )
  }

  doSubmit () {
    this.$confirm( '请确认是否提交采购单审核', '提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      let { planSkuDetails, ...myItem } = this.data
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
        this.data.planState = 5
      }, () => {
        this.errHandler( '提交' )()
      } ).catch( this.errHandler( '提交' ) )
    } );
  }

  errHandler ( msg ) {
    return () => {
      this.$notify( {
        type: 'error',
        message: msg + '失败！'
      } )
    }
  }

  doExport () {
    this.$submit( API.exportProcurementPDF, {
      procurementSn: this.data.procurementSn
    } )
  }

  doExportExcel () {
    this.$submit( API.exportProcurement, {
      procurementSn: this.data.procurementSn
    } )
  }

  doApprove () {
    this.showApprove = true
  }

  openAddAbs () {
    this.showAddAbst = true
  }

  editRemarkOper () {
    this.$http( API.updateRemarkBySn, { sn: this.procurementSn, remark: this.data.remark } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: '更新成功!'
      } )
      this.isEditRemark = false
    }, ( err ) => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '查询错误，请确认！'
      } )
    } )
  }

  actionReturn ( item ) {
    // item.num = item.number + item.supplyNum
    // this.deliveryListItem = { ...item, agreePriceString: item.price, myRefundType: 1 }
    // this.deliveryListItem = { myRefundType: 1, goodsInfo: [ { ...item } ], agreePriceString: item.price }
    this.$popup( {
      title: '申请退换货',
      size: 'large',
      template: returnGoods,
      props: {
        data: this.data,
        list: item
      }
    } )
  }

  changeRefundState ( v ) {
    if ( v ) {
      let { applyAfterSales, serviceType, goodsNum, serviceSn } = ( v as any )
      // let messageGoodsTip = '如果仓库已经收货，请提示仓库关闭采购入库单;'
      // let messageSettlementTip = !this.data.settlementMethod ? '该供应商为现结，请提示供应商尽快退款;' : ''
      // this.$confirm( messageGoodsTip + messageSettlementTip, '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      //   center: true
      // } )
      this.formatData.forEach( val => {
        let { id } = ( this.deliveryListItem[ 'goodsInfo' ][ 0 ] as any )
        if ( val.id == id ) {
          val.applyAfterSales = applyAfterSales
          val.serviceOrderList.push( {
            serviceSn: serviceSn
          } )
          if ( serviceType === 2 ) {
            let number = val.onWayNum - goodsNum
            val.onWayNum = number ? number : 0
          }
        }
      } )
      let bo = this.formatData.some( value => value.onWayNum )
      if ( !bo ) {
        this.procurementState = 3
      }
    }
    this.deliveryListItem = null
  }


  get formatData () {
    let planSkuDetails = this.data.planSkuDetails || []
    if ( this.curSearchValue ) {
      planSkuDetails = planSkuDetails.filter( item => item.lcSkuCode == this.curSearchValue )
    }
    this.page.total = planSkuDetails.length
    let num = this.page.num
    let start = ( this.page.cur - 1 ) * num
    return planSkuDetails.slice( start, start + num )
  }
  get procurementSn () {
    return this.$route.params.procurementSn
  }
  toFixed ( n = 0 ) {
    if ( +n ) {
      return ( +n ).toFixed( 2 )
    }
    return n
  }

  @Inject() formatMyDate
  activated () {
    this.getData()
  }

  curChange ( cur ) {
    this.page.cur = cur
  }

  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
  }

  deactivated () {
    this.$destroy()
    this.clear()
  }

  formatDate ( date, str ) {
    let time = date && date.time
    if ( !time ) return
    return this.formatMyDate( time, str )
  }

  wareHouses = wareHouses
  planStates = planStates
  returnStatuses = returnStatuses
  settleStatuses = settleStatuses

  formatStatus ( item, type ) {
    return matchArrItem( item, type, 'id' ).name
  }

  getData () {
    this.$permissionValidateWithNotify( 646 )
    this.$http( API.selectProcurement, { procurementSn: this.procurementSn } ).then( ( { data } ) => {
      let d = data.data || {}
      d = d.list && d.list[ 0 ]
      if ( !d ) {
        this.clear()
        this.$router.push( '/procurement/list' )
      }
      let planSkuDetails = d.planSkuDetails || []
      this.deliveryDate2 = []
      planSkuDetails.forEach( v => {
        v.goodsAmount = ( ( ( +v.number || 0 ) + ( +v.supplyNum || 0 ) ) * ( +v.price ) ).toFixed( 2 )
        v.price = v.price.toFixed( 2 )
        v.deliveryDate = this.formatDate( v.deliveryDate, 'yyyy-MM-dd' )
        if ( v.actualDeliveryDate ) {
          v.actualDeliveryDate = this.formatDate( v.actualDeliveryDate, 'yyyy-MM-dd' )
        }
        this.deliveryDate2.push( v.deliveryDate )
      } )
      d.goodsAmount = ( planSkuDetails.reduce( ( p, v ) => p + v.goodsAmount * 100, 0 ) / 100 ).toFixed( 2 )
      d.totalAmount = ( ( +d.goodsAmount * 100 + d.freight * 100 - d.discountAmount * 100 ) / 100 ).toFixed( 2 )
      d.freight = d.freight.toFixed( 2 )
      d.discountAmount = d.discountAmount.toFixed( 2 )
      this.page.total = planSkuDetails.length
      this.data = d
      this.supplerPayMsg.value = d
      this.breakPageMsg.value = d.subPurchaseOrderVOS
      this.formeRemarkVOS( d.remarkVOS )
    }, ( err ) => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '查询错误，请确认！'
      } )
    } )
  }

  formeRemarkVOS ( list ) {
    for ( let i = 0; i < list.length; i++ ) {
      list[ i ].index = i + 1
    }
    this.absturctMsg.value = list
  }

  updateAllDeliveryDate () {
    this.updateDeliveryInfo( this.formatData )
  }

  updateDeliveryInfo ( items ) {
    let self = this
    let params: any[] = []
    items.forEach( ( v, index ) => {
      let { id, lcSkuCode, deliveryDate, skuId, remark } = v
      deliveryDate = self.formatMyDate( v.deliveryDate, 'yyyy-MM-dd' )
      // if ( deliveryDate !== self.deliveryDate2[ index ] ) {
      params.push( { id, lcSkuCode, deliveryDate, skuId, remark } )
      // }
    } )
    if ( params.length === 0 ) {
      return
    }
    this.$http( API.updatePlanSkuDetail, {
      list: params
    } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: '更新成功'
      } )
    } )
  }

  editDeliveryDate ( item ) {
    // let isEdit = this.isEditDate
    // if ( this.data.planState === 2 && item.onWayNum === 0 ) {
    //   isEdit = false
    // }
    // return isEdit
    if ( this.data.planState === 3 || this.data.planState === 4 ) {
      return false
    } else if ( item.onWayNum > 0 ) {
      return true
    }
  }

  get editAllDeliveryDates () {
    let self = this
    return this.formatData.some( v => self.editDeliveryDate( v ) )
  }


  clear () {
    Object.keys( this.data ).forEach( v => {
      this.data[ v ] = ''
    } )
  }

}
</script>
<style lang="stylus" scoped>
.total
  line-height 40px
.el-input-number
  vertical-align middle
a
  cursor pointer
.procurement-member
  margin-right 300px
.remarkText
  margin-bottom -10px
.source-order
  color blue
  cursor pointer
.item-content
  display flex
  .item
    flex 1
    padding 10px
    display flex
    vertical-align top
    .item-left
      vertical-align top
      width 80px
    .item-right
      flex 1
</style>
