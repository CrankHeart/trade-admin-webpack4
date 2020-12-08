<template>
  <!-- 发货情况一览  refundApplication   RefundAllApplication 全部申请退款 对话框   -->
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    :before-close="handleCloseDialog"
    class="refund-dialog"
    custom-class="dialogWidth"
  >
    <!-- formData- {{formData}}
    <hr />
    params- {{params}}-->
    <!-- tableData- {{tableData}} -->
    <!-- <hr /> -->
    <el-table
      ref="table"
      v-loading.body="tableLoading"
      tooltip-effect="dark"
      highlight-current-row
      :data="tableData"
      max-height="500"
      @current-change="handleSelectionChange"
    >
      <!--  商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  未发货数量 availableNum  退款数量 applyNum -->
      <el-table-column prop="goodsName" label="商品名称"></el-table-column>
      <el-table-column prop="goodsSpecification" label="规格" width="180" show-overflow-tooltip></el-table-column>
      <el-table-column prop="goodsLcCode" label="LC编码" width="180"></el-table-column>
      <el-table-column prop="totalNum" label="数量" width="80"></el-table-column>
      <el-table-column prop="toDistributeNum" label="未发货数量" width="140">
        <template slot-scope="scope">
          <div class="toDistributeNum">
            {{scope.row.toDistributeNum}}
            <div
              v-if="scope.row.applyRefundNum"
              class="applyRefundNum"
            >{{scope.row.applyRefundNum}}件退款流程中</div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="goodsNum" label="退款数量" width="120"></el-table-column> -->
    </el-table>
    <br />

    <el-form ref="oForm" :model="formData" :rules="rules" label-width="100px">
      <!-- 请输入退款数量 -->
      <!-- <el-form-item label="退款数量" prop="goodsNum">
        <el-input-number
          @change="handleChangeGoodsNum"
          v-model="formData.goodsNum"
          :min="1"
          :max="formData.availableNum"
          :disabled="disabledGoodsNum"
        ></el-input-number>
        <span style="color:red;">{{disabledGoodsNumTips}}</span>
      </el-form-item>-->

      <!-- 退款金额 -->
      <!-- //最小最大可退金额 -->
      <!-- <div style="color:red;">测试专用：上线删除 最小最大可退金额 {{minRefundAmount}} --- {{maxRefundAmount}}</div> -->
      <el-form-item
        label="退款金额"
        prop="refundAmount"
        :rules=" {required: true, validator: this.validateRefundAmount, trigger: 'blur,change' }"
      >
        <el-input v-model="formData.refundAmount" placeholder="请输入退款金额"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model.trim="formData.contact" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model.trim="formData.mobile" placeholder="请填写联系人电话"></el-input>
      </el-form-item>

      <el-form-item label="退款原因" required>
        <el-row style="margin-bottom:20px;" v-if="dictionaryApplyReason.length">
          <el-form-item
            label
            prop="dictionaryApplyReason"
            :rules="{required: true, message: '请输入退款理由', trigger: 'blur'}"
          >
            <el-select v-model="formData.dictionaryApplyReason" placeholder="请输入退款理由">
              <el-option
                v-for="(item,index) in dictionaryApplyReason"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label prop="applyReason">
            <el-input v-model="formData.applyReason" placeholder="选填"></el-input>
          </el-form-item>
        </el-row>
      </el-form-item>
      <!-- {{formData}} -->
      <!-- <el-form-item>
        <el-button @click="handleCloseDialog" size="large">取 消</el-button>
        <el-button
          type="primary"
          :disabled="disabledGoodsNum"
          size="large"
          @click="submitForm('oForm')"
        >确 定</el-button>
      </el-form-item>-->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCloseDialog" size="large">取 消</el-button>
      <!-- :disabled="buttonDisabled" -->
      <el-button
        type="primary"
        :disabled="disabledGoodsNum"
        size="large"
        :loading="submitFormLoading"
        @click="submitForm('oForm')"
      >确 定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue"
