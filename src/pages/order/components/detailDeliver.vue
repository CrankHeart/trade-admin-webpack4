<template>
  <div class="order-detail-deliver">
    <!-- 总览 overview -->
    <el-collapse v-model="overview" accordion v-if="overviewDelivryList.length">
      <el-collapse-item name="1">
        <template slot="title">
          <strong class="send-title">发货情况一览</strong>
        </template>
        <detailDeliverOverview
          :memberOrder="memberOrder"
          :deliveryList="overviewDelivryList"
          :orderSn="sn"
          @updateOverview="updateOverview"
          @refresh="refresh"
        ></detailDeliverOverview>
      </el-collapse-item>
    </el-collapse>
    <!-- 缺货信息 -->
    <!-- 缺货信息 —— memberOrder.storeInfo.distributeWay {{memberOrder.storeInfo.distributeWay}} -->
    <el-collapse
      v-model="shortageInfo"
      accordion
      v-if="memberOrder.storeInfo.distributeWay==1 && shortageInfoDelivryList.length"
    >
      <el-collapse-item name="1">
        <template slot="title">
          <strong class="send-title">缺货信息</strong>
        </template>
        <detailDeliverShortageInfo
          v-if="shortageInfoDelivryList.length"
          :memberOrder="memberOrder"
          :deliveryList="shortageInfoDelivryList"
          :orderSn="sn"
          @refresh="refresh"
        ></detailDeliverShortageInfo>
      </el-collapse-item>
    </el-collapse>
    <!-- 出库信息 -->
    <el-collapse v-model="outOfDelivryInfo" accordion v-show="isShowOutOfDelivryInfo">
      <el-collapse-item name="1">
        <template slot="title">
          <strong class="send-title">出库单列表</strong>
        </template>
        <detailDeliverOutofInfo
          :memberOrder="memberOrder"
          :deliveryList="outOfInfoDelivryList"
          :orderSn="sn"
          @updateOutofInfo="updateOutofInfo"
          @refresh="refresh"
          @emit-show-outofdelivryinfo="handleShowOutOfDelivryInfo"
        ></detailDeliverOutofInfo>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Prop, Provide } from "vue-property-decorator";
import API from "../../../API";
import detailDeliverOverview from "./detailDeliverOverview.vue";// 总览
import detailDeliverShortageInfo from "./detailDeliverShortageInfo.vue";// 缺货信息
import detailDeliverOutofInfo from "./detailDeliverOutofInfo.vue";// 出库信息

@Component( {
  name: "orde-detail-deliver",
  components: {
    detailDeliverOverview,
    detailDeliverOutofInfo,
    detailDeliverShortageInfo
  }
} )
export default class OrderDetailDeliver extends Vue {
  @Provide( "app" )
  app = {
    refreshAll: this.refreshAll
  }

  @Inject() formatMyDate;
  @Prop( { default: {} } )
  memberOrder: any;
  @Prop( { default: () => { } } ) orderDetailData: any;
  @Prop() orderSn: string;

  orderDetailDeliver: string = "overview";
  deliveryList: any[] = [];

  overview: string = "1"; // 总览
  shortageInfo: string = "1"; // 缺货信息
  outOfDelivryInfo: string = "1"; // 出库信息
  isShowOutOfDelivryInfo: boolean = true; // 出库信息

  handleShowOutOfDelivryInfo ( flag: boolean = false ) {
    console.log( "emit flag", flag );
    this.isShowOutOfDelivryInfo = flag;
  }

  get sn () {
    return this.orderSn || this.$route.params.sn;
  }

  mounted () {
    // 页面初始化方法
    this.refreshAll();
  }

  refreshAll () {

    // 页面初始化方法
    this.getOverviewList(); // 总览
    this.getShortageInfoList(); // 缺货信息
    this.getOutOfInfoList(); // 出库信息
  }

  // handleClick(tab, event) {
  //   if (tab.name === "overview") {
  //     this.getOverviewList();
  //   } else if (tab.name === "outOfDelivryInfo") {
  //     this.getOutOfInfoList();
  //   } else {
  //     this.getShortageInfoList();
  //   }
  // }

  // 发货情况一览
  overviewDelivryList: any[] = [];
  getOverviewList () {
    this.$http( API.getOverview, {
      orderSn: this.sn
    } ).then( ( { data } ) => {
      let { poolList } = data;
      console.log( "overviewDelivryList", poolList );

      this.overviewDelivryList = poolList;
    } );
  }
  outOfInfoDelivryList: any[] = [];
  getOutOfInfoList () {
    this.$http( API.getOutBoundDetail, {
      orderSn: this.sn
    } ).then( ( { data } ) => {
      this.outOfInfoDelivryList = data.deliveryList;
    } );
  }

  refresh ( name ) {
    // 总览overview/缺货信息shortageInfo/出库信息outOfDelivryInfo
    // console.log("refresh:", name);
    if ( name === "overview" ) {
      this.getOverviewList();
    } else if ( name === "shortageInfo" ) {
      this.getShortageInfoList();
    } else {
      this.getOutOfInfoList();
    }
  }
  shortageInfoDelivryList: any[] = [];
  getShortageInfoList () {
    this.$http( API.getWantSlipsInfo, {
      orderSn: this.sn
    } ).then( ( { data } ) => {
      console.log( "data.wantSlipsInfo==>", data.wantSlipsInfo );
      // 清洗时间数据
      let deliveryList = data.wantSlipsInfo.map( item => {
        let { deliveryDate, expectedDate } = item || {};
        deliveryDate = deliveryDate || {};
        expectedDate = expectedDate || {};
        let deliveryTime = deliveryDate.time;
        let expectedTime = expectedDate.time;

        item.deliveryDataTime = deliveryTime ? new Date( deliveryTime ) : "";
        item.expectedDataTime = expectedTime ? new Date( expectedTime ) : "";
        item.deliveryTime = this.formatMyDate( deliveryTime, "yyyy-MM-dd" );
        item.expectedTime = this.formatMyDate( expectedTime, "yyyy-MM-dd" );

        return item;
      } );

      console.log( "data.deliveryList==>", deliveryList );
      this.shortageInfoDelivryList = deliveryList;
    } );
  }

  updateOverview () {
    this.getOverviewList();
  }
  updateOutofInfo () {
    this.getOutOfInfoList();
  }


}
</script>
<style lang="stylus" scoped>
.send-title
  font-size 18px
  font-weight bolder
  color #000
.el-date-editor.el-input
  width 140px
.order-detail-deliver__item
  > p
    border 2px solid #ccc
    line-height 35px
    padding 5px 20px 0
.refund-introduce
  text-decoration underline
  margin-left 5px
  cursor pointer
.all-refund-btn
  margin 0 -20px 0 10px
.delivery-time-link
  color #20a0ff
  cursor pointer
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>
<style lang="stylus">
.order-detail-deliver
  .el-table__body-wrapper
    z-index 1
  .el-dialog.el-dialog--samll
    width 20%
</style>
