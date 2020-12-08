<template>
  <el-dialog
    v-if="Object.keys(refundDetailsData).length"
    :title="titleName"
    size="large"
    :visible.sync="dialogTableVisible"
    @close="handleClose"
  >
    <!-- 表单内容 -->
    <el-form class="el-row" :model="refundForm" label-width="100px" ref="refund-appliaction-form">
      <el-row>
        <el-col v-for="item in itemList" :key="item.prop" :span="item.prop | cumpuGrid">
          <el-form-item :label="item.label">
            <el-input
              v-model="refundForm[item.prop]"
              :type="item.type"
              :disabled="item.disabled"
              :placeholder="item.placeholder"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 只有按对账单申请才有 -->
      <el-row :gutter="20" v-if="isShowAccount">
        <el-col :span="5" style="min-width:320px">
          <!-- 付款渠道 -->
          <el-form-item label="付款渠道：">
            <el-select
              v-model="refundForm.paymentType"
              placeholder="请选择"
              :disabled="refundAccountNoDisabled"
              @change="paymentChange(refundForm)"
            >
              <el-option
                v-for="item in paymentTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" style="min-width:360px">
          <!-- 付款账号 -->
          <el-form-item label="付款账号：">
            <el-select
              style="width: 240px"
              v-model="refundForm.lcBank"
              placeholder="请选择"
              :disabled="refundAccountNoDisabled"
            >
              <el-option
                v-for="item in getPaymentBanks(refundForm)"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" style="min-width:360px">
          <el-form-item label="退款流水号：">
            <el-input
              :disabled="refundAccountNoDisabled"
              style="width: 200px"
              v-model="refundDetailsData.refundNo"
              placeholder="请输入内容"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 明细表格 -->
    <div class="el-table el-table--fit el-table--striped el-table--border">
      <table cellpadding="0" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th v-for="(con, index) in thConfig" :key="index">
              <div class="cell">{{con.label}}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 服务单 -->
          <template v-if="isShowService">
            <template v-for="transaction in refundDetailsData.transactionFlowList">
              <tr :key="transaction.paymentNo">
                <td :colspan="thConfig.length">
                  <div class="flex tr-info">
                    <span>支付方式：{{transaction.paymentWay == 0 ? '线上支付': '线下支付'}}</span>
                    <span>
                      {{transaction.paymentWay == 0 ? '子支付单号：': '商家付款流水号：'}}
                      {{transaction.paymentNo}}
                    </span>
                    <span>合计退款金额：{{transaction.refundAmount | fixed2}}</span>
                    <span>原收款渠道：{{formatPaymentChannel(transaction)}}</span>
                  </div>
                  <div class="flex tr-info">
                    <span>
                      付款渠道：
                      <el-select
                        placeholder="请选择"
                        v-model="transaction.paymentType"
                        :disabled="refundAccountNoDisabled"
                        @change="paymentChange(transaction)"
                      >
                        <el-option
                          v-for="channel in paymentTypes"
                          :key="channel.name + channel.id"
                          :label="channel.name"
                          :value="channel.id"
                        ></el-option>
                      </el-select>
                    </span>
                    <span v-if="!is3rdParty">
                      付款账号：
                      <el-select
                        style="width: 180px"
                        v-model="transaction.lcBank"
                        :disabled="refundAccountNoDisabled"
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="channel in getPaymentBanks(transaction)"
                          :key="channel.name + channel.id"
                          :label="channel.name"
                          :value="channel.id"
                        ></el-option>
                      </el-select>
                    </span>
                    <span>
                      退款流水号：
                      <el-input
                        style="width: 200px"
                        v-model="transaction.refundNo"
                        placeholder="请输入内容"
                        :disabled="refundAccountNoDisabled"
                      ></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-for="flow in transaction.serviceFlowList" :key="flow.serviceSn">
                <td class="cell" v-for="(con, index) in thConfig" :key="index">
                  <template v-if="con['prop']==='control'">
                    <el-button type="text" @click="viewDetails(flow)">查看详情</el-button>
                  </template>
                  <template
                    v-else-if="con['prop']==='applyTime'"
                  >{{formatDate( !!flow[con['prop']] ? flow[con['prop']] : '', 'yyyy-MM-dd hh:mm' )}}</template>
                  <template v-else-if="con['prop']==='refundAmount'">{{flow[con['prop']] | fixed2}}</template>
                  <template v-else>{{flow[con['prop']]}}</template>
                </td>
              </tr>
            </template>
          </template>
          <!-- 对账单 -->
          <template v-if="isShowAccount">
            <tr
              v-for="(voucher, i) in refundDetailsData.voucherStatements"
              :key="voucher.accountCheckSn"
            >
              <td class="cell" v-for="(con, index) in thConfig" :key="index">
                <template v-if="con['prop']==='control'">
                  <el-button type="text" @click="viewDetails(voucher)">查看详情</el-button>
                </template>
                <template v-else-if="con['prop']==='no'">{{+i+1}}</template>
                <template
                  v-else-if="con['prop']==='initiateDate'"
                >{{formatDate( !!voucher[con['prop']] ? voucher[con['prop']] : '', 'yyyy-MM-dd hh:mm' ) }}</template>
                <template v-else-if="con['prop']==='amount'">{{voucher[con['prop']] | fixed2}}</template>
                <template
                  v-else-if="con['prop']==='refundAmount'"
                >{{(voucher.relatedAmount || 0 + voucher.writtenOffAmount || 0) | fixed2}}</template>
                <template v-else>{{voucher[con['prop']]}}</template>
              </td>
            </tr>
          </template>
          <!-- 付款凭证 -->
          <template v-if="isShowVoucher">
            <template v-for="(transaction, index) in refundDetailsData.transactionFlowList">
              <tr :key="transaction.paymentSn">
                <td :colspan="thConfig.length" class="clearfix">
                  <div class="flex tr-info">
                    <span>商家付款流水号：{{ transaction.paymentVoucher.lcTradeSn }}</span>
                    <span>原收款渠道：{{ formatPaymentChannel(transaction) }}</span>
                    <span>退款金额：{{ transaction.refundAmount | fixed2 }}</span>
                  </div>
                  <div class="flex tr-info">
                    <span>
                      付款渠道：
                      <el-select
                        placeholder="请选择"
                        v-model="transaction.paymentType"
                        :disabled="refundAccountNoDisabled"
                        @change="paymentChange(transaction)"
                      >
                        <el-option
                          v-for="channel in paymentTypes"
                          :key="channel.name + channel.id"
                          :label="channel.name"
                          :value="channel.id"
                        ></el-option>
                      </el-select>
                    </span>
                    <span v-if="!is3rdParty">
                      付款账号：
                      <el-select
                        style="width: 180px"
                        v-model="transaction.lcBank"
                        :disabled="refundAccountNoDisabled"
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="channel in getPaymentBanks(transaction)"
                          :key="channel.name + channel.id"
                          :label="channel.name"
                          :value="channel.id"
                        ></el-option>
                      </el-select>
                    </span>
                    <span>
                      退款流水号：
                      <el-input
                        style="width: 200px"
                        :disabled="refundAccountNoDisabled"
                        v-model="transaction.refundNo"
                        placeholder="请输入内容"
                      ></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr :key="transaction.paymentSn">
                <td class="cell" v-for="con in thConfig" :key="con['prop']">
                  <!-- 查看详情 -->
                  <template v-if="con['prop']==='control'">
                    <el-button type="text" @click="viewDetails(transaction)">查看详情</el-button>
                  </template>
                  <!-- 序号 -->
                  <template v-else-if="con['prop']==='no'">{{ index + 1 }}</template>
                  <!-- 付款凭证编号 -->
                  <template
                    v-else-if="con['prop']==='voucherSn'"
                  >{{ transaction.paymentVoucher.voucherSn }}</template>
                  <!-- 凭证金额 -->
                  <template
                    v-else-if="con['prop']==='amount'"
                  >{{ transaction.paymentVoucher.amount | fixed2 }}</template>
                  <!-- 未核销金额 -->
                  <template
                    v-else-if="con['prop']==='unWrittenOffAmount'"
                  >{{ transaction.paymentVoucher.unWrittenOffAmount | fixed2 }}</template>
                  <!-- 审核通过时间 -->
                  <template
                    v-else-if="con['prop']==='reviewDate'"
                  >{{ formatDate(transaction.paymentVoucher.reviewDate) }}</template>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    <div class="refund-amount">
      申请退款总金额：
      <span>{{Math.abs(refundDetailsData.amount) | fixed2}}</span>
    </div>
    <span slot="footer" class="dialog-footer">
      <template v-if="refundDetailsData.voucherStatus === 10">
        <el-button
          v-if="$permissionValidateWithEnv( 1246, 1242 )"
          type="primary"
          @click="refundProcess('reviewPaymentVoucher')"
        >进行退款</el-button>
        <el-button v-if="$permissionValidateWithEnv( 1247, 1243 )" @click="refundObsolete">作废</el-button>
      </template>
      <template v-if="refundDetailsData.voucherStatus === 11">
        <el-button
          v-if="$permissionValidateWithEnv( 1248, 1244 )"
          type="primary"
          @click="refundProcess('writeOffPaymentVoucher')"
        >退款完成</el-button>
      </template>
    </span>
  </el-dialog>