import { State, Action } from "vuex-class";
import { Component, Inject, Prop, Watch } from "vue-property-decorator"
import API from "../../../../API"
import { Form } from "element-ui";
import createFormData from "./createFormData.ts";
import { validateMoney } from "./validate.ts";

@Component
export default class RefundAllApplication extends Vue {
  // 对话框
  @Prop( { type: Boolean, default: false } ) dialogVisible: boolean;

  // 表单提交额外参数
  @Prop( { default: () => ( {} ) } )
  params: any

  // disabledGoodsNum: boolean = false;
  get disabledGoodsNum () {
    const { applyNum, availableNum } = this.formData
    return applyNum >= availableNum
  }
  get disabledGoodsNumTips () {
    const name = '退款'

    return this.disabledGoodsNum ? `${name}数小于可${name}数，不允许修改提交!` : ""
  }


  submitFormLoading: boolean = false;


  dialogTitle: string = "全部退款申请";
  buttonDisabled: boolean = false;
  // 最小最大可退金额 默认展示最大金额
  minRefundAmount: number = 0
  maxRefundAmount: number = 0  // 退款金额  --->refundAmount

  // 退款申请  商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  未发货数量 availableNum  退款数量 applyNum

  // availableAmount 最大可退金额 <=
  // 售后类型serviceType/退款金额 refundAmount /退款数量 applyNum/退款金额  /联系人/联系电话/退货原因 dictionaryApplyReason 下拉 2个  联系地址:/详细地址

  // dictionaryApplyReason 为null 选填变成必填     skuNum <=可退数量availableNum

  dictionaryApplyReason: Array<string> = [];
  // 创建表单数据
  formData = createFormData();
  tableLoading: boolean = false;
  tableData: any = [];

  checked: any = null; // 如果使用单选框,定义一个model值
  currentSelectItem: any = {}; // 当前选中的值

  created () {
    this.getRefundAllServiceApplyInfo();
  }


  handleChangeGoodsNum ( goodsNum ) {
    // console.log( "handleChangeGoodsNum", goodsNum, this.formData.availableNum );
    this.getRefundAmount( goodsNum )
  }

  validateMoney = validateMoney
  // 需要传 区别全部和非全部的 参数,  在数量中直接被刨除
  validateGoodsNum ( rule, value, callback ): void {
    callback();
  }
  validateRefundAmount ( rule, value, callback ): void {
    value += '';
    value = value.trim();

    if ( value == "" ) {
      return callback( new Error( '请输入退款金额' ) );
    }

    if ( value < 0 ) {
      return callback( new Error( '退款金额不能小于0' ) );
    }

    // 最小最大可退金额 minRefundAmount/maxRefundAmount  refundAmount 退款金额
    if ( !( value >= this.minRefundAmount ) ) {
      return callback( new Error( '当前金额小于最小可退金额' ) );
    }
    if ( !( value <= this.maxRefundAmount ) ) {
      return callback( new Error( '当前金额大于最大可退金额' ) );
    }
    callback();
  }


  rules = {
    goodsNum: [
      { required: true, trigger: 'blur', type: 'number' },
      { validator: this.validateGoodsNum, trigger: 'blur,change' }
    ],
    contact: [
      { required: true, message: '请输入联系人', trigger: 'blur' }
    ],
    mobile: [
      { required: true, message: '请输入联系人联系方式', trigger: 'blur' }
    ],
    // applyReason: [
    //   { required: true, message: '请输入退货理由', trigger: 'blur' }
    // ]
  }

  // 退货金额计算
  async getRefundAmount ( goodsNum ) {
    const url = "/serviceOrderController/getRefundAmount";
    // API.xxxxxx
    let arr = [ "lcCode", "memberId", "orderSn", "skuId", "skuType" ]
    let reqParams = { number: goodsNum };
    arr.forEach( name => {
      reqParams[ name ] = this.params[ name ]
    } );

    const {
      status,
      data: { code, msg, refundAmount }
    } = await this.$http( url, reqParams );

    if ( status == 200 && code !== "A0000" ) {
      return this.$notify( {
        type: "error",
        message: msg || "数据获失败"
      } );
    }

    this.formData.refundAmount = refundAmount;
  }

