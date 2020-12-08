<template>
  <!-- 发货情况一览 -->
  <div>
    <h3 style="overflow: hidden;">
      <!-- 申请售后——退换货 -->
      <ReturnExchange
        v-if="isShowReturnExchange"
        :params="params"
        :dialogVisible.sync="isShowReturnExchange"
        @refresh="refresh('overview')"
      ></ReturnExchange>
      <!-- 单个 退款申请 -->
      <RefundApplication
        v-if="isShowRefundApplication"
        :params="params"
        :dialogVisible.sync="isShowRefundApplication"
        @refresh="refresh('overview')"
      ></RefundApplication>
      <!-- 全部申请退款 -->
      <RefundAllApplication
        ref="refundAllApplication"
        v-if="isShowRefundAllApplication"
        :params="params"
        :dialogVisible.sync="isShowRefundAllApplication"
        @refresh="refresh('overview')"
      ></RefundAllApplication>
      <el-button
        v-if="$permissionValidateWithEnv(1269,1260)"
        @click="refresh('overview')"
        class="pull-right all-refund-btn"
        type="primary"
        size="small"
      >刷新</el-button>
      <!-- <el-button
        v-if=" $permissionValidate(549) && isShowAllApplyRefundBtn"
        class="pull-right all-refund-btn"
        type="primary"
        size="small"
        @click="allApplyRefund"
      >全部申请退款</el-button>-->

      <el-button
        v-if=" $permissionValidate(549) && isShowAllApplyRefundBtn"
        class="pull-right all-refund-btn"
        type="primary"
        size="small"
        @click="showRefundAllApplication"
      >全部申请退款</el-button>
      <el-button
        v-if="$permissionValidate(551) && isShowCreateBtn"
        class="pull-right"
        type="primary"
        size="small"
        @click="addShipping"
      >新建发货单</el-button>
    </h3>
    <div class="order-detail-deliver__item">
      <template>
        <lcTable
          :max-height="500"
          :config="formatTableBaseConfig"
          :data="deliveryList"
          :has-page="false"
        >
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <template v-if="scope.con.prop=='isVirtual'">
              <span>{{scope.row.isVirtual==1?'否':'是'}}</span>
            </template>
            <template v-else-if="scope.con.prop=='allocationStatus'">
              <span
                :class="{
                  'deliverying': scope.row['distributingNum'] || scope.row['toDistributeNum'], 
                  'deliveryed': scope.row['totalNum'] === scope.row['outboundNum'] || scope.row['totalNum'] === scope.row['refundNum'] || scope.row['totalNum'] === scope.row['outboundNum'] + scope.row['refundNum']
                }"
              >{{ formatDeliverState(scope.row) | formatAllocationStatus }}</span>
              <span
                v-if="scope.row['toDistributeNum'] || scope.row['distributingNum']"
              >已发运：{{scope.row['outboundNum']}}</span>
              <span v-if="scope.row['refundNum']">已退款：{{scope.row['refundNum']}}</span>
              <!-- <router-link
                v-if="$permissionValidate(406) && scope.row['refundNum']"
                :to="`/server/refunding?orderSn=${$route.params.sn}`"
                class="refund-introduce"
              >已退款：{{scope.row['refundNum']}}</router-link>-->
            </template>
            <template v-else-if="scope.con.prop=='totalNum'">{{scope.row[scope.con.prop]}}</template>
            <template
              v-else-if="scope.con.prop=='code'"
            >{{scope.row[scope.con.prop] || scope.row['storeSkuCode']}}</template>
            <template v-else-if="scope.con.prop=='operFlag'">
              <!-- outboundNum 已出库 有值才显示 申请售后（退款退货） -->

              <!-- 虚拟商品 只能选择【退货】 -->
              <span
                v-if="$permissionValidateWithEnv(1268,1259) && scope.row.outboundNum"
                class="refund-introduce"
                @click="showReturnExchange(scope.row)"
                type="primary"
                size="small"
              >申请售后</span>
              <!-- isVirtual 虚拟商品不可以【申请退款】 1可以显示按钮  2不能做任何 如：售后操作（退换货按钮操作）、申请退款、 -->
              <template v-if="scope.row.isVirtual==1">
                <!-- <span
                class="refund-introduce"
                @click="refundOrProgressChange(scope.row)"
                v-if="scope.row.toDistributeNum && $permissionValidate(549)"
                >申请退款222</span>-->
                <span
                  class="refund-introduce"
                  @click="showRefundApplication(scope.row)"
                  v-if="scope.row.toDistributeNum && $permissionValidate(549)"
                >申请退款</span>
              </template>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
        </lcTable>
      </template>
    </div>

    <!-- 老的 全部申请退款 对话框 -->
    <deliveryRefundDialog
      v-if="!!deliveryListItem"
      @change-refund-state="changeRefundState"
      :delivery-list-item="deliveryListItem"
      :refund-detail-data="contactData"
      :orderSn="orderSn"
      :member-id="memberId"
      :store-id="memberOrder.storeId"
    ></deliveryRefundDialog>
    <!-- 新建发货单对话框 -->
    <deliveryList
      v-if="memberOrder.storeInfo.distributeWay != 1 && deliveryListVisible"
      v-model="deliveryListVisible"
      :memberOrderItem="deliveryInfoList.filter( v => v.number > 0 || v.totalNum > 0 )"
      @change-delivery-state="changeDeliveryState"
      :orderSn="orderSn"
    ></deliveryList>
    <!-- 新建发货单对话框 -->
    <deliveryListInterface
      v-if="memberOrder.storeInfo.distributeWay == 1 && deliveryListVisible"
      v-model="deliveryListVisible"
      :memberOrderItem="deliveryInfoList.filter( v => v.number > 0 || v.reservedStock > 0 )"
      @change-delivery-state="changeDeliveryState"
      :orderSn="orderSn"
    ></deliveryListInterface>
  </div>
