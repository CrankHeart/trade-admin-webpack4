<template>
  <table class="item-table" cellpadding="0" border="1" cellspacing="0" :width="tableWidth + 'px'">
    <template v-if="isAccountCheck = item.relatedFinancialReceivables.length > 0">
      <tr>
        <td :colspan="config.length">
          <div>
            <el-checkbox :value="isCheckedAll" @change="isCheckedAllChanged(isCheckedAll)">订单号：</el-checkbox>
            {{ item.orderSn }}
            下单时间：
            {{ formatDate(item.orderDate) }}
          </div>
        </td>
      </tr>
    </template>
    <tr
      v-for="(goods, index) in list=(isAccountCheck?item.relatedFinancialReceivables:[item])"
      :key="'inner' + goods.id"
      class="center"
    >
      <template v-for="con in config">
        <td v-if="con.prop == 'receiptNo'" :style="{ width: con.width }" :key="con.prop">
          <div style="text-align:left">
            <el-checkbox v-model="selectedArr[index].value" v-if="selectedArr[index]"></el-checkbox>
            {{ isAccountCheck ? goods[con.prop] : goods.orderSn }}
          </div>
        </td>
        <td
          v-else-if="con.prop == 'deliveryDate'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ formatDate(isAccountCheck?goods.deliveryDate:goods.createTime) }}</td>
        <td
          v-else-if="con.prop == 'checkStatus'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ formatCheckStatus(goods[con.prop],goods.orderType) }}</td>
        <td
          v-else-if="con.prop == 'settlementStatus'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ formatStatementStatus(goods[con.prop]) }}</td>
        <td
          v-else-if="con.prop == 'receiptType'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ formatReceiptTypes(goods[con.prop],isAccountCheck) }}</td>
        <td
          v-else-if="con.prop == 'invoiceStatus'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ formatInvoiceStatus(goods[con.prop]) }}</td>
        <td
          v-else-if="con.prop != 'control'"
          :key="con.prop"
          :style="{ width: con.width }"
        >{{ goods[con.prop] }}</td>
        <td
          v-else-if="con.prop == 'control' && index == 0"
          :rowspan="list.length"
          :key="con.prop"
          :style="{ width: con.width }"
        >
          <el-button type="primary" size="mini" @click="toOrderDetails(item.orderSn)">订单详情</el-button>
        </td>
      </template>
    </tr>
  </table>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import lcTable from "@/components/table/index";
import API from "@/API";
import {
  invoiceKind,
  invoiceType,
  khInvoiceStatus,
  receivableTypes
} from "@/pages/order/const/invoiceConst.ts";
import {
  statementStatus,
  checkStatus,
  receiptTypes
} from "@/pages/server/const/serverConstant.ts";
import { deliverySettlementStatus } from "@/pages/order/const/orderSearchCondition";
import receivableList from "@/pages/receivable/components/receivableList.vue";
import { matchArrItem } from "@/utils";
export default {
  name: "account-items",
  components: {
    lcCondition,
    lcTable,
    receivableList
  },
  inject: [ "formatMyDate" ],
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isAllSelected: {
      type: Boolean,
      default: false
    },
    tableWidth: Number,
    selectedIds: {
      type: Array,
      default: () => {
        return [];
      }
    },
    config: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  watch: {
    isAllSelected( data ) {
      this.isCheckedAll = data;
      this.isCheckedAllChanged( !data )
    },
    selectedIds: {
      handler( lists ) {
        this.initData();
      },
      deep: true
    },
    selectedArr: {
      handler( lists ) {
        // 如果全部为选择,需要设置isCheckedAll=true
        let falseLists = lists.filter( item => item.value == false );
        if ( falseLists.length == 0 ) {
          this.isCheckedAll = true;
        } else {
          this.isCheckedAll = false;
        }
        this.$emit( "selectedChanged", { lists: lists, isCheckedAll: this.isCheckedAll } );
      },
      deep: true
    }
  },
  data() {
    return {
      isCheckedAll: false,
      selectedArr: []
    };
  },
  methods: {
    isCheckedAllChanged( data ) {
      this.isCheckedAll = !data;
      this.selectedArr = this.item.relatedFinancialReceivables.map( info => {
        return {
          type: "account",
          orderSn: info.orderSn,
          receivableSn: info.receivableSn,
          invoiceBlueNum: info.invoiceBlueNum,
          key: info.receiptNo,
          value: this.isCheckedAll
        };
      } );
    },
    formatReceiptTypes( id, isAccountCheck ) {
      return isAccountCheck ? matchArrItem( id, receiptTypes, "id" ).name : ( id == 2 || id == 3 ? '服务单' : '订单' );
    },
    formatInvoiceStatus( id ) {
      return matchArrItem( id, khInvoiceStatus, "id" ).name;
    },
    formatCheckStatus( id, isMonthly ) {
      return !isMonthly ? '无需核对' : matchArrItem( id, checkStatus, "id" ).name;
    },
    formatStatementStatus( id ) {
      return matchArrItem( id, deliverySettlementStatus, "id" ).name;
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    },
    toOrderDetails( sn ) {
      this.$router.push( `/order/detail/${sn}` );
    },
    initData() {
      this.selectedArr = [];
      // 组装数组,供购物栏塞到store.selectList里面
      if ( this.item.relatedFinancialReceivables.length > 0 ) {
        this.item.relatedFinancialReceivables.forEach( info => {
          this.selectedArr.push( {
            key: info.receiptNo,
            type: "account",
            orderSn: info.orderSn,
            receivableSn: info.receivableSn,
            invoiceBlueNum: info.invoiceBlueNum,
            value: false
          } );
        } );
      } else {
        this.selectedArr.push( {
          // key: this.item.orderSn,
          key: this.item.id,
          orderSn: this.item.orderSn,
          receivableSn: this.item.receivableSn,
          type: "order",
          value: false
        } );
      }
      this.selectedArr = this.selectedArr.map( info => {
        let value = this.selectedIds.findIndex( selectInfo => {
          return selectInfo.key == info.key;
        } );
        return Object.assign( {}, info, { value: value == -1 ? false : true } );
      } );
    }
  },
  created() {
    this.initData();
  }
};
</script>
<style scoped>
.item-table {
  border: 1px solid #e3e3e3;
  margin-bottom: 15px;
  border-collapse: collapse;
}
.item-table tr td {
  padding: 8px;
  box-sizing: border-box;
  font-size: 14px;
}
</style>
