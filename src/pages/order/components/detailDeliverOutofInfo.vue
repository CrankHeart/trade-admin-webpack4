<template>
  <div class="order-detail-deliver">
    <!-- {{deliveryList}} -->
    <div style="overflow: hidden; margin-bottom: 20px; padding-right: 20px;">
      <el-button
        v-if="$permissionValidateWithEnv(1269, 1260) && isShowRefresh"
        @click="refresh('outOfDelivryInfo')"
        class="pull-right all-refund-btn"
        type="primary"
        size="small"
      >刷新</el-button>
    </div>
    <div class="order-detail-deliver__item" v-for="delivery in deliveryList" :key="delivery.id">
      <template v-if="delivery.wantSlipsState !== 2">
        <!-- 接口配货 -->
        <p
          v-if="
            memberOrder.storeInfo.distributeWay == 1 &&
            getTableData(delivery).length
          "
        >
          <template>
            <span
              :class="{
                'not-released': delivery.deliveryState === 1,
                'out-of-stock': delivery.deliveryState === 2,
              }"
            >{{ formatDeliverState(delivery) }}</span>
          </template>
          <template>
            <span>&nbsp;出库单号：</span>
            <span>{{ delivery.deliverySn || " " }}</span>
          </template>
          <template>
            <span>&nbsp;下推时间：</span>
            <span>
              {{
              delivery.createDate
              ? formatMyDate(delivery.createDate, "yyyy-MM-dd")
              : " "
              }}
            </span>
          </template>
          <template>
            <span>&nbsp;下推WMS：</span>
            <span>{{ delivery.wmsType | getWmsTypeName }}</span>
          </template>
          <template v-if="showPrintBtn(delivery)">
            <span>&nbsp;回传时间：</span>
            <span>
              {{
              delivery.callBackDate
              ? formatMyDate(delivery.callBackDate, "yyyy-MM-dd")
              : " "
              }}
            </span>
          </template>
          <template>
            <div>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;物流公司：</span>
              <span>
                {{
                delivery.logis && delivery.logis.length
                ? delivery.logis[0].companyName
                : ""
                }}
              </span>
              <a
                class="seelogisInfo"
                href="javascript:void(0)"
                v-if="showPrintBtn(delivery)"
                @click="seeLogisInfo(delivery)"
              >查看包裹信息</a>
            </div>
          </template>
          <template>
            <el-button
              type="primary"
              size="small"
              v-if="
                $permissionValidate(revokefPermission) &&
                showRevokeBtn(delivery)
              "
              @click="revokef(delivery.deliverySn)"
              class="pull-right"
            >撤销</el-button>
            <el-button
              type="primary"
              size="small"
              v-if="$permissionValidate(671) && showPrintBtn(delivery)"
              @click="printf(delivery.deliverySn)"
              class="pull-right"
            >下载出库单</el-button>
            <el-button
              type="primary"
              size="small"
              v-if="$permissionValidate(671) && showPrintBtn(delivery)"
              @click="downloadPdf(delivery.deliverySn)"
              class="pull-right"
            >导出PDF</el-button>
            <!-- <el-button
              type="primary"
              size="small"
              v-if="showInvoiceDownloadBtn(delivery) "
              @click="downloadExcel(delivery.deliverySn)"
              class="pull-right"
            >导出发票Excel
            </el-button>-->
            <div class="clearBoth"></div>
          </template>
        </p>
        <!-- 手工配货 -->
        <p
          v-else-if="
            memberOrder.storeInfo.distributeWay != 1 &&
            getTableData(delivery).length
          "
        >
          <template>
            <span
              :class="{
                'not-released': delivery.deliveryState === 1,
                'out-of-stock': delivery.deliveryState === 2,
              }"
            >{{ formatDeliverState(delivery) }}</span>
          </template>
          <template v-if="formatDeliverState(delivery) !== '未出库'">
            <template>
              <span>&nbsp;出库单号：</span>
              <span>{{ delivery.deliverySn || " " }}</span>
            </template>
            <template>
              <span>&nbsp;物流公司：</span>
              <span>
                {{
                delivery.logis && delivery.logis.length
                ? delivery.logis[0].companyName
                : ""
                }}
              </span>
            </template>
            <template>
              <span>&nbsp;新建时间：</span>
              <span>
                {{
                delivery.createDate
                ? formatMyDate(delivery.createDate, "yyyy-MM-dd")
                : " "
                }}
              </span>
            </template>
            <el-button
              type="primary"
              size="small"
              v-if="$permissionValidate(671) && showPrintBtn(delivery)"
              @click="printf(delivery.deliverySn)"
              class="pull-right"
            >下载出库单</el-button>
            <el-button
              type="primary"
              size="small"
              v-if="$permissionValidate(671) && showPrintBtn(delivery)"
              @click="downloadPdf(delivery.deliverySn)"
              class="pull-right"
            >导出PDF</el-button>
            <!-- <el-button
              type="primary"
              size="small"
              v-if="showInvoiceDownloadBtn(delivery) "
              @click="downloadExcel(delivery.deliverySn)"
              class="pull-right"
            >导出发票Excel</el-button>-->
            <div class="clearBoth"></div>
          </template>
        </p>
        <lc-table
          v-if="getTableData(delivery).length"
          :max-height="500"
          :config="formatTableBaseConfig(delivery)"
          :data="getTableData(delivery)"
          :has-page="false"
        >
          <template slot-scope="scope">
            <template>{{ scope.row[scope.con.prop] }}</template>
          </template>
        </lc-table>
      </template>
    </div>
    <after-sales-logis :dialogVisible.sync="logisDialogVisible" :data="currLogisMsg" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import API from "../../../API";