</template>

<script lang='ts'>
// tslint:disable
import Vue from "vue"
import { Component, Inject, Prop } from "vue-property-decorator"
import API from "../../../API"
import { State } from "vuex-class"
import { deliveryStates } from '../const/orderSearchCondition'
import lcTableConfig from "../../../components/table/control.vue"
import lcTable from '../../../components/table/'
import deliveryList from './deliveryList.vue'
import deliveryListInterface from './deliveryListInterface.vue'
import deliveryRefundDialog from './deliveryRefundDialog.vue'
import { matchArrItem } from '../../../utils/'
import { skuTypes } from '../../product/const/index'
import { allocationStatus } from '../const/orderSearchCondition'

// 退换货 对话框
import ReturnExchange from './returnExchange'
// 退款申请 对话框
import RefundApplication from './refundApplication'
// 全部申请退款 对话框
import RefundAllApplication from './refundAllApplication'

@Component( {
  name: "detail-deliver-overview",
  components: {
    lcTable,
    lcTableConfig,
    deliveryList,
    deliveryListInterface,
    deliveryRefundDialog,
    ReturnExchange, // 退换货
    RefundApplication, // 退款申请
    RefundAllApplication // 全部申请退款
  },
  filters: {
    formatAllocationStatus ( id ) {
      return allocationStatus.find( item => item.id === id ).name
    }
  }
} )
export default class DetailDeliverOverview extends Vue {
  @Prop( { default: {} } )
  memberOrder: any
  @Prop() deliveryList: any[]

  // 查询父级额外参数
  params: any = {
    // 硬编码
    // dataSource: "0",  //写死
    goodsImage: "",   // 默认值
    purchaseProperty: "0", // 写死
    // 读取父级组件数据
    goodsName: "", // skuName 父级
    lcSkuCode: "",  // lcSkuCode 父级
    goodsSpecification: "",      // specification 父级
    orderSn: "", // orderSn 父级
    skuType: "", // skuType 父级
    goodsSkuId: "",  // skuId 父级
    storeId: "",  // storeId 父级 memberOrder.storeId
    memberId: "",  // memberId 父级 

    // 联系人、联系电话
    contact: '', // 联系人 父级
    mobile: '', // 联系电话 父级
  };

  isShowReturnExchange: boolean = false
  isShowRefundApplication: boolean = false
  isShowRefundAllApplication: boolean = false

  mounted () {
    this.getRefundAllServiceApplyInfo();
  }

  showReturnExchange ( row ) {
    this.isShowReturnExchange = true;

    let arr = [
      { name: "skuName", value: "goodsName" },
      { name: "lcSkuCode", value: "goodsLcCode" },
      { name: "lcSkuCode", value: "lcSkuCode" },
      { name: "specification", value: "goodsSpecification" },
      // { name: "orderSn", value: "orderSn" },
      { name: "skuType", value: "skuType" },
      { name: "skuId", value: "goodsSkuId" },
      { name: "skuId", value: "skuId" },
      { name: "totalNum", value: "skuNum" },// 数量
      { name: "totalNum", value: "totalNum" },// 数量
    ];
    // 商品物理类型 1：正常商品；2：非实物商品(虚拟) isVirtual
    const { isVirtual } = row;
    // 联系人、联系电话
    let { contact, mobile } = this.contactData;
    let params = { isVirtual, contact, mobile };
    arr.forEach( item => {
      params[ item.value ] = row[ item.name ]
    } );

    console.log( 111, params );
    this.params = {
      ...this.params,
      ...params,
      orderSn: this.orderSn,
      applyUserId: this.memberId,
    };
  }
  showRefundApplication ( row ) {
    this.isShowRefundApplication = true;

    let arr = [
      { name: "skuName", value: "goodsName" }, // 商品名称
      { name: "specification", value: "goodsSpecification" },// 规格
      { name: "lcSkuCode", value: "lcSkuCode" },// LC编码
      { name: "lcSkuCode", value: "goodsLcCode" },// LC编码
      { name: "lcSkuCode", value: "lcCode" },// LC编码
      { name: "skuType", value: "skuType" },// skuType类型
      { name: "skuId", value: "goodsSkuId" },// skuId
      { name: "skuId", value: "skuId" },// skuId
      { name: "totalNum", value: "totalNum" },// 数量
      { name: "totalNum", value: "skuNum" },// 数量
      { name: "priceString", value: "priceString" },// 
    ];
    // 联系人、联系电话
    let { contact, mobile } = this.contactData;
    let params = { contact, mobile };
    arr.forEach( item => {
      params[ item.value ] = row[ item.name ]
    } );

    console.log( 111, params );
    this.params = {
      ...this.params,
      ...params,
      orderSn: this.orderSn,
      storeId: this.memberOrder.storeId,
      applyUserId: this.memberId,
      memberId: this.memberId,
    };
  }

