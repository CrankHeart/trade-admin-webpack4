<template>
  <div class="order-search-list">
    <lc-table-config :base-config="baseConfig" @set-config="setOrderConf"></lc-table-config>
    <div class="el-table el-table--fit el-table--striped el-table--border">
      <table cellpadding="0" cellspacing="0" width="100%">
        <thead>
          <th v-for="(con, index) in config" :key="index" :style="{width:con.width}">
            <div class="cell">{{con.label}}</div>
          </th>
        </thead>
        <tr class="el-table__empty-block" v-if="data.length==0">
          <td :colspan="config.length">
            <div class="cell">暂无数据</div>
          </td>
        </tr>
        <tbody v-for="item in data" :key="item.sn">
          <tr class="order-info">
            <td :colspan="config.length">
              <div class="cell">
                <!-- <el-checkbox v-model="item.isChecked"></el-checkbox> -->
                <i>支付单号：</i>
                <!-- <el-button type="text" ></el-button> -->
                <a href="javascript:;" @click="search({tradeNo:item.tradeNo})">{{item.tradeNo}}</a>
                <i>订单号：</i>
                <!-- <el-button type="text" @click="search({sn:item.sn})">{{item.sn}}</el-button> -->
                <a href="javascript:;" @click="search({sn:item.sn})">{{item.sn}}</a>
                <i>下单时间：</i>
                {{ item.createDateString }}
                <template
                  v-if="item.settlementDateString"
                >
                  <i>结算时间：</i>
                  {{ item.settlementDateString }}
                </template>

                <i>经销商：</i>
                {{item.storeName}}
                <br />
                <i>用户名：</i>
                <!-- 如果有customerName说明是个人用户，customerName为手机号 -->
                <template
                  v-if="item.tenantId!='mall'"
                >{{item.customerIdAndUsrId || item.member }} ({{item.memberName }})({{item.saasCode}})</template>
                <template v-else>
                  <!-- {{item.customerId}} ({{item.customerName }})  -->
                  {{item.customerId}} ({{item.memberName}})
                </template>

                <span v-if="item.firstOrder===1">
                  <el-button
                    class="first-order"
                    :plain="true"
                    size="small"
                    style="margin-left:30px;"
                  >首次下单</el-button>
                </span>

                <!-- <span v-if="item.orderType ==1&&item.settlementStatus ===3">
                  <el-button type="success" size="small">已结算</el-button>
                </span>-->

                <i>订单分类:</i>
                <span>{{convert(item.label,'label')}}</span>
                <el-tooltip
                  effect="dark"
                  placement="top-start"
                  content="修改标签"
                  v-if="$permissionValidate(528)"
                >
                  <i class="el-icon-warning" @click="modifyLabel(item)"></i>
                </el-tooltip>

                <template v-if="$permissionValidate( 487 ) && item.grossProfitRate">
                  <i>毛利率:</i>
                  <span>{{item.grossProfitRate}}</span>
                </template>

                <span class="pull-right">
                  <!-- <span v-if="item.orderType===1&& item.member && item.member.indexOf('trusteeship')==-1">
                    {{item.settlementMethod ==0?'固定账期': item.settlementMethod+'天' }}
                  </span>&nbsp;-->
                  <span v-if="item.member && item.member.indexOf('trusteeship')==0">托管订单</span>&nbsp;
                  <!-- {{(item.orderType===0)? (item.shoppingType===1?'订购单':'普通订单'):'月结订单'}} -->
                  {{(item.orderType===0)? '普通订单':'月结订单'}}
                </span>
              </div>
            </td>
          </tr>
          <tr v-for="(goods, index) in item.itemList" :key="index" class="center">
            <template v-for="con in config">
              <td v-if="checkIndex(con)" :key="con.prop">
                <div class="cell">
                  {{goods[con.prop]}}
                  <template v-if="con.prop=='name'&&goods.purchaseProperty">
                    <el-tag type="danger" v-if="goods.purchaseProperty===1">赠品</el-tag>
                    <el-tag type="danger" v-if="goods.purchaseProperty===2">试用品</el-tag>
                  </template>
                </div>
              </td>
              <!-- 地址 -->
              <td
                :rowspan="item.itemList.length"
                v-else-if="index==0 && con.prop=='addressDetail'"
                :key="con.prop"
              >
                <div class="cell">
                  <p v-for="p in (item.addressDetail||'').split(';')" :key="p">{{p}}</p>
                </div>
              </td>
              <!-- 状态 -->
              <td
                :rowspan="item.itemList.length"
                v-else-if="index==0 && con.prop=='orderStatus'"
                :key="con.prop"
              >
                <div class="cell">
                  <!-- <i>订单状态:</i>
                  <br>-->
                  <template v-if="item.orderStatus =='0' && item.orderType == 1">
                    <template v-if="item.auditStatus == 1">待诊所审批</template>
                    <template v-else>待客服确认</template>
                  </template>
                  <template v-else>{{orderAllStatus[item.orderStatus]}}</template>
                  <!--<br>
                   <i>结算状态:</i>
                  <br>
                  <span>{{convert(item.settlementStatus,'settlementStatus')}}</span>-->
                </div>
              </td>
              <!-- 出库单信息 -->
              <td
                :rowspan="item.itemList.length"
                v-else-if="index==0 && con.prop=='deliverySns'"
                :key="con.prop"
              >
                <div class="cell">
                  <div v-for="list in item.deliveryList" :key="list.id">
                    <template v-if="list.wantSlipsState !== 2">
                      {{convert(list.deliveryState,'deliveryState')}}:{{list.deliverySn}}
                      <br />
                    </template>
                  </div>
                </div>
              </td>
              <!-- 操作 -->
              <td
                :rowspan="item.itemList.length"
                v-else-if="index==0 && con.prop=='control'"
                :key="con.prop"
              >
                <div class="cell">
                  <router-link
                    :to="'/order/detail/'+item.sn"
                    class="el-button el-button--info el-button--small"
                    v-if="$permissionValidate(527)"
                  >订单详情</router-link>
                  <!-- 不需要通过付款凭证 -->
                  <el-button
                    type="warning"
                    v-if="item.orderStatus =='0' && item.orderType == 0 && $permissionValidate(529) && !(item.storeInfo && item.storeInfo.voucher)"
                    @click="showPop(item, 'pay')"
                    size="small"
                    :disabled="item.disabled"
                  >付款</el-button>
                  <!-- 通过付款凭证付款 -->
                  <!-- <el-button type="warning" v-if="item.orderStatus =='0' && item.orderType == 0 && $permissionValidate(1045) && (item.storeInfo && item.storeInfo.voucher)" @click="$emit('createPaymentVoucher',item)" size="small" :disabled="item.disabled" >新建付款凭证 </el-button> -->
                  <!-- 2019/04/17 修改 新建付款凭证显示条件 -->
                  <!-- <el-button
                    type="warning"
                    v-if="hasPaymentVoucherBtn( item ) && $permissionValidate(1045)"
                    @click="$emit('createPaymentVoucher',item)"
                    size="small"
                    :disabled="item.disabled"
                  >新建付款凭证</el-button>-->
                  <el-button
                    type="warning"
                    v-if="item.orderStatus =='0' && item.orderType == 1 && item.auditStatus !== 1 && $permissionValidate(992)"
                    @click="showPop(item, 'pay')"
                    size="small"
                    :disabled="item.disabled"
                  >确认配货</el-button>

                  <!-- 2018/12/24  隐藏 发货按钮 -->
                  <!-- <el-button type="warning" v-if="item.orderStatus =='1' && $permissionValidate(670) && [5, 280, 282, 284].indexOf(item.storeId)<0" @click="showPop(item,'logistic')" size="small" :disabled="item.disabled"> 发货 </el-button> -->

                  <el-button
                    type="warning"
                    v-if="item.orderStatus =='2' && $permissionValidate(531)"
                    @click="updateOrderStatus(item)"
                    size="small"
                    :disabled="item.disabled"
                  >完成</el-button>
                  <!-- && $permissionValidate(530) -->
                  <el-button
                    type="danger"
                    v-if="hasCancelBtn( item )"
                    @click="showPop(item, 'cancelOrder')"
                    size="small"
                    :disabled="item.disabled"
                  >取消</el-button>
                  <!-- 仅仓库人员可点击 -->
                  <!-- <el-button
                    type="danger"
                    v-if="hasDeliveryCancelBtn( item ) && $permissionValidate(1107)"
                    @click="showPop(item, 'cancelOrder')"
                    size="small"
                    :disabled="item.disabled"
                  >已配货取消</el-button>-->
                  <!-- <template v-if="item.orderType == 1 && item.orderStatus !== 6">
                    <el-button v-if="item.settlementStatus === 0 && $permissionValidate(533)" @click="$emit('launchOrderCheck',[{sn:item.sn}])" size="small">发起核对</el-button>
                    <div style="fontSize:10px;" v-else-if="item.settlementStatus ===1">已发起核对</div>
                    <el-button v-else-if="item.settlementStatus ===2 && $permissionValidate(664) && !(item.storeInfo && item.storeInfo.voucher)&&item.member.indexOf('trusteeship')==-1" @click="showPop(item, 'updateSettlementStatus')" size="small" :disabled="item.disabled" >结算</el-button>
                    <template v-else>{{convert(item.settlementStatus,'settlementStatus')}}</template>
                  </template>-->
                </div>
              </td>
              <td :rowspan="item.itemList.length" v-else-if="index==0" :key="con.prop">
                <div class="cell">{{item[con.prop]}}</div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <el-dialog
      title="请修改订单分类"
      :visible.sync="modifyLabelDialogVisible"
      width="30%"
      center
      v-if="$permissionValidate(528)"
    >
      <template>
        <el-radio v-model="itemLabel" :label="0">耗材订单</el-radio>
        <el-radio v-model="itemLabel" :label="1">设备订单</el-radio>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyLabelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmModifyLabel">确 定</el-button>
      </span>
    </el-dialog>
    <el-pagination
      :current-page="page.cur"
      :page-size="page.num"
      layout="total, prev, pager, next, sizes"
      :total="page.total"
      class="center"
      @current-change="curChange"
      :page-sizes="page.sizes"
      @size-change="sizeChange"
    ></el-pagination>
    <search-cancel-order
      v-if="cancelPromptVisible"
      :order="curOrder"
      @visible-change="visibleChange"
      @cancel-order="cancelOrder"
    ></search-cancel-order>
    <!-- <search-logistic v-if="logisticVisible" :order="curOrder" @visible-change="visibleChange" @deliver-goods="updateOrderStatus"> </search-logistic> -->
    <!-- 2018-10-25 直接导出个数过多,关闭导出全部 -->
    <!-- <el-button type="primary" class="pull-right" @click="orderExport">导出全部</el-button> -->
    <!-- <el-button
      type="primary"
      class="pull-right"
      v-if="$permissionValidate(532)"
      @click="orderExportDisperse"
    >导出选中</el-button>-->
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import API from "../../../API"
import lcTitle from "../../../components/title.vue"
import lcTable from "../../../components/table/index"
import lcTableConfig from "../../../components/table/control.vue"
import { State, Action, Getter, Mutation } from "vuex-class"
import { orderAllStatus, settlementStatus, deliveryStates, labelStatus } from "../const/orderSearchCondition"
import searchCancelOrder from "./searchCancelOrder.vue"
import { matchArrItem } from '../../../utils'
// import searchLogistic from "./searchLogistic.vue"
@Component( {
  name: "order-search-list",
  components: {
    lcTitle,
    lcTable,
    lcTableConfig,
    searchCancelOrder,
    // searchLogistic
  }
} )
export default class OrderSearchList extends Vue {
  @Mutation( "order/setOrderConf" ) setOrderConf
  @Getter( "order/orderConfig" ) baseConfig

  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  hasCancelBtn ( item ) {
    // let value = (item.orderStatus == '0' && item.orderType == 0)
    //     || (item.orderStatus == '0' && item.orderType == 1 && item.auditStatus !== 1 )
    //     || item.orderStatus == '1'
    //     || item.orderStatus == '2'
    // console.log( value )
    // return value
    // 普通订单： 未付款 状态
    // 月结订单： 非已结算状态 且 未付款或待付款 状态 且 非待审批 状态
    const { orderStatus, orderType, settlementStatus, auditStatus, deliveryList } = item
    /* 
      【月结订单】已确认的订单不可取消 ：待确认可以取消 其他都不可以取消
       结算类型为月结订单(orderType=1) && 状态:是待确认(orderStatus=0) 才显示【取消】按钮
       【已配货取消】按钮全部隐藏 

       最后修改 =》跟月结订单无关
    */
    if ( orderStatus == 0 ) {
      return true;
    } else {
      return false;
    }
    // (下面一坨看不懂,所以打补丁方式,订单取消按钮隐藏)普通订单,并且订单状态>=1,不可取消
    if ( orderType == 0 && orderStatus >= 1 ) {
      return false
    }
    const isExist = deliveryList.some( v => {
      return v.deliveryState === 1 // 出库单已提交
    } )

    if ( isExist || orderStatus === 6 ) {
      return false
    } else {
      return ( orderType == 0 && orderStatus == 0 )
        || ( orderType == 1 && settlementStatus == 0 && auditStatus !== 1 && ( orderStatus == 0 || orderStatus == 1 ) ) // auditStatus  好像是BMS状态
        || ( !deliveryList.length && orderStatus !== 5 ) // 没有出库单,并且订单状态是非已完成,显示取消按钮
    }
  }