import { State, Action } from "vuex-class";
import lcTableConfig from "../../../components/table/control.vue";
import lcTable from "../../../components/table/";
import AfterSalesLogis from "./AfterSalesLogis.vue";
import { deliveryStates } from "../const/orderSearchCondition";
import { matchArrItem } from "../../../utils/";
import { wmsTypes } from "../const/orderDistribute";
import { Log } from "oidc-client";

const linkedCareStoreId: number[] = [ 5, 280, 282, 284 ]; // 领健相关的 storeId

@Component( {
  name: "detail-deliver-outof-info",
  components: {
    lcTable,
    lcTableConfig,
    AfterSalesLogis,
  },
  filters: {
    getWmsTypeName ( type ) {
      let a = wmsTypes.find( ( item ) => item.id == type );
      return !!a ? a.name : "TTX";
    },
  },
} )
export default class DetailDeliverOutofInfo extends Vue {
  @Prop( { default: {} } )
  memberOrder: any;

  @Prop() deliveryList: any[];

  @Action( "stores/isZiYing" ) isZiYing;

  currLogisMsg: any[] = [];
  logisDialogVisible: boolean = false;
  seeLogisInfo ( delivery ) {
    this.logisDialogVisible = true;
    this.currLogisMsg = delivery.logis || [];
  }
  get revokefPermission () {
    return process.env.NODE_ENV == "production" ? 1141 : 1143;
  }
  showInvoiceDownloadBtn ( delivery ) {
    const { deliveryState } = delivery;
    const { storeId = -1 } = this.memberOrder;
    // 5 领健自营
    // 纸质发票
    return deliveryState == 2 && storeId == 5;
  }

  showPrintBtn ( delivery ) {
    const { orderStatus, storeId } = this.memberOrder;
    const { deliveryState, deliveryType } = delivery;
    // return deliveryState === 2 && deliveryType === 0 && linkedCareStoreId.indexOf( storeId ) > -1
    // 如果是bms,不显示下载按钮
    return (
      deliveryState === 2 && deliveryType === 0 && delivery.wareHouse != "BMS"
    );
  }

  showRevokeBtn ( delivery ) {
    const { orderStatus, storeId } = this.memberOrder;
    const { deliveryState } = delivery;
    return deliveryState == 1 && linkedCareStoreId.includes( storeId );
  }

  getTableData ( delivery ) {
    return delivery.outBoundDetails && delivery.outBoundDetails.length
      ? delivery.outBoundDetails
      : delivery.deliverySn !== "virtual"
        ? delivery.item
        : [];
  }

  deliverySn: number;

  @State( ( state ) => state.order.config13 ) baseConfig1;

