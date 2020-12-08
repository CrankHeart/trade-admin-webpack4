<template>
  <div id="order-detail">
    <lc-title text="订单详情">
      <el-button
        :type="memberOrder.orderStatus === 6 ? 'danger' : 'primary'"
      >{{ formatStatus(memberOrder.orderStatus) }}</el-button>
      <el-button
        type="success"
        v-if="memberOrder.firstOrder === 1"
      >{{ formatIsFirstOrderStatus(memberOrder.firstOrder) }}</el-button>
      <el-button
        type="warning"
        v-if="memberOrder.orderType === 1"
      >{{ formatOrderTypeStatus(memberOrder.orderType) }}</el-button>
    </lc-title>
    <detail-info :data="memberOrder" :usersCustomerOffice="usersCustomerOffice"></detail-info>
    <el-tabs v-model="activeName">
      <el-tab-pane label="商品信息" name="goodsInfo" v-if="$permissionValidate(693)">
        <!-- 商品信息 -->
        <DetailGoods class="item-margin" :data="memberOrder.itemList" @refresh="refresh"></DetailGoods>
        <!-- 价格总计 -->
        <detail-payment class="item-margin" :data="memberOrder" @payment-change="paymentChange"></detail-payment>

        <!-- <div class="item-margin" v-if="memberOrder.remark">
          <h3>用户留言</h3>
          <br />
          <div class="message">
            <el-input type="textarea" v-model="memberOrder.remark" :disabled="true"></el-input>
          </div>
        </div>
        <div class="item-margin">
          <h3>备注</h3>
          <br />
          <el-input
            :disabled="!$permissionValidate(543)"
            type="textarea"
            v-model.trim="memberOrder.operationNote"
          ></el-input>
        </div>
        <el-row class="center item-margin" v-if="!orderSn">
          <el-button @click="cancel">取消</el-button>
          <el-button v-if="$permissionValidate(550)" type="primary" @click="save">保存</el-button>
        </el-row>-->
      </el-tab-pane>

      <el-tab-pane
        v-if="
          [1, 2, 5, 7].includes(memberOrder.orderStatus) &&
          $permissionValidate(694)
        "
        label="发货信息"
        name="deliverInfo"
      >
        <!-- 2018.11.22 物流信息这个接口是以前的,不需要更新了 -->
        <!--  @logistic-change="logisticChange" -->
        <DetailDeliver
          v-if="activeName == 'deliverInfo'"
          :orderSn="orderSn"
          :order-detail-data="orderDetailData"
          :memberOrder="memberOrder"
          @change-detail="getOrderDetail"
        ></DetailDeliver>
      </el-tab-pane>
      <!-- v-if="$permissionValidateWithEnv( 1206,1203 ) && !memberOrder.orderType" -->

      <el-tab-pane label="售后信息" name="afterSale" v-if="isShowAfterSale">
        <AfterSale v-if="activeName == 'afterSale'" :orderSn="orderSn" :memberId="memberId"></AfterSale>
      </el-tab-pane>
      <el-tab-pane label="发票信息" name="detailInvoice" v-if="$permissionValidate(1064)">
        <detail-invoice
          :id="orderSn"
          :tenantId="memberOrder.tenantId"
          :officeId="memberOrder.officeId"
          :order-status="memberOrder.orderStatus"
          :order-type="memberOrder.orderType"
        ></detail-invoice>
      </el-tab-pane>
      <el-tab-pane
        label="支付信息"
        name="payInfo"
        v-if="$permissionValidateWithEnv(1206, 1203) && !memberOrder.orderType"
      >
        <orderPayment :detail="memberOrder" :orderSn="orderSn"></orderPayment>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Provide, Inject, Prop } from "vue-property-decorator";
import { Action } from "vuex-class";
import orderPayment from "@/pages/server/components/orderPayment.vue";
import lcTitle from "../../components/title.vue";
import API from "../../API";
import detailInfo from "./components/detailInfor.vue";