</template>

<script>
import API from "../../../API";
import { matchArrItem, openNewWebWin } from "@/utils/";
import {
  orderPaymentTypes,
  paymentTypes,
  lcBanks,
  lcAllipays,
  lcWechats,
  lcFinAdjust,
} from "@/pages/server/const/paymentVoucherConst.ts";

const itemList = [
  {
    prop: "officeName",
    label: "客户名称",
    type: "text",
    placeholder: "",
    disabled: true,
  },
  {
    prop: "saasCode",
    label: "SaaS代码",
    type: "text",
    placeholder: "",
    disabled: true,
  },
  {
    prop: "voucherSn",
    label: "退款凭证",
    type: "text",
    placeholder: "",
    disabled: true,
  },
  {
    prop: "remark",
    label: "退款原因",
    type: "textarea",
    placeholder: "",
    disabled: true,
  },
  {
    prop: "reviewRemark",
    label: "退款备注",
    type: "textarea",
    placeholder: "请输入备注信息",
    disabled: false,
  },
];
const serviceTh = [
  { prop: "no", label: "序号", width: "180" },
  { prop: "serviceSn", label: "服务单号", width: "200" },
  { prop: "applyTime", label: "服务单创建时间", width: "220" },
  { prop: "orderSn", label: "关联订单号", width: "200" },
  { prop: "refundAmount", label: "申请退款金额", width: "200" },
  { prop: "control", label: "操作", width: "180" },
];
const accountTh = [
  { prop: "no", label: "序号", width: "180" },
  { prop: "accountCheckSn", label: "对账单号", width: "200" },
  { prop: "initiateDate", label: "对账单创建时间", width: "220" },
  { prop: "amount", label: "对账单金额", width: "200" },
  // TODO 值为relatedAmount + writtenOffAmount
  { prop: "refundAmount", label: "本次核销金额", width: "200" },
  { prop: "control", label: "操作", width: "180" },
];
const voucherTh = [
  { prop: "no", label: "序号", width: "180" },
  { prop: "voucherSn", label: "付款凭证编号", width: "200" },
  { prop: "reviewDate", label: "审核通过时间", width: "220" },
  { prop: "amount", label: "凭证金额", width: "200" },
  { prop: "unWrittenOffAmount", label: "未核销金额", width: "200" },
  { prop: "control", label: "操作", width: "180" },
];