  formatTableBaseConfig ( delivery ) {
    let tableConfig = [ ...this.baseConfig1 ];
    let columns: any[] = [];
    // *未出库且虚拟, 已提交状态时未出库状态
    let outOfDelivry =
      delivery.deliveryState === 0 ||
      delivery.deliveryState === 1 ||
      delivery.deliverySn == "virtual" ||
      delivery.deliverySn == "unShipped";
    if ( outOfDelivry ) {
      columns = [ "name", "specification", "lcCode", "code", "number", "unit" ];
    } else {
      columns = [
        "name",
        "specification",
        "lcCode",
        "code",
        "number",
        "unit",
        "registrationCertificate",
        "lotNumber",
        "expirationDate",
        "agreePrice",
        "discountAmount",
        "sharedSubtotal",
      ];
    }
    // * 按原型顺序
    return columns.map( ( item ) =>
      tableConfig.find( ( field ) => field.prop === item )
    );
    // * 按config顺序
    // return tableConfig.filter( ( v, i ) => ( columns.includes( v.prop ) ) )
  }

  get isShowRefresh () {
    let len = this.deliveryList.length;
    // <template
    //     v-if="delivery.wantSlipsState !== 2"
    //   >
    //     <!-- 接口配货 -->
    //     <p v-if="memberOrder.storeInfo.distributeWay == 1 && getTableData( delivery ).length">
    let isShow = false;

    for ( let i = 0; i < len; i++ ) {
      let delivery = this.deliveryList[ i ];
      if (
        delivery.wantSlipsState !== 2 &&
        this.memberOrder.storeInfo.distributeWay == 1 &&
        this.getTableData( delivery ).length
      ) {
        isShow = true;
        break;
      }
    }
    console.log( "emit-show-outofdelivryinfo", isShow );
    this.$emit( "emit-show-outofdelivryinfo", isShow );
    return isShow;
  }

  formatDeliverState ( { deliveryState, deliverySn } ) {
    if ( deliverySn === "refund" ) {
      return "已退款";
    } else if ( deliverySn === "virtual" ) {
      return "无出库单";
    } else if ( deliverySn === "unShipped" ) {
      return "下推中";
    } else {
      let name = matchArrItem( deliveryState, deliveryStates, "id" ).name;
      return name === "未出库" ? "下推中" : name;
    }
  }

  @Inject() formatMyDate;
  @Inject() app;
  @Prop() orderSn: string;
  printf ( id ) {
    const { storeInfo } = this.memberOrder;
    if ( storeInfo.distributeWay === 1 ) {
      this.$submit( API.printChuKuDan, {
        deliverySn: id,
        unitNum: 1,
      } );
    } else {
      this.$submit( API.printTrusteeshipChuKuDan, {
        orderSn: this.orderSn,
      } );
    }
  }
  // TODO: 导出PDF http://jira.linkedcare.cn:8000/browse/ET-4461
  downloadPdf ( id ) {
    const url = "/business/order/exportChuKuDanPDF";
    this.$submit( url, { deliverySn: id, unitNum: 1 } );
  }

  downloadExcel ( id ) {
    this.$submit( API.exportWithGoodsInvoice, {
      orderSn: this.orderSn,
      deliverySn: id,
    } );
  }

  revokef ( id ) {
    this.$http( API.withdrawDeliveryOrder, {
      deliverySn: id,
    } )
      .then( ( { data } ) => {
        this.$emit( "updateOutofInfo" );
        this.$notify( {
          type: "success",
          message: "撤销成功",
        } );
        // 刷新顶层组件的所有数据
        this.app.refreshAll();
      } )
      .catch( ( err ) => {
        this.$notify( {
          type: "error",
          message: err.msg || "撤销失败",
        } );
      } );
  }
  refresh ( name ) {
    // overview
    this.$emit( "refresh", name );
  }
}
</script>
<style lang="stylus" scoped>
.el-date-editor.el-input
  width 140px
.order-detail-deliver__item
  > p
    border 2px solid #ccc
    line-height 35px
    padding 5px 20px 0
    font-size 14px
    > .seelogisInfo
      text-decoration underline
      color #20A0FF
    .not-released
      color #FF9900
    .out-of-stock
      color #008000
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
.clearBoth
  width 100%
  clear both
</style>
<style lang="stylus">
.order-detail-deliver
  .el-table__body-wrapper
    z-index 1
  .el-dialog.el-dialog--samll
    width 20%
</style>
