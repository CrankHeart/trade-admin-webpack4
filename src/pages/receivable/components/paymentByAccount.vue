<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" labelWidth="100px" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="lists"
      @cur-change="curChange"
      :page="page"
      :key="orderType ? 'accountCheckSn' : 'orderSn'"
      selection
      @data-selection-change="selectionChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'control'">
          <el-button @click="openDialog(row)" type="primary" size="small">详情</el-button>
        </template>
        <template v-if="con.prop == 'bakRelatedAmount'">
          <el-tooltip
            v-if="row.writtenOffAmount <= 0"
            :content="`该单据当前可核销金额${maxAmount(row)}`"
            placement="top"
          >
            <i class="el-icon-information"></i>
          </el-tooltip>
          <template v-if="row.amount>=0">
            <el-input-number
              :debounce="800"
              size="small"
              :max="row.maxAmount"
              :min="0"
              v-model="row.bakRelatedAmount"
              :disabled="disabledByChecked( row )"
            ></el-input-number>
          </template>
          <template v-else>
            <span>{{row.bakRelatedAmount}}</span>
          </template>
        </template>
        <template
          v-else-if="con.prop == 'checkDate' || con.prop == 'createDate'"
        >{{ formatMyDate(row[con.prop] && row[con.prop].time) }}</template>
        <template v-else-if="con.prop == 'unappliedAmount'">
          <span v-price-info="row.amount - row.totalWrittenOff"></span>
        </template>
        <template v-else-if="con.prop == 'amount'">
          <span v-price-info="row[con.prop]"></span>
        </template>
        <template v-else>{{ row[con.prop] }}</template>
      </template>
    </lc-table>
    <div class="amount-info">
      本次核销总金额：
      <span>{{countAmount}}</span>
      &nbsp;&nbsp; 付款凭证剩余未核销金额：{{countUnAmount}}
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import lcTable from "@/components/table/index";
import { matchArrItem, openNewWebWin, formatPrice } from "@/utils/";
import { voucherStatuses } from "@/pages/server/const/paymentVoucherConst.ts";
import API from "@/API";

export default {
  name: "payment-by-account",
  components: {
    lcCondition,
    lcTable
  },
  inject: [ "formatMyDate" ],
  props: {
    customerInfo: {
      type: Object
    },
    formInfo: {
      type: Object
    }
  },
  watch: {
    customerInfo: {
      handler( newName, oldName ) {
        this.initForm();
        this.loadData();
      },
      deep: true
    }
  },
  data() {
    return {
      orderType: 1,
      selectedLists: [],
      selectedSnLists: [],
      voucherStatus: 0,
      condition: [],
      config: [],
      page: { cur: 1, total: 0, num: 20 },
      lists: [],
      currentReceipt: null
    };
  },
  computed: {
    countAmount() {
      return formatPrice( this.selectedLists.reduce( ( total, item ) => {
        return total + parseFloat( item.bakRelatedAmount )
      }, 0 ) )
    },
    countUnAmount() {
      return formatPrice( +this.formInfo.amount - this.countAmount )
    },
    conditionByOrderType() {
      let arr = [];
      arr.push( {
        value: "",
        key: "accountCheckSn",
        label: "对账单号",
        type: "text"
      } );
      arr.push( {
        value: [],
        key: "checkingDate",
        label: "核对发起时间",
        type: "daterange"
      } );
      return arr;
    },
    configByOrderType() {
      let arr = [
        { prop: "amount", label: "对账单金额", width: "220px" },
        { prop: "unappliedAmount", label: "未核销金额", width: "220px" },
        { prop: "bakRelatedAmount", label: "本次核销金额", width: "220px" },
        { prop: "control", label: "操作", width: "160px", fixed: "right" }
      ];
      arr.unshift( { prop: "checkDate", label: "核对发起时间", width: "220px" } );
      arr.unshift( {
        prop: "accountCheckSn",
        label: "对账单号",
        width: "220px"
      } );
      return arr;
    }
  },
  methods: {
    maxAmount( item ) {
      // 如果账单金额小于0,最大值为0,最小是为订单金额
      if ( +item.amount < 0 ) {
        return item.amount
      } else {
        return +(
          item.amount -
          item.totalRelatedAmount -
          item.totalWrittenOff
        ).toFixed( 2 );
      }
    },
    openDialog( row ) {
      // 这里打开弹窗返回时无法保存当前tab以及搜索条件,所以使用打开新页面方式进行跳转
      openNewWebWin( `server/statementDetail/${row.accountCheckSn}`, "statementDetail" + row.accountCheckSn || "" )
    },
    selectionChange( items ) {
      this.selectedLists = items
      this.selectedSnLists = items.map( item => item.accountCheckSn )
    },
    disabledByChecked( row ) {
      return this.selectedSnLists.indexOf( row.accountCheckSn ) == -1
    },
    invoiceCtr( item ) {
      this.currentReceipt = item;
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    },
    curChange( cur ) {
      this.page.cur = cur;
      this.loadData();
    },
    dataAdapter() {
      let o = {};
      o.num = this.page.num;
      o.start = ( this.page.cur - 1 ) * o.num;
      this.conditionByOrderType.forEach( con => {
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
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    },
    formatSettlemenetCycle( item ) {
      let { monthly, settlementCycle } = item;
      return monthly
        ? settlementCycle
          ? `${settlementCycle}个月`
          : "固定期限"
        : "--";
    },
    initForm() {
      this.config = this.configByOrderType;
      this.condition = this.conditionByOrderType;
    },
    getSelectedLists() {
      // 查询选中的实时信息
      let ret = this.lists.filter( item => {
        return this.selectedSnLists.indexOf( item.accountCheckSn ) !== -1
      } )
      return ret
    },
    loadData() {
      // this.$permissionValidateWithNotifyEnv(1193,1189)
      if ( !this.customerInfo.customerId ) {
        return
      }
      let params = this.dataAdapter();
      params.customerId = this.customerInfo.customerId;
      params.customerName = this.customerInfo.customerName;

      this.$http( API[ "getPaymentVoucherStatements" ], {
        ...params,
        orderType: this.orderType
      } ).then( ( { data } ) => {
        this.lists = data.data.list;
        this.lists = this.lists.map( item => {
          return {
            ...item,
            bakRelatedAmount: this.maxAmount( item ),
            maxAmount: this.maxAmount( item )
          };
        } );
        this.page.total = data.data.total;
      } );
    },
    search() {
      this.page.cur = 1;
      this.loadData();
    }
  },
  created() {
    this.initForm();
    this.loadData();
  }
};
</script>
<style lang="stylus" scoped>
.scope-row
  min-height 30px
  line-height 30px
  margin-left -18px
  margin-right -18px
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
