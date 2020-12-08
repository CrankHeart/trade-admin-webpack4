<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" labelWidth="100px" @submit="search"></lc-condition>
    <lc-table
      selection
      :config="config"
      :data="lists"
      :page="page"
      :key="'voucherSn'"
      @cur-change="curChange"
      @data-selection-change="selectionChange"
    >
      <template slot-scope="{row,con}">
        <!-- 操作 -->
        <template v-if="con.prop === 'control'">
          <el-button @click="openDialog(row)" type="primary" size="small">查看详情</el-button>
        </template>
        <!-- 审核通过时间 -->
        <template v-if="con.prop === 'reviewDate'">{{ formatDate(row[con.prop]) }}</template>
        <!-- 凭证金额、未核销金额	 -->
        <template v-if="['amount', 'unWrittenOffAmount'].includes(con.prop)">
          <span>{{ row[con.prop] | fixed2 }}</span>
        </template>
        <!-- 需退款金额 -->
        <template v-if="con.prop === 'refundAmount'">
          <el-input-number
            v-model="row.refundAmount"
            size="small"
            :disabled="!row.valid"
            :min="0"
            :max="row.unWrittenOffAmount"
          ></el-input-number>
        </template>
        <!-- 付款凭证 -->
        <template v-if="con.prop === 'voucherSn'">{{ row[con.prop] }}</template>
      </template>
    </lc-table>
    <div class="amount-info">
      申请退款总金额：
      <span>{{ redundTotalAmount | fixed2 }}</span>
    </div>
    <!-- 付款凭证详情弹框 -->
    <refund-voucher-dialog
      v-if="isShowRefundVocherDialog"
      :isShowRefundVocherDialog.sync="isShowRefundVocherDialog"
      :voucherSn="voucherSn"
    ></refund-voucher-dialog>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import RefundVoucherDialog from "./refundVoucherDialog.vue";
import lcTable from "@/components/table/index";
import { matchArrItem, openNewWebWin, formatPrice } from "@/utils/";
import { voucherStatuses } from "@/pages/server/const/paymentVoucherConst.ts";
import API from "@/API";

const conditionByOrderType = [
  {
    value: "",
    key: "voucherSn",
    label: "付款凭证编号",
    type: "text",
  },
  {
    value: "",
    key: "checkingDate",
    label: "审核时间",
    type: "daterange",
  },
];

const configByOrderType = [
  { prop: "voucherSn", label: "付款凭证编号", width: "220px" },
  { prop: "reviewDate", label: "审核通过时间", width: "220px" },
  { prop: "amount", label: "凭证金额", width: "220px" },
  { prop: "unWrittenOffAmount", label: "未核销金额", width: "220px" },
  { prop: "refundAmount", label: "需退款金额", width: "220px" },
  { prop: "control", label: "操作", width: "160px", fixed: "right" },
];

export default {
  name: "refund-voucher",
  components: {
    lcCondition,
    lcTable,
    RefundVoucherDialog,
  },
  inject: [ "formatMyDate" ],
  props: {
    customerInfo: {
      type: Object,
    },
  },
  watch: {
    customerInfo: "loadData",
    selectedLists: "doEmit",
  },
  data() {
    return {
      orderType: 1,
      selectedLists: [],
      condition: conditionByOrderType,
      config: configByOrderType,
      page: { cur: 1, total: 0, num: 20 },
      lists: [],
      isShowRefundVocherDialog: false,
    };
  },
  computed: {
    // 计算勾选记录需退款金额总数
    redundTotalAmount() {
      return this.selectedLists.reduce( ( acc, cur ) => acc + cur.refundAmount, 0 );
    },
  },
  methods: {
    // 查看详情
    openDialog( row = {} ) {
      this.voucherSn = row.voucherSn;
      this.isShowRefundVocherDialog = true;
    },
    /**
     * 选择记录操作
     */
    selectionChange( items ) {
      this.selectedLists = items;
      // 勾选的记录记录退款金额调整
      this.lists.forEach( ( v ) => {
        v.valid = this.selectedLists.some( ( w ) => w.voucherSn == v.voucherSn );
      } );
    },

    // 提交父组件所选付款凭证记录
    doEmit() {
      this.$emit( "selectedLists", this.selectedLists );
    },

    formatDate( date = {} ) {
      return date.time ? this.formatMyDate( date.time ) : "";
    },
    curChange( cur ) {
      this.page.cur = cur;
      this.loadData();
    },
    dataAdapter() {
      let o = {};
      o.num = this.page.num;
      o.start = ( this.page.cur - 1 ) * o.num;
      this.condition.forEach( ( con ) => {
        let { key, value, type } = con;
        if ( type == "daterange" ) {
          if ( value && value[ 0 ] ) {
            o[ `${key}Begin` ] = this.formatMyDate( value[ 0 ] );
            o[ `${key}End` ] = this.formatMyDate(
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
    loadData() {
      if ( !this.customerInfo.customerId ) {
        return;
      }
      let params = this.dataAdapter();
      params.customerId = this.customerInfo.customerId;
      this.$http( API[ "getPaymentVoucherRefund" ], {
        ...params,
      } ).then( ( { data } ) => {
        this.lists = data.data.list.map( ( v ) => {
          return Object.assign( {}, v, {
            refundAmount: v.unWrittenOffAmount,
            valid: false,
          } );
        } );
        this.page.total = data.data.total;
      } );
    },
    search() {
      this.page.cur = 1;
      this.loadData();
    },
  },
  created() {
    this.loadData();
  },
};
</script>
<style lang="stylus" scoped>
.scope-row
  min-height 30px
  line-height 30px
  margin 0 -18px
  text-indent 18px
  + .scope-row
    border-top 1px solid #dfe6ec
.amount-info
  text-align right
  height 30px
  line-height 30px
  span
    color red
</style>