  // 已配货取消 按钮已经隐藏 此功能函数可以删除
  hasDeliveryCancelBtn ( item ) {
    const { deliveryList, orderType, orderStatus } = item

    // (下面一坨看不懂,所以打补丁方式,订单取消按钮隐藏)普通订单,并且订单状态>=1,不可取消
    if ( orderType == 0 && orderStatus >= 1 ) {
      return false
    }
    const isExist = deliveryList.some( v => {
      return v.deliveryState === 1
    } )
    // 配货情况是已提交且订单处于未取消状态
    return isExist && orderStatus !== 6
  }
  // hasPaymentVoucherBtn(item) {
  //   return (item.storeInfo && item.storeInfo.voucher) && (item.settlementStatus == 0 || item.settlementStatus == 4) && item.orderType == 0 && [6].indexOf(item.orderStatus) === -1
  // }
  checkIndex ( con ) {
    let prop = con.prop
    return (
      "name,number,lcCode,code,categoryName,brandName"
        .split( "," )
        .indexOf( prop ) > -1
    )
  }
  orderAllStatus = orderAllStatus
  settlementStatus = settlementStatus
  @Prop( { default: [] } )
  data: any[]
  @Prop() page: any
  curChange ( cur ) {
    if ( this.page.cur == cur ) return
    this.$emit( "cur-change", cur )
    this.$scrollTo( this.$parent.$el, 500, { offset: -110 } )
  }
  sizeChange ( v ) {
    this.$emit( 'size-change', v )
    this.$scrollTo( this.$parent.$el, 500, { offset: -110 } )
  }
  search ( query ) {
    this.$permissionValidateWithNotify( 527 )
    this.$router.push( {
      path: "/order/search",
      query
    } )
    this.$emit( "emit-search", query )
  }
  updateOrderStatus ( item, cancelFlag?) {
    let { orderStatus, sn, id, operationNote, shoppingType } = item
    item.disabled = true
    if ( orderStatus == "0" ) {
      orderStatus = 1
    } else if ( orderStatus == "1" ) {
      orderStatus = 2
    } else if ( orderStatus == "2" ) {
      orderStatus = 5
    }
    if ( cancelFlag ) {
      orderStatus = 6
    }
    return this.$http( API.updateOrderStatus, {
      sn,
      id,
      operationNote,
      orderStatus,
      shoppingType
    } ).then( ( { data } ) => {
      item.disabled = false
      item.orderStatus = orderStatus
      this.$notify( {
        type: 'success',
        message: '更新完成'
      } )
      return true
    } ).catch( ( { data } ) => {
      item.disabled = false
      this.$notify( {
        type: 'error',
        message: '操作失败！'
      } )
    } )
  }
  curOrder: any = null