  // 全部申请退款
  showRefundAllApplication ( row ) {
    this.isShowRefundAllApplication = true;
    // 联系人、联系电话
    let { contact, mobile } = this.contactData;
    let params = { contact, mobile };
    this.params = {
      ...this.params,
      ...params,
      orderSn: this.orderSn,
      storeId: this.memberOrder.storeId,
      applyUserId: this.memberId,
      memberId: this.memberId,
    };
    console.log( "全部申请退款 params:", this.params );
  }

  visibleDeliveryTypeDialog: boolean = false
  currDelivery: any = {}
  currDeliveryTime: string = ''
  activeName2: string = 'overview'

  get contactData () {
    let { addressDetail } = this.memberOrder
    addressDetail = addressDetail || '';
    const address = addressDetail.split( ';' ) || []
    // 联系人contact 联系电话mobile
    const contact = address[ 0 ] || '';
    const mobile = address[ 1 ] || '';

    return {
      contact,
      mobile,
      suppContactName: contact,
      suppContactTel: mobile
    }
  }

  get isShowAllApplyRefundBtn () {
    return !!this.deliveryList.filter( delivery => delivery.toDistributeNum > 0 ).length
  }

  get isShowCreateBtn () {
    const { storeInfo, storeId } = this.memberOrder
    // *有待出库数量，且领健自营时可用库存要大于0才显示新建按钮
    // ( v.toDistributeNum > 0 && v.reservedStock > 0 )
    let isExist = this.deliveryList.some( v => {
      return ( ( v.toDistributeNum > 0 && ( storeInfo.distributeWay === 1 ? v.reservedStock > 0 : true ) ) || v.deliverySn == 'unShipped' || v.deliverySn == 'virtual' )
    } )
    let isNoNumber = this.deliveryList.filter( v => {
      const { deliverySn = '' } = v
      return [ 'unShipped', 'virtual' ].includes( deliverySn ) || ( v.toDistributeNum > 0 && ( storeInfo.distributeWay === 1 ? v.reservedStock > 0 : true ) )
    } ).every( i => {
      return +i.totalNum === 0
    } )
    return isExist && !isNoNumber
  }

  get memberId () {
    return this.memberOrder.member
  }
  get deliveryInfoList () {
    let deliveryInfoListItem = this.deliveryList.filter( v => v.toDistributeNum > 0 || v.deliverySn == 'virtual' || v.deliverySn == 'unShipped' )
    return deliveryInfoListItem || []
  }
  @Prop() orderSn: string
  deliverySn: number
  deliveryListVisible: any = false
  refundOrProgressChange ( item ) {
    this.deliveryListItem = { goodsInfo: [ item ], agreePriceString: +item.priceString, isOneRefund: 1 }
    // this.orderSn = this.$route.params.sn
  }
  changeRefundState ( v ) {
    this.deliveryListItem = null
    if ( v ) {
      this.$emit( 'updateOverview' )
    }
  }
  addShipping () {
    this.deliveryListVisible = true
    // this.orderSn = this.$route.params.sn
  }
  deliveryListItem: object = null

  overviewConfig = [
    // 商品物理类型 1：正常商品；2：非实物商品(虚拟)
    // { prop: 'isVirtual', label: '是否虚拟商品', width: '130px' },
    { prop: 'skuName', label: '商品名称', width: '210px' },
    { prop: 'specification', label: '规格', width: '110px' },
    { prop: 'lcSkuCode', label: 'LC编码', width: '210px' },
    { prop: 'code', label: '自有编码', width: '210px' },
    { prop: 'totalNum', label: '数量', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'allocationStatus', label: '配货状态', width: '200px' },
    { prop: 'outStockNum', label: '缺货数', width: '110px' },
    { prop: 'reservedStock', label: '库存预留', width: '110px' },
    { prop: 'distributingNum', label: '下推待出库', width: '110px' },
    { prop: 'outboundNum', label: '已出库', width: '110px' },
    { prop: 'refundNum', label: '已退款', width: '110px' },
    { prop: 'operFlag', label: '操作', width: '110px', fixed: 'right' }
  ]