export default {
  name: "RefundApplycationDialog",
  inject: [ "formatMyDate" ],
  props: {
    isShowRefundApplicationDialog: {
      type: Boolean,
      default: false,
    },
    // 对象
    curListData: {
      type: Object,
      default: () => ( {} ),
    },
  },

  data() {
    return {
      dialogTableVisible: this.isShowRefundApplicationDialog,
      refundForm: {
        officeName: "",
        voucherSn: "",
        remark: "",
        reviewRemark: "",
        saasCode: "",
        paymentType: "", // 付款渠道
        lcBank: "", // 付款账号
      },
      input: "",
      refundDetailsData: {},
      paymentType: -1,
      paymentTypes,
      initItem: { id: -1, name: "未分配" }
    };
  },
  computed: {
    cascadePaymentTypes() {
      // const initItem = { ...this.initItem };
      // paymentType = paymentType || -1;
      const { paymentType } = this.refundForm;
      let arr;
      switch ( +paymentType ) {
        case 1:
          arr = lcBanks;
          break;
        case 2:
          arr = lcAllipays;
          break;
        case 3:
          arr = lcWechats;
          break;
        case 4:
          arr = lcFinAdjust;
          break;
        case -1:
          arr = [ this.initItem ];
          break;
        default:
      }

      this.refundForm.paymentType = paymentType;
      if ( paymentType > -1 ) {
        this.refundForm.lcBank = '';
      } else {
        this.refundForm.lcBank = -1;
      }
      return arr;
    },
    is3rdParty() {
      return this.$store.getters[ 'stores/is3rdParty' ]
    },
    // 弹出框标题
    titleName() {
      const { voucherStatus } = this.refundDetailsData;
      const hashMap = {
        10: "进行退款",
        11: "退款完成",
        12: "已退款",
        13: "已作废",
      };
      return hashMap[ voucherStatus ] || hashMap[ 10 ];
    },
    // 不同申请方式的表头
    thConfig() {
      if ( !this.refundDetailsData ) return [];
      const { dimension = 2 } = this.refundDetailsData;
      const hashMap = {
        2: accountTh,
        3: serviceTh,
        4: voucherTh,
      };
      return hashMap[ dimension ];
    },
    isShowService() {
      const { dimension, transactionFlowList } = this.refundDetailsData;
      return !!(
        dimension === 3 &&
        Array.isArray( transactionFlowList ) &&
        transactionFlowList.length
      );
    },
    isShowAccount() {
      const { dimension, voucherStatements } = this.refundDetailsData;
      return !!(
        dimension === 2 &&
        Array.isArray( voucherStatements ) &&
        voucherStatements.length
      );
    },
    isShowVoucher() {
      const { dimension, transactionFlowList } = this.refundDetailsData;
      return !!(
        dimension === 4 &&
        Array.isArray( transactionFlowList ) &&
        transactionFlowList.length
      );
    },
    // 返回表单内容定义，并判定退款备注是否可编辑(10 为可编辑)
    itemList() {
      const state = this.refundDetailsData.voucherStatus;
      if ( state === 10 ) return itemList;
      return itemList.map( item => {
        return { ...item, disabled: true };
      } );
    },
    refundAccountNoDisabled() {
      return [ 12, 13 ].includes( this.refundDetailsData.voucherStatus );
    },
  },
  filters: {
    cumpuGrid( prop ) {
      return prop === "voucherSn" ? 24 : 12;
    },
  },
  methods: {
    // 按付款凭证选择 paymentType lcBank
    getPaymentBanks( record ) {
      const { paymentType } = record
      switch ( paymentType ) {
        case 1:
          return lcBanks;
        case 2:
          return lcAllipays;
        case 3:
          return lcWechats;
        case 4:
          return lcFinAdjust;
        case -1:
          return [ this.initItem ];
        default:
          return '';
      }
    },
    // 修改付款渠道，初始化付款账号值
    paymentChange( transaction ) {
      const { paymentType } = transaction
      if ( paymentType === -1 ) {
        Object.assign( transaction, { lcBank: -1 } );
      } else {
        Object.assign( transaction, { lcBank: '' } );
      }
    },
    formatDate( date = {} ) {
      return date.time ? this.formatMyDate( date.time, "yyyy-MM-dd hh:mm" ) : "";
    },
    // 对话框显示查询数据
    getRefundDetailsData() {
      this.$http( API.paymentVoucherDetail, {
        voucherSn: this.curListData.voucherSn,
      } ).then( ( { data } ) => {
        // paymentType:  付款渠道 lcBank: 付款账号
        const {
          dimension,
          officeName,
          voucherSn,
          remark,
          reviewRemark,
          saasCode,
          paymentType,
          lcBank,
        } = data.data;

        if ( dimension === 3 ) {
          this.dealServiceNo( data.data );
        }
        this.refundDetailsData = data.data;
        this.refundForm = {
          ...this.refundForm,
          dimension,
          officeName,
          voucherSn,
          remark,
          reviewRemark,
          saasCode,
          paymentType,
          lcBank,
        };
      } );
    },
    // * 计算服务单序号逻辑
    dealServiceNo( data ) {
      if ( !data.transactionFlowList || !data.transactionFlowList.length ) return;
      let no = 0;
      data.transactionFlowList.forEach( ( transactionFlow ) => {
        // TODO 保留初始值作为切换付款渠道时付款账号的默认值使用
        Object.assign( transactionFlow, {
          initLcBank: transactionFlow.lcBank,
          initPaymentType: transactionFlow.paymentType,
        } );
        transactionFlow.serviceFlowList.forEach( ( serviceFlow ) => {
          no += 1;
          Object.assign( serviceFlow, { no } );
        } );
      } );
    },
    // 查看详情
    viewDetails( voucher ) {
      const dim = this.refundDetailsData.dimension;
      switch ( dim ) {
        case 2:
          openNewWebWin(
            `server/statementDetail/${voucher.accountCheckSn}`,
            `statementDetail${voucher.accountCheckSn || ""}`
          );
          break;
        case 3:
          openNewWebWin( `server/refunding?serviceSn=${voucher.serviceSn}`, "" );
          break;
        case 4:
          this.$emit( 'show-rv-detail', {
            voucherSn: voucher.paymentVoucher.voucherSn,
            isShowRefundVocherDialog: true
          } )
          break;
        default:
      }
    },
    /**
     * 付款渠道对应名称
     */
    formatPaymentChannel( transaction ) {
      const { paymentWay, paymentChannel } = transaction;
      // * type 0 线上  1 线下
      const curPaymentTypes = paymentWay ? paymentTypes : orderPaymentTypes;
      return matchArrItem( paymentChannel, curPaymentTypes, "id" ).name;
    },
    // 关闭对话框
    handleClose() {
      this.$emit( "update:isShowRefundApplicationDialog", false );
    },
    // 作废
    refundObsolete() {
      const { voucherSn } = this.refundDetailsData;
      this.$http( API.obsoletePaymentVoucher, { voucherSn } )
        .then( ( { data } ) => {
          this.$notify( {
            type: "success",
            message: data.msg || `作废成功`,
          } );
          this.handleClose();
          this.$emit( "update-list" );
        } )
        .catch( ( { data } ) => {
          this.$notify( {
            type: "error",
            message: data.msg || `作废失败`,
          } );
        } );
    },
    // 进行退款
    refundProcess( urlName ) {
      const {
        voucherSn,
        refundNo,
        transactionFlowList: transactionFlowLists,
        dimension,
      } = this.refundDetailsData;
      const { reviewRemark, paymentType, lcBank } = this.refundForm;
      const transactionFlowList = transactionFlowLists.map( ( item ) => {
        const {
          paymentSn,
          paymentWay,
          refundAmount,
          refundNo,
          lcBank,
          paymentType,
        } = item;
        return {
          paymentSn,
          paymentWay,
          refundAmount,
          refundNo,
          lcBank,
          paymentType,
        };
      } );
      const params = {
        voucherSn, // 退款凭证
        reviewRemark, // 退款备注
        paymentType,
        lcBank, // 付款渠道/付款账号
        [ dimension === 2 ? "refundNo" : "transactionFlowList" ]:
          dimension === 2 ? refundNo : transactionFlowList,
      };
      this.$http( API[ urlName ], params )
        .then( ( { data } ) => {
          this.$notify( {
            type: "success",
            message: data.msg || `操作成功`,
          } );
          this.handleClose();
          this.$emit( "update-list" );
        } )
        .catch( ( { data } ) => {
          this.$notify( {
            type: "error",
            message: data.msg || `操作失败`,
          } );
        } );
    },
  },
  created() {
    this.getRefundDetailsData();
  },
};
</script>

<style scoped>
.dialog-footer {
  display: block;
  margin: 0 auto;
}

.flex {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
}

.tr-info {
  padding: 8px 10px;
}

.refund-amount {
  height: 48px;
  line-height: 48px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.refund-amount span {
  color: #f00;
}
</style>