  cancelPromptVisible: boolean = false
  // logisticVisible: boolean = false
  @Prop() params: any
  orderExport () {
    if ( this.data.length <= 0 ) {
      return
    }
    this.$submit( API.orderExport, this.params )
  }
  orderExportDisperse () {
    let arr = this.data.filter( v => v.isChecked ).map( v => v.sn )
    if ( !arr.length ) {
      this.$notify( {
        title: "导出错误",
        type: "error",
        message: "请确认你所选择的导出文件！"
      } )
      return
    }

    let str = arr.join( ";" )
    this.$submit( API.orderExportDispersed, {
      snList: str
    } )
  }

  showPop ( item, type ) {
    this.curOrder = item
    if ( type == "cancelOrder" ) {
      this.cancelPromptVisible = true
    } else if ( type == "pay" ) {
      // updateOrderStatus(item)
      this.payConfirm( item )
    }
    // else if (type == 'updateSettlementStatus') {
    // this.updateSettlementStatusConfirm(item)
    // }
    // else if (type == 'logistic') {
    //   this.updateDeliverStatusConfirm(item)
    // }
  }
  // updateDeliverStatusConfirm(item) {
  //   this.$confirm('此操作将会使订单状态更新为已发货, 是否继续?', '结算提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   }).then(() => {
  //     this.updateOrderStatus(item)
  //   }).catch(() => {