// 商品信息 detailGoods detailPayment
import DetailGoods from "./components/detailGoods.vue";
import detailPayment from "./components/detailPayment.vue";
// 发货信息
import DetailDeliver from "./components/detailDeliver.vue";
// 售后信息
import AfterSale from "./components/afterSale/index.vue";
// 发票信息
import detailInvoice from "./components/detailInvoice.vue";
import {
  agreePriceTypes,
  orderAllStatus,
  orderTypes,
  isFirstOrder,
} from "./const/orderSearchCondition";
import { invoiceKind } from "./const/invoiceConst";
import { matchArrItem } from "../../utils/";

import { serviceType } from "../order/components/afterSale/status";

@Component( {
  name: "order-detail",
  components: {
    lcTitle,
    detailInfo,
    DetailGoods,
    DetailDeliver,
    detailPayment,
    AfterSale, // 售后信息
    detailInvoice,
    orderPayment,
  },
} )
export default class OrderDetail extends Vue {
  @Action( "message/msgHandled" ) callBack;
  @Prop( {
    type: String,
    default: function () {
      console.log( this.$route.params );
      return this.$route.params.sn;
    },
  } )
  orderSn?: string;

  @Provide() params = {
    orderSn: this.orderSn,
  };



  data: any = {};
  activeName: any = "";
  get memberOrder () {
    return this.data.memberOrder || {};
  }
  get memberId () {
    const { member = "" } = this.memberOrder;
    return member;
  }
  get usersCustomerOffice () {
    return this.data.usersCustomerOffice || {};
  }
  get deliveryList () {
    return this.data.deliveryList || [];
  }
  get orderDetailData () {
    return this.data || {};
  }
  formatStatus ( status ) {
    return orderAllStatus[ status ];
  }
  formatOrderTypeStatus ( item ) {
    const name = matchArrItem( item, orderTypes, "id" ).name;
    return name ? name.replace( "订单", "" ) : "";
  }
  formatIsFirstOrderStatus ( item ) {
    return matchArrItem( item, isFirstOrder, "id" ).name;
  }
  isErr: boolean = false;
  created () {
    this.getOrderDetail();
    let { invoice = 0 } = this.$route.query;
    if ( this.$permissionValidate( 1064 ) && invoice ) {
      this.activeName = "detailInvoice";
    } else if ( this.$permissionValidate( 693 ) ) {
      this.activeName = "goodsInfo";
    } else if ( this.$permissionValidate( 694 ) ) {
      this.activeName = "deliverInfo";
    } else if ( this.$permissionValidate( 1064 ) ) {
      this.activeName = "detailInvoice";
    } else {
    }
    this.isErr = false;

    // 售后信息 是否有数据
    this.queryAfterSaleData();
  }

  refresh ( name ) {
    // 刷新商品信息tab下所有数据 
    if ( name == "memberOrder" ) {
      this.getOrderDetail();
    }
  }

