<template>
  <div class="invoice-manage">
    <lc-table :config="config" :data="lists" :hasPage="false">
      <template slot-scope="{row,con}">
        <template v-if="con.prop == 'sn'">
          <!-- {{row.voucherSn?row.voucherSn:row.paymentNo}} -->
          {{row.billNo}}
        </template>
        <template v-else-if="con.prop == 'billType'">{{ formatApplyTypes(row[con.prop]) }}</template>
        <template
          v-else-if="con.prop == 'writtenOffDate'"
        >{{ formatMyDate(row[con.prop] && row[con.prop].time) }}</template>
        <!-- <template v-else-if="con.prop == 'unappliedAmount'">
          {{ Number(row.amount - row.totalWrittenOff).toFixed(2) }}
        </template>-->
        <template v-else>{{ row[con.prop] }}</template>
      </template>
    </lc-table>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import lcTable from "@/components/table/index";
import { matchArrItem } from "@/utils/";
import { applyTypes } from '@/pages/server/const/serverConstant.ts'
import { voucherStatuses } from "@/pages/server/const/paymentVoucherConst.ts";
import API from "@/API";

export default {
  name: "transaction-flow-item",
  components: {
    lcCondition,
    lcTable
  },
  inject: [ "formatMyDate" ],
  props: {
    item: {
      type: Object
    }
  },
  watch: {
    item: {
      handler( val ) {
        this.loadData()
      },
      deep: true
    }
  },
  data() {
    return {
      orderType: 0, // 订单维度
      selectedLists: [],
      voucherStatus: 0,
      condition: [],
      page: { cur: 1, total: 0, num: 20 },
      lists: [],
      currentReceipt: null
    };
  },
  computed: {
    config() {
      return [
        { prop: "writtenOffDate", label: "核销时间", width: "180px" },
        { prop: "billType", label: "被核销单据类型", width: "150px" },
        { prop: "sn", label: "被核销单据编号", width: "220px" },
        { prop: "totalAmount", label: "总金额", width: "100px" },
        { prop: "writtenOffAmount", label: "核销金额", width: "100px" }
      ];
    }
  },
  methods: {
    loadData() {
      let params = {}
      // if( this.item.paymentMethod == 0 ){
      //    params.paymentNo = this.item.paymentNo
      // }else{
      //    params.voucherSn = this.item.voucherSn
      // }
      params.id = this.item.id
      this.$http( API.getWrittenOffList, params ).then( ( { data } ) => {
        this.lists = data.data
      }, rej => {
        this.$message( {
          message: rej.msg,
          type: 'warning'
        } )
      } )
    },
    formatApplyTypes( id ) {
      return matchArrItem( id, applyTypes, "id" ).name;
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    }
  },
  created() {
    this.loadData()
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
</style>