  handleSelectionChange ( row ) {
    // el-radio单选框,不需要这一步
    this.tableData.forEach( item => {
      // 排他,每次选择时把其他选项都清除
      if ( item.id !== row.id ) {
        item.checked = false
      }
    } )
    console.log( row )
    // 如果使用单选框,这里可以把当前选中的这一项先保存起来
    this.currentSelectItem = row
  }

  refresh () {
    this.$emit( "refresh" );
  }
  submitForm ( formName ) {
    console.log( "submitForm", formName );


    ( this.$refs[ formName ] as Form ).validate( async ( valid ) => {
      console.log( "submitForm valid", valid );
      if ( valid ) {
        // alert( 'submit!' );

        this.submitFormLoading = true;

        let formData = JSON.parse(
          JSON.stringify( this.formData )
        );

        console.log( "formData:", formData );

        // return;

        const url = "/business/order/applyRefund";
        // API.xxxxx

        try {
          let {
            status,
            data: { msg, code }
          } = await this.$http( url, formData );
          if ( status == 200 && code == "A0000" ) {
            this.handleCloseDialog();
            this.refresh();
            this.$notify( {
              type: "success",
              message: msg || "申请成功"
            } );
          }
        } catch ( error ) {
          this.$notify( {
            type: "error",
            message: error.data.msg || "申请失败" //
          } );
        }
        this.submitFormLoading = false;
      } else {
        console.log( 'error submit!!' );
        // return false;
      }
    } );
  }
  handleCloseDialog (): void {
    this.$emit( "update:dialogVisible", false );
  }

