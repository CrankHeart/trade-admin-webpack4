<template>
  <el-dialog title="查看付款凭证" size="large" :visible.sync="dialogTableVisible" @close="handleClose">
    <!-- 表单内容 -->
    <el-row>
      <el-col :span="3" class="label-item">客户名称</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.officeName" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">付款凭证</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.voucherSn" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">凭证金额</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.amount" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">付款人</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.payer" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">交易渠道</el-col>
      <el-col :span="9">
        <el-select class="form-item" v-model="voucherData.paymentType" :disabled="true">
          <el-option
            v-for="payment of paymentTypes"
            :key="payment.id"
            :label="payment.name"
            :value="payment.id"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="3" class="label-item">收款银行</el-col>
      <el-col :span="9">
        <el-select class="form-item" v-model="voucherData.lcBank" :disabled="true">
          <el-option v-for="bank of lcBanks" :key="bank.id" :label="bank.name" :value="bank.id"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3" class="label-item">销售负责人</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.payee" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">交易流水号</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.tradeSn" :disabled="true"></el-input>
      </el-col>
      <el-col :span="3" class="label-item">实际付款时间</el-col>
      <el-col :span="9">
        <el-date-picker
          :disabled="true"
          class="form-item"
          v-model="voucherData.actualPayDate.time"
          type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-col>
      <el-col :span="3" class="label-item">商家流水号</el-col>
      <el-col :span="9">
        <el-input class="form-item" v-model="voucherData.lcTradeSn" :disabled="true"></el-input>
      </el-col>

      <el-col :span="3" class="label-item">备注</el-col>
      <el-col :span="9">
        <el-input
          class="form-item"
          type="textarea"
          :rows="3"
          v-model="voucherData.remark"
          :disabled="true"
        ></el-input>
      </el-col>
      <el-col :span="3" class="label-item">审批备注</el-col>
      <el-col :span="9">
        <el-input
          class="form-item"
          type="textarea"
          :rows="3"
          v-model="voucherData.reviewRemark"
          :disabled="true"
        ></el-input>
      </el-col>
      <el-col :span="3" class="label-item">上传付款凭证</el-col>
      <el-col :span="9" class="img-list">
        <section v-for="img of voucherImages" :key="img.id" @click="imgsrc=img.absolutePath">
          <img :src="img.absolutePath" :alt="img.imgUrl" />
        </section>
      </el-col>
      <el-col :span="3" class="label-item">核销备注</el-col>
      <el-col :span="9">
        <el-input
          class="form-item"
          type="textarea"
          :rows="3"
          v-model="voucherData.writeOffRemark"
          :disabled="true"
        ></el-input>
      </el-col>
    </el-row>
    <!-- 表格内容 -->
    <el-table :data="voucherOrders" class="voucher-table" empty-text="暂无数据">
      <el-table-column type="index" label="序号" width="100"></el-table-column>
      <el-table-column prop="dimension" label="单据类型" width="100"></el-table-column>
      <el-table-column prop="voucherSn" label="单据编号" width="250"></el-table-column>
      <el-table-column prop="amount" label="金额">
        <template slot-scope="{row}">{{ row.amount | fixed2 }}</template>
      </el-table-column>
      <el-table-column prop="totalWrittenOff" label="未核销金额">
        <template slot-scope="{row}">{{ row.totalWrittenOff | fixed2 }}</template>
      </el-table-column>
      <el-table-column prop="currentRefundAmount" label="本次核销金额" width="230">
        <template slot-scope="{row}">
          <el-input-number
            v-model="row.currentRefundAmount"
            size="small"
            :disabled="true"
            :min="0"
            :max="row.amount"
          ></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="{row}">
          <el-button type="text" v-if="voucherData.dimension===2" @click="openDialog(row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <p class="sum-info">
      <span>
        本次核销总金额：
        <b>{{ countAmount | fixed2 }}</b>
      </span>
      <span>
        退款金额（申请中）：
        <b>{{ voucherData.refundingAmount | fixed2 }}</b>
      </span>
      <span>
        已退款金额：
        <b>{{ voucherData.refundedAmount | fixed2 }}</b>
      </span>
      <span>
        付款凭证剩余未核销金额：
        <b>{{ unWrittenOffAmount | fixed2 }}</b>
      </span>
    </p>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        @click="signReverse()"
        v-if="this.voucherData.dimension<3"
        :disabled="true"
      >重新核销</el-button>
    </div>
    <!-- 看大图 -->
    <div class="img-viewer" v-if="imgsrc" @click="imgsrc=''">
      <section class="img-container">
        <img :src="imgsrc" alt="大图" />
        <i class="el-icon-close" @click="imgsrc=''"></i>
      </section>
    </div>
  </el-dialog>
</template>
<script>
import API from "@/API";
import {
  paymentTypes,
  lcBanks,
  lcAllipays,
  lcWechats,
  lcFinAdjust
} from "@/pages/server/const/paymentVoucherConst.ts";

