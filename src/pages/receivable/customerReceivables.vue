<template>
  <div class="invoice-manage">
    <div class="amount-info">
      <div class="amount-title">
        {{ receivableArrearsInfo.officeName }}-欠款详情
        <span class="amount-title-more">
          {{receivableArrearsInfo.monthly?'月结':'现结'}}
          <template v-if="receivableArrearsInfo.monthly">
            &nbsp;账期:{{receivableArrearsInfo.settlementCycle}}个月&nbsp;
            额度:¥{{rmbFormat(receivableArrearsInfo.creditLine)}}
          </template>
        </span>
      </div>

      <table class="amount-table">
        <tr>
          <td>应收金额:{{ rmbFormat(receivableArrearsInfo.receivableAmount) }}</td>
          <td>已回款金额:{{ rmbFormat(receivableArrearsInfo.moneyBackAmount) }}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>总欠款金额:{{ rmbFormat(receivableArrearsInfo.totalArrearsAmount) }}</td>
          <td>本期欠款:{{ rmbFormat(receivableArrearsInfo.currentArrearsAmount) }}</td>
          <td>逾期欠款:{{ rmbFormat(receivableArrearsInfo.overdueArrearsAmount) }}</td>
          <td>未到期欠款:{{ rmbFormat(receivableArrearsInfo.unexpiredArrearsAmount) }}</td>
          <td>到期应核对欠款:{{ rmbFormat(receivableArrearsInfo.unLaunchedArrearsAmount) }}</td>
        </tr>
      </table>
    </div>

    <lc-condition :condition="condition" @submit="search">
      <template slot="btn">
        <div style="float:left">
          <el-checkbox v-model="allSelected">全选</el-checkbox>
        </div>
      </template>
    </lc-condition>

    <div>
      <receivableList
        :key="randomKey"
        :data="lists"
        ref="receivableList"
        :pageInfo="this.page"
        @curChange="listCurChange"
        @sizeChange="listSizeChange"
        @success="checkAccountSuccess"
      ></receivableList>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import lcTable from "@/components/table/index";
