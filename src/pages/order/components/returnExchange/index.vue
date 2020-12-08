<template>
  <!-- 发货情况一览  退货、换货对话框  ReturnExchange -->
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
    <!-- tableData- {{tableData}}
    <hr />-->
    <el-table
      ref="table"
      v-loading.body="tableLoading"
      tooltip-effect="dark"
      highlight-current-row
      :data="tableData"
      @current-change="handleSelectionChange"
    >
      <!-- <template slot-slot-scope="scope"> -->
      <!-- <el-table-column label="操作" width="80" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-radio v-model="checked" :label="scope.row.id"></el-radio>
        </template>
      </el-table-column>-->

      <!-- // 退货serviceType=1 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可退数量 availableNum  退货数量 applyNum
      // 换货serviceType=2 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可换数量 availableNum  换货数量 applyNum-->
      <el-table-column prop="goodsName" label="商品名称"></el-table-column>
      <el-table-column prop="goodsSpecification" label="规格" width="180" show-overflow-tooltip></el-table-column>
      <el-table-column prop="lcSkuCode" label="LC编码" width="180"></el-table-column>
      <el-table-column prop="totalNum" label="数量" width="80"></el-table-column>
      <el-table-column
        prop="maxReturnNum"
        :label="formData.serviceType==1?'可退数量':'可换数量'"
        width="120"
      ></el-table-column>
      <!-- <el-table-column prop="goodsNum" :label="`${serviceTypeName}数量`" width="120"></el-table-column> -->
      <!-- </template>
      <template v-if="formData.serviceType==2">
        <el-table-column prop="availableNum" label="可换数量" width="120"></el-table-column>
        <el-table-column prop="applyNum" label="换货数量" width="120"></el-table-column>
      </template>-->

      <!-- <el-table-column prop="name" label="可退数量" width="120">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>姓名: {{ scope.row.name }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{ scope.row.name }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>-->
    </el-table>

    <el-form ref="oForm" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="售后类型" prop="serviceType">
        <!-- 商品物理类型 1：正常商品；2：非实物商品(虚拟) isVirtual  虚拟商品只有【退货】-->
        <el-radio-group v-model="formData.serviceType" @change="handleChangeServiceType">
          <el-radio :label="1">退货</el-radio>
          <el-radio :label="2" v-if="formData.isVirtual==1">换货</el-radio>
        </el-radio-group>
        <span v-if="is3rdParty" style="color: red">(第三方商家暂不支持换货操作)</span>
      </el-form-item>
      <!-- 请输入退款商品数量 -->
      <el-form-item :label="`${serviceTypeName}数量`" prop="goodsNum">
        <!-- {{disabledGoodsNum}} -- {{formData.applyNum}}-- {{formData.availableNum}} applyNum <= availableNum? -->
        <el-input-number
          @change="handleChangeGoodsNum"
          v-model="formData.goodsNum"
          :min="1"
          :max="maxReturnNum"
          :disabled="disabledGoodsNum"
        ></el-input-number>
        <span style="color:red;">{{disabledGoodsNumTips}}</span>
      </el-form-item>

      <template v-if="formData.serviceType==1">
        <!-- 退款金额 -->
        <!-- <div style="color:red;">测试专用：上线删除 最小最大可退金额 {{minRefundAmount}} --- {{maxRefundAmount}}</div> -->
        <el-form-item
          label="退款金额"
          prop="refundAmount"
          :rules="{required: true, validator: this.validateRefundAmount, trigger: 'blur,change' }"
        >
          <el-input v-model="formData.refundAmount" placeholder="请输入退款金额"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model.trim="formData.contact" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model.trim="formData.mobile" placeholder="请填写联系人电话"></el-input>
      </el-form-item>
      <template v-if="formData.serviceType==2">
        <!-- :rules="{ required: true,type: 'number',message: '请选择联系地址', trigger: 'blur'}" -->
        <el-form-item
          label="联系地址:"
          prop="provinceId"
          :rules="{required: true, validator: this.validateProvinceId, trigger: 'blur,change' }"
        >
          <el-cascader
            ref="address"
            style="width:80%"
            :disabled="!areaAddressList"
            :options="areaAddressList"
            :value="'children'"
            v-model="selectedOptions"
            popper-class="cascadertop"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <!-- :rules="{ required: true,message: '请填写详细地址', trigger: 'blur'}" -->
        <el-form-item
          label="详细地址:"
          prop="detailAddress"
          :rules="{required: true, validator: this.validateDetailAddress, trigger: 'blur' }"
        >
          <el-input v-model.trim="formData.detailAddress"></el-input>
        </el-form-item>
      </template>
      <!-- <template v-if="formData.serviceType==1"> -->
      <el-form-item :label="`${serviceTypeName}原因`" required>
        <el-row style="margin-bottom:20px;" v-if="dictionaryApplyReason.length">
          <el-form-item
            label
            prop="dictionaryApplyReason"
            :rules="{required: true, validator: this.validateDictionaryApplyReason, trigger: 'blur,change' }"
          >
            <el-select
              v-model="formData.dictionaryApplyReason"
              :placeholder="`请输入${serviceTypeName}理由`"
            >
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
      <!-- </template> -->
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
import { Log } from "oidc-client";

@Component
export default class ReturnExchange extends Vue {
  @State( state => state.address.areaAddressList ) areaAddressList;
  @Action( 'address/getAreaList' ) getAreaAddressList;
  // 对话框
  @Prop( { type: Boolean, default: false } ) dialogVisible: boolean;

  // 表单提交额外参数
  @Prop( { default: () => ( {} ) } )
  params: any

  // 商品物理类型 1：正常商品；2：非实物商品(虚拟) isVirtual
  get isVirtual () {
    const { isVirtual } = this.params
    return isVirtual == 2;
  }

  // disabledGoodsNum: boolean = false;
  get disabledGoodsNum () {
    const { goodsNum } = this.formData
    return goodsNum > this.maxReturnNum
  }
  get disabledGoodsNumTips () {
    const { serviceType } = this.formData;
    const name = serviceType == 1 ? '退货' : '换货'

    if ( this.maxReturnNum == 0 ) {
      return `可${name}数为0，不允许修改提交!`;
    }

    return this.disabledGoodsNum ? `${name}数小于可${name}数，不允许修改提交!` : ""
  }
  get serviceTypeName () {
    const { serviceType } = this.formData;
    return serviceType == 1 ? '退货' : '换货'
  }
  get is3rdParty () {
    return this.$store.getters[ 'stores/is3rdParty' ]
  }


  dialogTitle: string = "退货申请"; // 换货申请
  buttonDisabled: boolean = false;
  selectedOptions: any = [];

  // 最大退款、退货数
  maxReturnNum: number = 0
  // 最小最大可退金额 默认展示最大金额
  minRefundAmount: number = 0
  maxRefundAmount: number = 0  // 退款金额  --->refundAmount

  // 退货serviceType=1 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可退数量availableNum  退货数量 applyNum

  // 换货serviceType=2 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可换数量availableNum  换货数量 applyNum

  // availableAmount 最大可退金额 <=
  // 售后类型serviceType/退款金额 refundAmount /退款数量 applyNum/退款金额  /联系人/联系电话/退货原因 dictionaryApplyReason 下拉 2个  联系地址:/详细地址

  // dictionaryApplyReason 为null 选填变成必填     skuNum <=可退数量availableNum

  /*
      售后类型 serviceType=1 
      退款数量   "goodsNum":"3",  退款数量 applyNum
      退款金额   "refundAmount":"90",    退款金额 serviceType=2 为0
      联系人     "contact":"领健",
      联系电话   "mobile":"118134",
      退货原因   下拉  "dictionaryApplyReason":"不想要了（换货）",  下拉框
                选填  "applyReason":"换货原因", 选填 

      serviceType=2
        refundAmount:0;
        dictionaryApplyReason:""
        applyReason:""
        "receiverAddress":"上海市浦东新区",  联系地址 receiverAddress
        detailAddress 详细地址
        if ( this.form.serviceType == 2 ) {
          params.receiverAddress = this.$refs.address.currentLabels.join( '' ) + this.form.detailAddress
        }
        delete params.provinceId
        delete params.cityId
        delete params.countryId
        delete params.detailAddress
  */

  // {
  //     "dataSource":"0",  写死
  //     "goodsImage":"",   默认值
  //     "purchaseProperty":"0", 写死
  //     "companyCode":"",  读取前面代码

  //     "goodsName":"健琪 一次性使用帽子测试商品",  skuName 父级
  //     "lcSkuCode":"2200007197001",  lcSkuCode 父级
  //     "goodsSpecification":"930S",       specification 父级
  //     "orderSn":"12006181650474193692",  orderSn 父级
  //     "skuType":"0",  skuType 父级
  //     "goodsSkuId":"30385"    skuId 父级

  //     "goodsNum":"3",  退款数量 applyNum
  // }

  dictionaryApplyReason: Array<string> = [];
  // 创建表单数据
  formData = createFormData();
  tableLoading: boolean = false;
  tableData: any = [];
  checked: any = null; // 如果使用单选框,定义一个model值
  currentSelectItem: any = {}; // 当前选中的值

  created () {
    // 地址:省市区
    this.getAreaAddressList();
    this.getAfterSalesServiceApplyInfo();
  }
  clearValidate ( formName ) {
    ( this.$refs[ formName ] as Form ).clearValidate();
  }

  handleChangeServiceType ( serviceType ) {
    console.log( "handleChangeServiceType", serviceType );
    // 清除自动触发的表单验证
    this.rules = { ...this.rules };

    console.log( "this.$refs.oForm", this.$refs.oForm );
    // ( this.$refs.oForm as Form ).clearValidate();
    let form: any = this.$refs.oForm
    form.fields.forEach( ( field, index ) => {
      // console.log( "forEachforEachforEach field", field );
      field.validate( '', errors => {
        console.log( "validate", field.prop, errors );
      } );
    } )

    // this.clearValidate( "oForm" );
    this.dialogTitle = serviceType == 1 ? "退货申请" : "换货申请"
    this.getAfterSalesServiceApplyInfo( serviceType );
  }
  handleChangeGoodsNum ( goodsNum ) {
    console.log( "handleChangeGoodsNum", goodsNum, this.formData.serviceType );

    if ( this.isVirtual ) {
      // 如果是虚拟商品不走接口
      return;
    }

    if ( this.formData.serviceType == 1 ) {
      this.getReturnAmount( goodsNum )
    } else {
      // serviceType=2 退款金额 为0
      this.formData.refundAmount = 0;
    }
  }
  // 需要传 区别全部和非全部的 参数,  在数量中直接被刨除
  validateGoodsNum ( rule, value, callback ): void {
    callback();
  }

  validateProvinceId ( rule, value, callback ): void {
    //  <!-- :rules="{ required: true,type: 'number',message: '请选择联系地址', trigger: 'blur'}" -->
    console.log( "validateProvinceId ", rule, value );
    if ( value === "" ) {
      return callback( new Error( '请选择联系地址' ) );
    }

    callback();
  }
  validateDetailAddress ( rule, value, callback ): void {
    value += '';
    value = value.trim();
    //  :rules="{ required: true,message: '请填写详细地址', trigger: 'blur'}"
    // console.log( "validateDetailAddress ", rule, value );
    if ( value === "" ) {
      return callback( new Error( '请填写详细地址' ) );
    }

    callback();
  }

  validateRefundAmount ( rule, value, callback ): void {
    value += '';
    value = value.trim();

    if ( value === "" ) {
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

  validateDictionaryApplyReason ( rule, value, callback ): void {
    value += '';
    value = value.trim();
    // 不填
    if ( value == '' ) {
      return callback( new Error( `请输入${this.serviceTypeName}原因` ) );
    }

    callback();
  }

  rules = {
    serviceType: [
      { required: true, type: 'number', message: '请选择售后类型', trigger: 'change' }
    ],
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
  async getReturnAmount ( goodsNum ) {
    const url = "/serviceOrderController/getReturnAmount";
    // API.xxxxxx
    let reqParams = { serviceType: this.formData.serviceType, skuNum: goodsNum, };
    let arr = [ "orderSn", "skuType", "lcSkuCode", "skuId" ]
    arr.forEach( name => {
      reqParams[ name ] = this.params[ name ]
    } );

    const {
      status,
      data: { code, msg, minRefundAmount, maxRefundAmount }
    } = await this.$http( url, reqParams );

    if ( status == 200 && code !== "A0000" ) {
      return this.$notify( {
        type: "error",
        message: msg || "数据获失败"
      } );
    }

    this.minRefundAmount = minRefundAmount
    this.maxRefundAmount = maxRefundAmount
    this.formData.refundAmount = maxRefundAmount; // 默认取最大值
  }

  async getRefundAmount () {
    const url = "/serviceOrderController/getRefundAmount";
    // API.xxxxxx
    let { orderSn, skuType, lcSkuCode, skuNum, skuId } = this.params;
    // let reqParams = {
    //   "clientType": "Admin",
    //   "lcCode": "2200007187002",
    //   "memberId": 1669,
    //   "number": 2,
    //   "orderSn": "12006291916458249265",
    //   "skuId": 29800,
    //   "skuType": 0,
    //   "userName": "rui.zhou@linkedcare.cn"
    // }
    let reqParams = {
      serviceType: this.formData.serviceType,
      orderSn, skuId, skuType, lcSkuCode, skuNum
    }
    const {
      status,
      data: { code, msg, data }
    } = await this.$http( url, reqParams );

    const res = await this.$http( url, reqParams )

    console.log( "resssssss", res );
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
  handleChange ( arr ) {
    console.log( "handleChange", arr );
    // this.formData.receiverAddress = ( this.$refs.address as any ).currentLabels.join( '' ) + this.formData.detailAddress;
    this.selectedOptions = arr
    this.formData.provinceId = arr[ 0 ]
    this.formData.cityId = arr[ 1 ]
    this.formData.countryId = arr[ 2 ]
  }
  refresh () {
    this.$emit( "refresh" );
  }
  submitForm ( formName ) {
    console.log( "submitForm", formName );

    ( this.$refs[ formName ] as Form ).validate( async ( valid ) => {
      console.log( "submitForm valid", valid );
      if ( valid ) {

        let formData = JSON.parse(
          JSON.stringify( this.formData )
        );
        const { serviceType, detailAddress } = formData;
        if ( serviceType == 2 ) {
          formData.receiverAddress = ( this.$refs.address as any ).currentLabels.join( '' ) + detailAddress;
        }
        formData.requestNo = Date.now(); // 时间戳
        console.log( "formData:", formData );

        const url = "/business/order/applyAfterSales";
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
      } else {
        console.log( 'error submit!!' );
        // return false;
      }
    } );
  }
  handleCloseDialog (): void {
    this.$emit( "update:dialogVisible", false );
  }

  // 退换货申请
  async getAfterSalesServiceApplyInfo ( serviceType = 1 ) {
    this.tableLoading = true;
    const url = "/serviceOrderController/getAfterSalesServiceApplyInfo";
    // API.updateDeliveryTime
    console.log( "this.params", this.params );
    // 商品物理类型 1：正常商品；2：非实物商品(虚拟) isVirtual
    let { isVirtual, orderSn, skuType, lcSkuCode, skuNum, goodsSkuId: skuId } = this.params;
    let reqParams = {
      // "orderSn": "12006181650474193692",
      // "skuId": "30385",
      // "skuType": "0",
      // "lcSkuCode": "lcSkuCode",
      // "skuNum": "20",
      // "serviceType": "1",
      serviceType,
      isVirtual,
      orderSn, skuId, skuType, lcSkuCode, skuNum
    }

    let res = null;

    try {
      res = await this.$http( url, reqParams );
    } catch ( error ) {
      const {
        status,
        data: { code, msg }
      } = error;
      if ( status == 200 && code !== "A0000" ) {
        return this.$notify( {
          type: "error",
          message: msg || "数据获失败"
        } );
      }
    } finally {
      this.tableLoading = false;
    }
    const {
      status,
      data: { code, msg, data }
    } = res;

    // applyNum: 0
    // availableAmount: 0
    // availableNum: 0
    // dictionaryApplyReason: "["不想要/买多了/买错了","7/30天退换货","大小/尺寸/重量与描述不符","品牌/规格/成分与描述不符","效期/保质期短","商品破损","发错货","其他"]"
    // refundAmount: 0

    // 退货serviceType=1 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可退数量 availableNum  退货数量 applyNum 

    // 换货serviceType=2 商品名称 skuName  规格 specification  LC编码 lcSkuCode | 数量 skuNum  可换数量 availableNum  换货数量 applyNum

    //  可退数量|availableNum/退货数量|applyNum/最大可退金额|availableAmount/退款金额|refundAmount
    //  退货原因 -下拉框|dictionaryApplyReason/
    let { dictionaryApplyReason, minRefundAmount, maxRefundAmount, maxRefundAmount: refundAmount, maxReturnNum } = data;

    let goodsNum = maxReturnNum || 1; // 退货数量 

    dictionaryApplyReason = JSON.parse( dictionaryApplyReason ) || [];
    this.dictionaryApplyReason = dictionaryApplyReason

    this.maxReturnNum = maxReturnNum
    this.minRefundAmount = minRefundAmount
    this.maxRefundAmount = maxRefundAmount

    let dataParam = { goodsNum, refundAmount, dictionaryApplyReason: "", };

    // 商品名称/规格/LC编码/数量 lcSkuCode 上面已经定义了 直接可用
    const { goodsName, goodsSpecification, totalNum } = this.params;
    this.tableData = [ {
      goodsName, // 商品名称
      goodsSpecification, // 规格
      lcSkuCode, // LC编码
      totalNum, // 数量
      maxReturnNum, // 可退/换数量
      goodsNum, // 退货/换货数量
    } ];


    // 父组件参数 联系人、联系电话 contact, mobile
    let arr = [ "applyUserId", "goodsName", "goodsSpecification", "goodsLcCode", "lcSkuCode", "orderSn", "skuType", "goodsSkuId", "contact", "mobile" ]
    let parentCompParams = { isVirtual };
    arr.forEach( name => {
      parentCompParams[ name ] = this.params[ name ]
    } );

    let formData = createFormData( serviceType );

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
<style lang="stylus">
.refund-dialog
  .el-dialog
    min-width 700px
.dialogWidth
  width 900px
</style>