  // 全部申请退款 
  async getRefundAllServiceApplyInfo () {

    this.tableLoading = true;

    const url = "/serviceOrderController/getRefundAllServiceApplyInfo";
    // API.updateDeliveryTime
    // let { orderSn, skuId, skuType, lcSkuCode, skuNum } = this.params;
    // let reqParams = { orderSn, skuId, skuType, lcSkuCode, skuNum }

    let arr = [ "orderSn", "memberId" ]
    let reqParams = {};
    arr.forEach( name => {
      reqParams[ name ] = this.params[ name ]
    } );
    const {
      status,
      data: { code, msg, data }
    } = await this.$http( url, reqParams );

    this.tableLoading = false;

    // 退款申请  商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 totalNum  未发货数量 toDistributeNum  退款数量 refundNum-->goodsNum
    // applyRefundNum 退款流程中  

    /*
    "dictionaryApplyReason":"["不想要/买多了/买错了","缺货","未按时间发货"]",
    最小最大金额 默认展示最大金额
    maxRefundAmount:1263,  // 退款金额  --->refundAmount
    minRefundAmount 最小金额 
    goodsInfoList:[
      {
                  
                  
                  "skuName":"测试数据-007",  商品名称   ---> goodsName
                  "specification":"test-001",  规格    ---> goodsSpecification 
                  "lcSkuCode":"2200007187001",  LC编码 ---> goodsLcCode    
                  "totalNum":10,   数量
                  "toDistributeNum":6,  未发货数量 toDistributeNum
                  "refundNum":6,  退款数量     --->  goodsNum
                  "applyRefundNum":0,  退款流程中  applyRefundNum
                  "availableNum":6,   refundableNum
                  "skuType":0,     --->  skuType
                  "unit":"颗",
                  "availableAmount":336,
                  "skuId":29797,      --->  goodsSkuId
                  "refundAmount":336
              },
    ]
    
    */


    /*
      "data":{
          "dictionaryApplyReason":"["不想要/买多了/买错了","缺货","未按时间发货"]",  退款原因
          "skuInfo":{
              "skuName":"测试数据-007", 商品名称
              "specification":"test-002",  规格
              "lcSkuCode":"2200007187002", LC编码
              "totalNum":24, 数量
              "refundNum":5,
              "applyRefundNum":null,
              "skuType":0,
              "skuId":29800,
              "toDistributeNum":9,
              "refundAmount":301,   退款金额
              "unit":"颗"，
              "maxAvailableAmount":561,  最大最小可退金额
              "minAvailableAmount":0
          }
      }
    */

    //  可退数量|availableNum/退货数量|applyNum/最大可退金额|availableAmount/退款金额|refundAmount
    //  退货原因 -下拉框|dictionaryApplyReason/


    // //最小最大可退金额 默认展示最大金额  // 退款金额  --->refundAmount(maxRefundAmount)


    let { dictionaryApplyReason, minRefundAmount, maxRefundAmount, maxRefundAmount: refundAmount, goodsInfoList } = data;
    // 数据属性名称映射

    // 未发货数量:toDistributeNum/退款流程中:applyRefundNum /退款数量:refundNum as goodsNum |availableNum 最大退款数

    // goodsInfoList 数据转换
    let map = [
      // 表格显示字段
      { name: "skuName", value: "goodsName" }, // 商品名称
      { name: "specification", value: "goodsSpecification" },// 规格
      { name: "lcSkuCode", value: "goodsLcCode" },// LC编码
      { name: "totalNum", value: "totalNum" },// 数量
      { name: "toDistributeNum", value: "toDistributeNum" },// 退款数量
      { name: "applyRefundNum", value: "applyRefundNum" },// 退款流程中
      { name: "refundNum", value: "goodsNum" },// 退款数量
      // 表单字段映射
      { name: "skuType", value: "skuType" },// skuType类型
      { name: "skuId", value: "goodsSkuId" },// skuId
      { name: "priceString", value: "priceString" },// 
    ];
    const goodsInfo = goodsInfoList.map( goodsInfo => {
      let item = {};
      map.forEach( ( { name, value } ) => {
        item[ value ] = goodsInfo[ name ]
      } );
      return item;
    } );

    // "skuName":"测试数据-007",  商品名称   ---> goodsName
    //           "specification":"test-001",  规格    ---> goodsSpecification 
    //           "lcSkuCode":"2200007187001",  LC编码 ---> goodsLcCode    
    //           "totalNum":10,   数量
    //           "toDistributeNum":6,  未发货数量 toDistributeNum
    //           "refundNum":6,  退款数量     --->  goodsNum
    //           "applyRefundNum":0,  退款流程中  applyRefundNum
    //           "availableNum":6,
    //           "skuType":0,     --->  skuType
    //           "unit":"颗",
    //           "availableAmount":336,
    //           "skuId":29797,      --->  goodsSkuId
    //           "refundAmount":336 
    dictionaryApplyReason = JSON.parse( dictionaryApplyReason ) || [];
    this.dictionaryApplyReason = dictionaryApplyReason
    this.minRefundAmount = minRefundAmount
    this.maxRefundAmount = maxRefundAmount

    // availableNum = 10
    let dataParam = { refundAmount, dictionaryApplyReason: "", goodsInfo };

    this.tableData = goodsInfo;

    // 父组件参数
    // let arr = [ "goodsName", "goodsSpecification", "lcSkuCode", "orderSn", "skuType", "goodsSkuId" ]

    // 联系人、联系电话 contact, mobile
    arr = [ "applyUserId", "memberId", "storeId", "orderSn", "contact", "mobile" ]
    let parentCompParams = {};
    arr.forEach( name => {
      parentCompParams[ name ] = this.params[ name ]
    } );

    let formData = createFormData();

    formData = {
      ...formData,
      ...dataParam,
      ...parentCompParams,
    }

    this.formData = formData;

    // this.$notify( {
    //   type: "success",
    //   message: msg || "成功"
    // } );
    if ( status == 200 && code !== "A0000" ) {
      this.$notify( {
        type: "error",
        message: msg || "数据获失败"
      } );
    }
  }

}
</script>
<style lang="stylus" scoped>
.toDistributeNum
  position relative
  padding-left 30px
  height 40px
  line-height 40px
  .applyRefundNum
    position absolute
    left 0
    top 24px
    height 18px
    line-height 18px
    color red
    font-size 12px
    font-weight normal
</style>
<style lang="stylus">
.refund-dialog
  .el-dialog
    min-width 700px
.dialogWidth
  width 900px
</style>