  //   })
  // }
  // updateSettlementStatusConfirm(item) {
  //   this.$confirm('此操作将会使订单状态更新为已结算, 是否继续?', '结算提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   }).then(() => {
  //     this.updateSettlementStatus(item)
  //   }).catch(() => {

  //   })
  // }
  payConfirm ( item ) {
    this.$confirm( '此操作将会使订单状态更新为已付款, 是否继续?', '付款提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.updateOrderStatus( item )
    } ).catch( () => {

    } )
  }
  cancelOrder ( item ) {
    this.updateOrderStatus( item, "cancelOrder" ).then( ( isResolve ) => {
      if ( isResolve )
        this.$message( {
          type: 'success',
          message: '取消当前订单成功!'
        } )
    } )
  }
  // deliverGoods (order) {
  //   this.updateOrderStatus(order, 'cancelOrder')
  // }
  visibleChange ( b, type ) {
    // if (type == "orderCancel") {
    this.cancelPromptVisible = b
    this.$emit( "emit-search" )
    // }
    // else if (type == "logistic") {
    //   this.logisticVisible = b
    // }
  }
  // updateSettlementStatus(item) {
  //   let wantedOrderStatus = null
  //   if (item.settlementStatus === 0) {
  //     wantedOrderStatus = 1
  //   }
  //   this.$http(API.updateSettlementStatus, {
  //     sn: item.sn,
  //     broadcast: true
  //   }).then(res => {
  //     item.settlementStatus = wantedOrderStatus
  //   })
  // }
  deliveryStates = deliveryStates
  modifyLabelDialogVisible: boolean = false
  itemLabel: any = ''
  item: any = ''
  modifyLabel ( v ) {
    this.itemLabel = v.label
    this.item = v
    this.modifyLabelDialogVisible = true
  }
  confirmModifyLabel () {
    this.$http( API.updateOrderBasicInfo, { sn: this.item.sn, label: this.itemLabel } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '修改成功'
      } )
      this.modifyLabelDialogVisible = false
      this.item.label = this.itemLabel
    } )
  }
  convert ( value, prop ) {
    let arr
    switch ( prop ) {
      case 'label':
        arr = labelStatus
        break
      case 'settlementStatus':
        arr = settlementStatus
        break
      case 'deliveryState':
        arr = deliveryStates
        break
      default:
        arr = []
    }
    return arr._find( value, 'id' ).name
  }

}
</script>
<style lang="stylus" scoped>
td:not([colspan])
  .el-button
    display block
    width 100%
    margin 5px 0
td[colspan]
  padding 8px
  background #e3e3e3
td[colspan], td[rowspan]
  i
    font-weight bold
    font-style normal
.el-table
  overflow-x auto
.el-table
  table
    min-width 100%
.first-order, .first-order:hover
  background none
  color #ff4949
  border-color #ff4949
</style>