export default {
  name: "RefundVocherDialog",
  inject: [ "formatMyDate" ],
  props: {
    isShowRefundVocherDialog: {
      type: Boolean,
      default: false,
    },
    voucherSn: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 弹框 toogle
      dialogTableVisible: this.isShowRefundVocherDialog,
      // 单据类型
      dimension: {
        1: "订单",
        2: "对账单",
        3: "服务单",
        4: "付款凭证",
      },
      // 表单值配置
      voucherData: {
        officeName: "",
        saasCode: "",
        voucherSn: "",
        amount: 0,
        payer: "",
        lcBank: -1,
        paymentType: -1,
        payee: "",
        tradeSn: "",
        actualPayDate: {
          time: +new Date(),
        },
        remark: "",
        reviewRemark: "",
        writeOffRemark: "",
        lcTradeSn: "",
      },
      // 明细
      voucherOrders: [],
      voucherImages: [],
      // 付款类型
      paymentTypes,
      // 查看大图的地址
      imgsrc: "",
    };
  },
  computed: {
    // 收款银行列表，根据 paymentType 选择不同列表
    lcBanks() {
      const initItem = { id: -1, name: "未分配" };
      const list = {
        1: lcBanks,
        2: lcAllipays,
        3: lcWechats,
        4: lcFinAdjust,
      };
      const type = this.voucherData.paymentType;
      return list[ type ] || [ initItem ];
    },
    // 本次核销总金额
    countAmount() {
      return this.voucherOrders
        .map( item => item.currentRefundAmount )
        .reduce( ( acc, cur ) => cur + acc, 0 )
    },
    // 付款凭证剩余未核销金额
    unWrittenOffAmount() {
      const fee = [ this.voucherData.amount, this.countAmount, this.voucherData.refundingAmount, this.voucherData.refundedAmount ]
      return fee.reduce( ( acc, cur ) => acc - cur )
    }
  },
  methods: {
    // 关闭对话框
    handleClose() {
      this.$emit( "update:isShowRefundVocherDialog", false );
    },
    // 改变交易渠道时，初始化收款银行
    initLcBank() {
      const type = this.voucherData.paymentType;
      if ( type === -1 ) {
        this.voucherData.lcBank = -1
      } else {
        this.voucherData.lcBank = ''
      }
    },
    // 获取数据
    getData() {
      const param = { voucherSn: this.voucherSn };
      this.$http( API[ "paymentVoucherDetail" ], param )
        .then( ( { data } ) => data.data )
        .then( ( data ) => {
          this.voucherData = data;
          this.voucherImages = data.voucherImages || [];
          this.voucherOrders = ( data.voucherOrders || [] ).map( ( v ) => {
            const dimension = this.dimension[ this.voucherData.dimension ];
            // 本次核销金额计算
            const currentRefundAmount = v.relatedAmount + v.writtenOffAmount
            return Object.assign( {}, v, { dimension, currentRefundAmount } );
          } );
        } );
    },
    // 查看明细
    openDialog( row ) {
      let { href } = window.location;
      let webPrefix = href.substr( 0, href.lastIndexOf( "#" ) );
      let openUrl = `${webPrefix}#/server/statementDetail/${row.accountCheckSn}`;
      window.open( openUrl, `statementDetail${row.accountCheckSn || ""}` );
    },
    signReverse() {
      const voucherSn = this.voucherData.voucherSn;
      this.$http( API[ "signReverse" ], { voucherSn } ).then( ( res ) => {
        this.$notify( {
          type: "success",
          message: "操作成功！",
        } );
        this.handleClose();
      } );
    },
  },
  created() {
    this.getData();
  },
};
</script>
<style lang="stylus" scoped>
.label-item
  text-align right
  padding-right 0.5em
  line-height 36px
.form-item
  width 80%
.el-col:nth-child(n + 5)
  margin-top 1em
.img-list
  display flex
  & > section
    cursor pointer
    position relative
    & + section
      margin-left 1em
    &::before
      content ''
      transition background-color 0.3s
    &:hover::before
      content '查看'
      display flex
      align-items center
      justify-content center
      color #fff
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      background-color rgba(0, 0, 0, 0.3)
  img
    height 75px
.img-viewer
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  z-index 99
  display flex
  align-items center
  justify-content center
  background-color rgba(0, 0, 0, 0.3)
  > section
    position absolute
    min-width 200px
    min-height 200px
    max-width 400px
    max-height 400px
    i
      width 25px
      height 25px
      text-align center
      line-height 25px
      top -9px
      right -9px
      position absolute
      display block
      background-color rgba(32, 160, 255, 0.5)
      color #fff
      border-radius 50%
      cursor pointer
      &:hover
        background-color rgb(32, 160, 255)
  img
    width 100%
    height 100%
    box-shadow 0 0 20px rgba(0, 0, 0, 0.8)
.voucher-table
  width 90%
  margin 2em auto
.sum-info
  width 90%
  margin auto
  text-align right
  b
    color red
  span + span
    padding-left 1em
.dialog-footer
  text-align center
</style>