  @State( state => state.order.config13 ) baseConfig1


  /**
   * distributingNum 配货中
   * toDistributeNum 待配货
   * outboundNum 已出库（代表已完成）
   * refundNum 退货数量
   * allocationStatus = [
      { id: 1, name: '延迟配货' },
      { id: 2, name: '待配货' },
      { id: 3, name: '配货中' },
      { id: 4, name: '已完成' },
      { id: 5, name: '已退款' },
      { id: 6, name: '已取消' }
    ]
   */
  formatDeliverState ( delivery ) {
    if ( delivery[ 'distributingNum' ] || delivery[ 'toDistributeNum' ] ) {
      return delivery.allocationStatus = 3
    }
    if ( delivery[ 'totalNum' ] === delivery[ 'outboundNum' ] || delivery[ 'totalNum' ] === delivery[ 'refundNum' ] || delivery[ 'totalNum' ] === delivery[ 'outboundNum' ] + delivery[ 'refundNum' ] ) {
      return delivery.allocationStatus = 4
    }
    return delivery.allocationStatus = 3
  }

  get formatTableBaseConfig () {
    let tableConfig = [ ...this.overviewConfig ]
    if ( this.memberOrder.storeInfo.distributeWay != 1 ) {
      // * 第三方过滤掉锁定待出库
      let noColumns = [ 'distributingNum' ]
      return tableConfig.filter( ( v, i ) => ( !noColumns.includes( v.prop ) ) )
    }
    return [ ...this.overviewConfig ]
  }

  formatSkuType ( skuType ) {
    return matchArrItem( skuType, skuTypes, 'id' ).name
  }

  allApplyRefund () {
    let deliveryItem: any = this.deliveryList.filter( v => v.toDistributeNum > 0 || v.distributingNum > 0 )
    this.deliveryListItem = { goodsInfo: deliveryItem, isAllRefund: 1 }
    this.deliverySn = deliveryItem && deliveryItem.deliverySn
  }
  changeDeliveryState ( isUpdate ) {
    if ( isUpdate ) {
      this.$emit( 'updateOverview' )
    }
  }
  refresh ( name ) {
    // overview
    this.$emit( "refresh", name );
  }

  // 全部申请退款 
  async getRefundAllServiceApplyInfo () {

    const url = "/serviceOrderController/getRefundAllServiceApplyInfo";
    // API.updateDeliveryTime
    // let { orderSn, skuId, skuType, lcSkuCode, skuNum } = this.params;
    // let reqParams = { orderSn, skuId, skuType, lcSkuCode, skuNum }

    let reqParams = {
      memberId: this.memberId,
      orderSn: this.orderSn,
    };

    const {
      status,
      data: { code, msg, data }
    } = await this.$http( url, reqParams );

    // 未发货数量:toDistributeNum/退款流程中:applyRefundNum /退款数量:refundNum as goodsNum |availableNum 最大退款数
    // let { dictionaryApplyReason, skuInfo, totalRefundAmount } = data;
    // let { minAvailableAmount, maxAvailableAmount, toDistributeNum, applyRefundNum, refundNum: goodsNum, availableNum, refundAmount, } = skuInfo;
    // dictionaryApplyReason = JSON.parse( dictionaryApplyReason ) || [];
    // this.dictionaryApplyReason = dictionaryApplyReason
    // // availableNum = 10
    // let dataParam = { availableNum, goodsNum, refundAmount, dictionaryApplyReason: "" };


    // this.$notify( {
    //   type: "success",
    //   message: msg || "成功"
    // } );
    if ( status == 200 && code !== "A0000" ) {
      this.$notify( {
        type: "error",
        message: msg || "数据获失败"
      } );
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-date-editor.el-input
  width 140px
.order-detail-deliver__item
  margin-top 10px
  > p
    border 2px solid #ccc
    line-height 35px
    padding 5px 20px 0
.refund-introduce
  text-decoration underline
  margin-left 5px
  cursor pointer
.all-refund-btn
  margin 0 0 10px
.delivery-time-link
  color #20a0ff
  cursor pointer
.delay-delivery
  color #20a0ff
.deliverying
  color #FF9900
.deliveryed
  color #008000
</style>
<style lang="stylus">
.order-detail-deliver
  .el-table__body-wrapper
    z-index 1
  .el-dialog.el-dialog--samll
    width 20%
</style>