  getOrderDetail () {
    ( this as any ).$permissionValidateWithNotify( 461 );
    ( this as any )
      .$http( API.getOrderDetail, {
        orderSn: this.$route.params.sn || this.orderSn,
      } )
      .then( ( { data } ) => {
        data.memberOrder.itemList.forEach( ( v, i ) => {
          let myAgreePriceType = agreePriceTypes.filter(
            ( val ) => val.id == v.agreePriceType
          )[ 0 ] || { name: "" };
          v.myAgreePriceType = myAgreePriceType.name;
        } );
        data.deliveryList &&
          data.deliveryList.forEach( ( val ) => {
            val.item.forEach( ( v ) => {
              let logis =
                ( val.logis || [] ).filter(
                  ( m ) => m.skuDetail.indexOf( v.lcCode ) > -1
                )[ 0 ] || {};
              v = Object.assign( v, {
                companyName: logis.companyName,
                trackingNumber: logis.logisticNo,
                skuNum: v.number,
                deliverySn: val.deliverySn,
                orderSn: val.orderSn,
                deliveryState: val.deliveryState,
                deliveryType: val.deliveryType,
              } );
            } );
          } );
        data.memberOrder.groundDiscountString = data.memberOrder.groundDiscount.toFixed(
          2
        );
        const operationNote = data.memberOrder.operationNote;
        data.memberOrder.operationNote =
          operationNote == "null" ? "" : operationNote;
        this.data = data;
      } );
  }
  cancel () {
    this.$router.go( -1 );
  }
  save () {
    if ( !this.isErr ) {
      this.saveExtraInfo();
    } else {
      this.$notify( {
        type: "error",
        message: "地推优惠不能大于总金额！",
      } );
    }

    // if ( this.isLogisticsChanged ) {
    //   this.updateLogistics()
    // }
  }
  // isLogisticsChanged: boolean = false
  logisticChange ( v ) {
    // this.isLogisticsChanged = v
  }
  @Inject() formatMyDate;
  paymentChange ( v ) {
    this.isErr = v;
  }
  saveExtraInfo () {
    const data = this.memberOrder;
    this.$http( API.saveExtraInfo, {
      groundDiscountAmount:
        this.memberOrder.orderStatus === 0 ? data.groundDiscountString : "0",
      id: data.id,
      applyReasons: "运营后台申请",
      operationNote: data.operationNote,
      orderSn: data.sn,
      broadcast: true,
    } ).then( ( res ) => {
      // this.$notify({
      //   type: 'success',
      //   message: '保存成功'
      // })
      let { type } = this.$route.query;
      if ( type !== undefined ) {
        this.callBack( { id: data.sn, type } );
      }
    } );
  }

  afterSaleDataTotal: number = 0;
  // isShowAfterSale: boolean = true;
  get isShowAfterSale () {
    const flag = !!this.afterSaleDataTotal;
    // console.log( "isShowAfterSale flag", flag );
    return flag;
  }

  queryAfterSaleData () {
    serviceType.forEach( ( { id } ) => this.search( id ) );
  }

  search ( serviceType ) {
    const url = "/serviceOrderController/getServiceOrders";
    let reqParams = { ...this.params, serviceType, memberId: this.memberId };

    ( this as any ).$http( url, reqParams ).then(
      ( { data } ) => {
        data = data.data;
        const { total } = data;
        this.afterSaleDataTotal += total;
        console.log( "queryAfterSaleData data:", serviceType, total, this.afterSaleDataTotal );
      },
      ( rej ) => {
        // 失败
      }
    );
  }
  // updateLogistics () {
  //   let deliveryList = this.deliveryList
  //   let o = {
  //     id: this.$route.params.id,
  //     LogisticsList: []
  //   }
  //   deliveryList.forEach( val => {
  //     val.item.forEach( v => {
  //       o.LogisticsList.push( {
  //         companyNameId: v.companyId,
  //         trackingNumber: v.trackingNumber,
  //         id: v.id,
  //         remark: v.remark,
  //         storage: v.storage,
  //         batchNumber: v.batchNumber,
  //         deliveryTime: v.deliveryTime
  //           ? this.formatMyDate( v.deliveryTime, "yyyy-MM-dd" )
  //           : "",
  //         expirationDate: v.expirationDate
  //           ? this.formatMyDate( v.expirationDate, "yyyy-MM-dd" )
  //           : ""
  //       } )
  //     } )
  //   } )
  //   // data.itemList.forEach((v, i) => {

  //   // })
  //   // this.$http( API.updateLogisticsInformation, o ).then( res => {
  //   //   this.isLogisticsChanged = false
  //   // } )
  // }
}
</script>
<style lang="stylus">
#order-detail
  .tips
    padding 10px 12px
    background #20a0ff
    color #fff
    border-radius 8px
    margin-bottom 15px
    float right
    font-size 16px
  >div
    margin-bottom 15px
  .item-margin
    margin-top 20px
</style>