import API from "@/API";
import { rmbFormat } from "@/utils";
import {
  invoiceKind,
  invoiceType,
  khInvoiceStatus,
  receivableTypes
} from "@/pages/order/const/invoiceConst.ts";
import {
  statementStatus,
  checkStatus
} from "@/pages/server/const/serverConstant.ts";
import { deliverySettlementStatus } from "@/pages/order/const/orderSearchCondition";
import receivableList from "@/pages/receivable/components/receivableList.vue";
export default {
  name: "customer-receivables",
  components: {
    lcCondition,
    lcTable,
    receivableList
  },
  inject: [ "formatMyDate" ],
  computed: {
    ...mapState( {
      isAllSelected: state => state.receivable.isAllSelected,
      storeId: state => state.login.storeId
    } ),
    allSelected: {
      get() {
        return this.isAllSelected
      },
      set( val ) {
        this.setIsAllSelected( val )
        // 根据全选或全不选,修改store里面的值
        this.$refs.receivableList.setSelectedAllByParent( val )
      }
    }
  },
  data() {
    return {
      randomKey: null,
      selectAll: false,
      dataId: null,
      customerId: "",
      customerInfo: {},
      invoiceKinds: invoiceKind,
      receivableTypes: receivableTypes,
      receivableArrearsInfo: {},
      condition: [
        {
          value: [],
          key: "initiateDate",
          label: "下单时间",
          type: "daterange"
        },
        { value: "", key: "orderSn", label: "订单号", type: "text" },
        { value: "", key: "receiptNo", label: "出库单号", type: "text" },
        // { value: "", key: "accountCheckSn", label: "对账单号", type: "text" },
        {
          value: [ 0 ],
          key: "checkStatusList",
          label: "对账状态",
          type: "checkbox",
          options: checkStatus
        },
        {
          value: [ 0 ],
          key: "settlementStatusList",
          label: "结算状态",
          type: "checkbox",
          options: deliverySettlementStatus
        },
        {
          value: [],
          key: "invoiceStatusList",
          label: "开票状态",
          type: "checkbox",
          options: khInvoiceStatus
        }
      ],
      page: { cur: 1, total: 0, num: 10 },
      lists: [],
      invoiceItemList: [], // 已经开出的发票记录
      invoiceMsg: {},
      tenantInfo: {},
      orderInfoList: [], // 订单出库信息
      accountInfoList: [], // 对账单出库信息
      invoiceAmount: 0, // 对账单金额汇总
      elecInvoiceStatus: null,
      showInvoiceDialog: false,
      isShowInvoiceBtns: false, // 是否显示发票弹窗按钮
      invoiceParams: { otype: "order", type: "detail", kind: undefined } // invoice弹窗传递的参数 otype order类型订单,对账单, type:操作类型 detail,remark,reverse,kind 发票类型0电子,1纸质
    };
  },
  methods: {
    ...mapMutations( {
      setIsAllSelected: 'receivable/setIsAllSelected',
      clearReceviableCommonSkuList: "receivable/clearReceviableCommonSkuList"
    } ),
    checkAccountSuccess() {
      this.curChange( 1 )
    },
    rmbFormat( str ) {
      return rmbFormat( str )
    },
    selectedAll( data ) {

    },
    curChange( cur ) {
      this.page.cur = cur;
      this.loadData();
    },
    listSizeChange( num ) {
      this.page.num = num;
      this.page.cur = 1;
      this.loadData();
    },
    listCurChange( cur ) {
      this.page.cur = cur;
      this.loadData();
    },
    dataAdapter() {
      let o = { customerId: this.customerId };
      o.num = this.page.num;
      o.start = ( this.page.cur - 1 ) * o.num;
      this.condition.forEach( con => {
        let { key, value, type } = con;
        if ( type == "daterange" ) {
          if ( value && value[ 0 ] ) {
            o[ `startTime` ] = this.formatMyDate( value[ 0 ] );
            o[ `endTime` ] = this.formatMyDate(
              value[ 1 ],
              "yyyy-MM-dd hh:mm:ss",
              true
            );
          }
        } else {
          if ( value !== "" ) {
            o[ key ] = value;
          }
        }
      } );
      return o;
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    },
    formatInvoiceKind( invoiceKind ) {
      return (
        ( this.invoiceKinds[ invoiceKind ] &&
          this.invoiceKinds[ invoiceKind ].name ) ||
        ""
      );
    },
    formatInvoiceStatus( invoiceStatusId ) {
      return (
        ( this.invoiceStatus[ invoiceStatusId ] &&
          this.invoiceStatus[ invoiceStatusId ].name ) ||
        ""
      );
    },
    loadData() {
      this.selectAll = false;
      // this.$permissionValidateWithNotifyEnv(1188,1184)
      let params = this.dataAdapter();
      this.$http( API.customerReceivables, params ).then(
        ( { data } ) => {
          this.lists = data.list || [];
          this.page.total = data.total;
        },
        rej => {
          this.$message( {
            message: rej.msg,
            type: "warning"
          } );
        }
      );
    },
    showInvoiceDetail() {
      this.showInvoiceDialog = true;
    },
    search() {
      this.$permissionValidateWithNotifyEnv( 1207, 1202 )
      this.page.cur = 1;
      this.loadData();
      this.randomKey = Math.random()
    },

    loadReceivableArrears() {
      let { customerId } = this.$route.query
      this.$http( API.getReceivableArrears, {
        storeId: this.storeId,
        customerId
      } )
        .then( ( { data } ) => {
          this.receivableArrearsInfo = data.receivableArrears;
          this.customerId = this.receivableArrearsInfo.customerId;
          this.loadData();
        } )
        .catch( err => {
          this.$message( {
            type: "info",
            message: err.data.msg || "未知错误"
          } );
        } );
    }
  },
  activated() {
    this.loadReceivableArrears();
  },
  deactivated() {
    this.clearReceviableCommonSkuList()
  }
};
</script>
<style lang="stylus" scoped>
.amount-info
  border-bottom 1px solid #e3e3e3
  margin-bottom 15px
.amount-title
  height 40px
  line-height 40px
  border-bottom 1px solid #e3e3e3
.amount-title-more
  float right
.amount-table
  width 100%
  margin-bottom 15px
  tr
    td
      padding 15px
</style>
