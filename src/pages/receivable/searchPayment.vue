<template>
  <div class="search-payment">
    <el-form label-width="120px" class="el-row flex-wrap">
      <el-col :sm="12">
        <el-form-item label="请选择客户">
          <lc-customer-search @broadcast="broadcastItem($event, 'customerSearch')"></lc-customer-search>
        </el-form-item>
      </el-col>
      <el-col :sm="12">
        &nbsp;&nbsp;
        <el-button type="primary" @click="searchOper">搜索</el-button>
      </el-col>
    </el-form>
    <el-form label-width="120px" class="el-row flex-wrap" v-if="customerInfo.customerName">
      <el-col :sm="12">
        <el-form-item label="当前客户">{{ customerInfo.customerName }}</el-form-item>
      </el-col>
      <el-col :sm="12">
        <el-form-item label="SaaSCode">{{ customerInfo.saasCode }}</el-form-item>
      </el-col>
    </el-form>
    <div class="search-body" v-if="customerInfo.customerName">
      <!-- 表单区域 -->
      <el-card class="box-card">
        <paymentForm :voucherStatus="0" ref="paymentForm" @formchange="formchange" :isCheck="false"></paymentForm>
      </el-card>
      <!-- 对账单、订单 tab -->
      <div style="margin-top:15px">
        <el-tabs v-model="tab">
          <el-tab-pane v-for="tab in tabs" :key="tab.prop" :label="tab.label" :name="tab.prop">
            <component
              :is="tab.prop"
              :formInfo="formInline"
              :customerInfo="customerInfo"
              :ref="tab.prop"
            ></component>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div style="text-align:center;margin-top:15px">
        <el-button type="primary" @click="saveOper">保存</el-button>
        <el-button type="primary" @click="submitOper">提交审批</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import lcCondition from "@/components/condition.vue";
import lcTable from "@/components/table/index";
import { matchArrItem } from "@/utils/";
import { voucherStatuses } from "@/pages/server/const/paymentVoucherConst.ts";
import lcCustomerSearch from "@/components/customerSearch.vue";
import paymentForm from "@/pages/server/components/paymentForm.vue";
import paymentByAccount from "@/pages/receivable/components/paymentByAccount.vue";
import paymentByOrder from "@/pages/receivable/components/paymentByOrder.vue";
import API from "@/API";

export default {
  name: "search-payment",
  components: {
    lcCondition,
    lcTable,
    lcCustomerSearch,
    paymentForm,
    paymentByOrder,
    paymentByAccount
  },
  inject: [ "formatMyDate" ],
  data() {
    return {
      tabs: [
        { prop: "paymentByAccount", label: "选择对账单" },
        { prop: "paymentByOrder", label: "选择订单" }
      ],
      tab: "paymentByAccount",
      officeName: "",
      selectedData: [], // 选中的数据
      customerInfoSearch: {},
      customerInfo: {
        customerId: "",
        customerName: "",
        // customerId: "08d73115-e35e-ff97-dac8-818000118d52",
        // customerName: "上海碧波路诊所",
        name: "上海碧波路诊所"
      },
      formInline: {},
      condition: [
        { value: "", key: "acsn", label: "对账单号", type: "text" },
        {
          value: [],
          key: "createTime",
          label: "核对发起日期",
          type: "daterange"
        }
      ],
      page: { cur: 1, total: 0, num: 10 },
      lists: [],
      currentReceipt: null
    };
  },
  computed: {
    orderType() {
      // orderType 0:'普通订单' 1:'月结订单'
      return this.tab == "paymentByAccount" ? 1 : 0;
    }
  },
  methods: {
    broadcastItem( item, type ) {
      this.customerInfoSearch = item;
    },
    // dataAdapter() {
    //   let o = {
    //     customerId: this.customerInfo.customerId,
    //     customerName: this.customerInfo.customerName
    //   };
    //   o.num = this.page.num;
    //   o.start = ( this.page.cur - 1 ) * o.num;
    //   this.condition.forEach( con => {
    //     let { key, value, type } = con;
    //     if ( type === "customerSearch" ) {
    //       o.customerId = value.id;
    //       o.customerName = value.name;
    //     } else if ( type == "daterange" ) {
    //       if ( value && value[ 0 ] ) {
    //         o[ `${key}Start` ] = this.formatMyDate( value[ 0 ] );
    //         o[ `${key}End` ] = this.formatMyDate(
    //           value[ 1 ],
    //           "yyyy-MM-dd hh:mm:ss",
    //           true
    //         );
    //       }
    //     } else {
    //       if ( value !== "" ) {
    //         o[ key ] = value;
    //       }
    //     }
    //   } );
    //   return o;
    // },
    formchange( formInfo ) {
      this.formInline = Object.assign( {}, this.formInline, formInfo )
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time );
      }
      return "";
    },
    params() {
      // this.customerInfo.customerId
      // let officeOrderItem = ( this.selectedData && this.selectedData[ 0 ] ) || {};
      this.formInline.dimension = this.orderType === 1 ? 2 : 1;
      // this.formInline.tenantId = officeOrderItem.tenantId || "";
      // this.formInline.officeId = officeOrderItem.officeId || "";
      return {
        ...this.formInline,
        financialType: 1,
        customerId: this.customerInfo.customerId,
        actualPayDate: this.formInline.actualPayDate
          ? this.formatMyDate( this.formInline.actualPayDate )
          : "",
        relatedAmount: 0,
        writtenOffAmount: this.selectedData
          .filter( v => v[ "orderSn" ] )
          .reduce( ( total, next ) => {
            total += next[ "writtenOffAmount" ];
            return total;
          }, 0 ),
        voucherOrders: this.selectedData
          .filter( v => v[ "orderSn" ] )
          .map( v => ( {
            orderSn: v[ "orderSn" ],
            relatedAmount: v[ "bakRelatedAmount" ]
          } ) ),
        voucherStatements: this.selectedData
          .filter( v => v[ "orderList" ] )
          .map( v => ( {
            accountCheckSn: v[ "accountCheckSn" ],
            relatedAmount: v[ "bakRelatedAmount" ]
          } ) ),
        voucherImages: this.formInline.uploadImgList.map( ( v, i ) => ( {
          sort: i,
          imgUrl: v.relativePath
        } ) )
      };
    },
    searchCustomer() { },
    // 审批提交校验
    validateTip() {
      if ( this.selectedData.length <= 0 ) {
        return "请先选择数据";
      }
      // 是否第三方
      const is3rdParty = this.$store.getters[ 'stores/is3rdParty' ]
      let countAmount = this.$refs[ this.tab ][ 0 ].countAmount || 0
      if ( parseFloat( countAmount ) < 0 ) {
        return "本次核销总金额不能小于0";
      }
      let {
        amount,
        tradeSn,
        actualPayDate,
        payer,
        payee,
        lcBank,
        paymentType,
        uploadImgList
      } = this.formInline;
      if ( !amount || amount < 0 ) {
        return "请输入凭证金额";
      }
      if ( !payer ) {
        return "请输入付款人";
      }
      if ( !paymentType ) {
        return "请选择交易渠道";
      }
      // 第三方无此校验
      if ( !lcBank && !is3rdParty ) {
        return "如果支付渠道为银行的话,请输入对应的领健对公银行";
      }
      if ( !tradeSn ) {
        return "请输入交易流水号";
      }
      // 第三方无此校验
      if ( !payee && !is3rdParty ) {
        return "请选择销售负责人";
      }

      if ( amount - this.relatedAmount < 0 ) {
        return "剩余关联金额不能小于0";
      }
      if ( !( uploadImgList && uploadImgList.length ) ) {
        return "请至少上传一张付款凭证";
      }
      if ( !actualPayDate ) {
        return "请选择实际付款时间";
      }
      if (
        actualPayDate &&
        new Date( actualPayDate ).getTime() > new Date().getTime()
      ) {
        return "实际付款时间必须小于现在的时间";
      }
    },
    searchOper() {
      if ( !this.customerInfoSearch.customerId ) {
        this.$notify( {
          type: "warning",
          message: "请先选择客户"
        } );
        return;
      }
      this.customerInfo = this.customerInfoSearch;
    },
    saveOper() {
      this.savePaymentVoucher( "savePaymentVoucher" );
    },
    submitOper() {
      this.savePaymentVoucher( "submitReviewPaymentVoucher" );
    },
    async savePaymentVoucher( api ) {
      this.selectedData = this.$refs[ this.tab ][ 0 ].getSelectedLists();
      this.formInline =
        ( this.$refs.paymentForm && this.$refs.paymentForm.getFormInfo() ) || {};
      let tips = this.validateTip();
      if ( tips ) {
        this.$notify( {
          type: "warning",
          message: tips
        } );
        return;
      }
      // let data = await this.$http(API.getPaymentVoucherSn);
      // let voucherSn = data.data.data
      // this.formInline.voucherSn = voucherSn;
      let params = this.params();
      this.$http( API[ api ], params ).then(
        res => {
          this.$notify( {
            type: "success",
            message: "操作成功！"
          } );
          this.$router.push( "/receivable/customerSettlement" );
        },
        ( { data } ) => {
          this.$notify( {
            type: "error",
            message: data.msg
          } );
        }
      );
    }
  },
  created() { },
  activated() { },
  deactivated() {
    this.$destroy();
  }
};
</script>
