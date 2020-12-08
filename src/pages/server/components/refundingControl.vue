<template>
  <div>
    <template
      v-if="item['serviceStatus'] =='10' || item['serviceStatus'] =='20' || item['serviceStatus'] =='30'"
    >
      <el-button
        @click="popVisible('resolve')"
        size="small"
        type="primary"
        v-if="$permissionValidate([587,776])"
      >通过</el-button>
    </template>
    <!-- 退货审核通过,待客户退货——11、 换货审核通过,待客户退货——21 -->
    <template v-else-if="item.serviceStatus=='11'||item.serviceStatus=='21'">
      <el-button
        v-if="$permissionValidateWithEnv(1270,1261)"
        class="marginRight20"
        @click="enterReturnLogistics"
        size="small"
        type="primary"
      >录入退货物流</el-button>
    </template>

    <!-- <template v-else-if="item['serviceStatus'] =='12'||item['serviceStatus'] =='22'">
      <el-button @click="popVisible('restart')" size="small" type="primary">再次申请</el-button>
    </template>-->
    <template v-else-if="item['serviceStatus'] =='13'|| item['serviceStatus'] =='23'">
      <el-button
        @click="popVisible('storageReceipt')"
        size="small"
        type="primary"
        v-if="$permissionValidate([583,772])"
      >确认收货</el-button>
    </template>
    <template v-else-if="item['serviceStatus'] =='14' && item['usingVoucher'] == 0">
      <el-button
        @click="popVisible('refunding')"
        size="small"
        type="primary"
        v-if="$permissionValidate([586,775])"
      >确认退款</el-button>
    </template>
    <!-- <template v-else-if="item['serviceStatus'] =='26'">
      <el-button @click="popVisible('exchange')" size="small" type="primary">再次发货</el-button>
    </template>-->
    <template
      v-else-if="(item['serviceStatus'] =='15'||item['serviceStatus'] =='25'||item['serviceStatus'] =='31') && item['usingVoucher'] == 0"
    >
      <el-button
        @click="popVisible('complete')"
        size="small"
        type="primary"
        v-if="$permissionValidate([585,774])"
      >完成</el-button>
    </template>
    <template v-if="checkRejectStatus(item)">
      <el-button
        @click="popVisible('reject')"
        size="small"
        type="primary"
        v-if="$permissionValidate([584,773])"
      >拒绝</el-button>
    </template>
    <template>
      <el-button
        @click="openRefundDeatilDialog(item)"
        size="small"
        type="primary"
        v-if="$permissionValidate([1249,1245]) && item['voucherSn']"
      >查看退款申请</el-button>
    </template>

    <el-dialog title="提示" v-model="dialogVisible" v-if="dialogVisible" size="tiny">
      <template v-if="msgType=='resolve'">
        该申请满足条件，
        <el-tag type="primary">给予通过</el-tag>
        <!-- 根据服务单类型如果是换货（serviceType=2）不显示 退款金额   -->
        <template v-if="item.serviceType!=2">
          <br />退款的金额
          <el-tag type="danger">{{item.suggestRefundAmount}}￥</el-tag>
        </template>
        <!-- :disabled="true" -->
        <!-- 请输入需要退款的金额
        <el-input disabled v-model="item.suggestRefundAmount" type="number"></el-input>-->
        <!-- </template> -->
      </template>
      <template v-else-if="msgType=='reject'">
        该申请不满足条件，
        <el-tag type="danger">拒绝通过</el-tag>
        <el-input v-model="reason" type="textarea"></el-input>
      </template>
      <template v-else-if="msgType=='storageReceipt'">
        <!--是否发起对账的条件 替换为 是否月结订单 -->
        <span v-if="item.orderType == 1">该服务单还未发起对账，确认收货后将直接完成，确认已经收到货物了吗？</span>
        <span v-else>是否确认已收到需退还的货物？</span>
      </template>
      <template v-else-if="msgType=='refunding'">
        <h3 v-if="item.refundGoodsStatus">商品入库时状态异常，请与仓库管理人员联系后退款。</h3>是否确认退款
      </template>

      <template v-else-if="msgType=='complete'">是否确认手动完成此服务单？</template>
      <template v-else-if="msgType=='restart'">是否确认重新申请此服务单？</template>
      <template v-else-if="msgType=='exchange'">
        <h3 v-if="item.refundGoodsStatus">商品入库时状态异常，请与仓库管理人员联系后发货。</h3>再次发货，请输入快递信息
        <el-input placeholder="请输入快递单号" v-model="logisticNo">
          <el-select v-model="companyId" slot="prepend" placeholder="快递类别">
            <el-option
              v-for="logc in allLogistic"
              :label="logc.name"
              :value="logc.id"
              :key="logc.id"
            ></el-option>
          </el-select>
          <!-- <el-button slot="append" icon="search" @click="popHide"></el-button> -->
        </el-input>
      </template>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false" size="small">取 消</el-button>
        <el-button type="primary" @click="popHide" size="small">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 录入退货物流单号对话框 -->
    <el-dialog
      title="录入退货物流单号"
      v-if="visibleEnterReturnLogisticsDialog"
      v-model="visibleEnterReturnLogisticsDialog"
      size="tiny"
    >
      <el-form
        ref="formEnterReturnLogistics"
        :model="formEnterReturnLogistics"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="服务单号">{{formEnterReturnLogistics.serviceSn}}</el-form-item>
        <el-form-item label="订单号">{{formEnterReturnLogistics.orderSn}}</el-form-item>
        <el-form-item label-width="0" style="margin:0">
          <el-input placeholder="请输入快递单号" v-model="formEnterReturnLogistics.logisticNo">
            <el-select
              v-model="formEnterReturnLogistics.companyId"
              slot="prepend"
              placeholder="快递类别"
            >
              <el-option
                v-for="logc in allLogistic"
                :label="logc.name"
                :value="logc.id"
                :key="logc.id"
              ></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <div style="display: flex;">
          <div style="width:120px;">
            <el-form-item label-width="0" prop="companyId"></el-form-item>
          </div>
          <div style="flex:1">
            <el-form-item label-width="0" prop="logisticNo"></el-form-item>
          </div>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="visibleEnterReturnLogisticsDialog=false" size="small">取&nbsp;&nbsp;消</el-button>
        <el-button
          type="primary"
          @click="submitFormEnterReturnLogistics('formEnterReturnLogistics')"
          size="small"
        >确&nbsp;&nbsp;定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Inject, Watch } from "vue-property-decorator";
import { State, Action } from "vuex-class";
import API from "../../../API";
import { Form } from "element-ui";

// 录入退货物流
interface FormEnterReturnLogistics {
  serviceSn: string; // 服务单号
  orderSn: string; // 订单号
  companyId: string | number; // 选择快递公司
  logisticNo: string | number; // 填写物流单号
  serviceType: string | number; // 类型 
  [ x: string ]: any;
}

@Component( {
  name: "server-refunding-control"
} )
export default class ServerRefundingControl extends Vue {
  @Action( "logistic/getAllLogistic" ) getAllLogistic;
  @State( state => state.logistic.logistic ) allLogistic;
  @State( state => state.login.userName ) reviewName;
  @Prop( { required: true } )
  item;
  dialogVisible: boolean = false;
  reason: string = "";
  companyId: number = null;
  logisticNo: string = "";
  // @Watch('dialogVisible')
  // dialogVisibleWatcher(v) {
  //   if (!v) {
  //     this.callBack()
  //     this.msgType = ''
  //   }
  // }

  popVisible ( msgType ) {
    this.dialogVisible = true;
    this.msgType = msgType;
  }
  msgType: string = "";
  popHide () {
    this.callBack().then(
      () => {
        this.dialogVisible = false;
      },
      rej => console.log( "reject" )
    );
  }
  callBack () {
    let fn = this[ this.msgType ];
    if ( typeof fn == "function" ) {
      return fn();
    } else {
      return Promise.reject(
        this.msgType + " is not a function at this"
      ).then( res => console.error( res ) );
    }
  }

  created () {
    this.getAllLogistic();
  }

  // 录入退货物流
  // 对话框
  visibleEnterReturnLogisticsDialog: boolean = false;
  // 表单
  formEnterReturnLogistics: FormEnterReturnLogistics = {
    clientType: "PC",
    serviceSn: "", // 服务单号
    orderSn: "", // 订单号
    companyId: "", // 选择快递公司
    logisticNo: "", // 填写物流单号 logisticNo
    serviceType: "" // 类型 
  };

  validateCompanyId ( rule, value, callback ) {
    value = `${value}`.trim();
    if ( value === "" ) {
      return callback( new Error( "选择快递公司" ) );
    } else {
      // this.$nextTick(() => {
      if ( this.formEnterReturnLogistics.companyId !== "" ) {
        ( this.$refs.formEnterReturnLogistics as Form ).validateField( "logisticNo" );
      }
      callback();
    }
  }
  validatelogisticNo ( rule, value, callback ) {
    value = `${value}`.trim();
    if ( value === "" ) {
      return callback( new Error( "填写物流单号" ) );
    }
    callback();
  }
  rules: Object = {
    companyId: [ { validator: this.validateCompanyId, trigger: "blur" } ],
    logisticNo: [ { validator: this.validatelogisticNo, trigger: "blur" } ]
  };
  // 点击对话框
  enterReturnLogistics () {
    this.visibleEnterReturnLogisticsDialog = true;

    // 服务单号/订单号
    const { serviceSn, orderSn, serviceType } = this.item;

    this.formEnterReturnLogistics = {
      ...this.formEnterReturnLogistics,
      // ...JSON.parse( JSON.stringify( this.item ) )
      serviceSn, orderSn, serviceType
    };
  }
  refresh () {
    this.$emit( "refresh" );
  }
  submitFormEnterReturnLogistics ( formName ) {
    ( this.$refs[ formName ] as Form ).validate( async ( valid: boolean ) => {
      if ( !valid ) return;
      const formData = JSON.parse(
        JSON.stringify( this.formEnterReturnLogistics )
      );

      /*
      TODO 7.15上线需求：http://jira.linkedcare.cn:8000/browse/ET-4434
        服务中心
        https://etradetest.linkedcare.cn/trade-manage/#/server/refunding
        1、通过 删除金额的显示    
        2、添加 【录入退货物流】 
        
        退货审核通过,待客户退货---11、“换货审核通过,待客户退货--21

      */

      // return;
      const url = "/business/order/customerReturnGoods";
      // API.updateDeliveryTime
      const res = await this.$http( url, formData );

      const {
        status,
        data: { msg, code }
      } = res;
      if ( status == 200 && code == "A0000" ) {
        this.refresh();
        this.visibleEnterReturnLogisticsDialog = false;
        this.$notify( {
          type: "success",
          message: msg || "修改成功"
        } );
      } else {
        this.$notify( {
          type: "error",
          message: msg || "修改错误"
        } );
      }
    } );
  }
  // ---------end 录入退货物流

  checkRejectStatus ( item ) {
    let arrs = [ 12, 14, 15, 19, 22, 29, 31, 32, 38, 39 ];
    // return item.serviceType != 3 && item['serviceStatus'] !='19' && item['serviceStatus'] !='29'
    // && item['serviceStatus'] !='12'&& item['serviceStatus'] !='22'&& item['serviceStatus'] !='14'&& item['serviceStatus'] !='15'
    // return item.serviceType != 3 && arrs.indexOf(item['serviceStatus']) == -1
    return arrs.indexOf( +item[ "serviceStatus" ] ) == -1;
  }

  restart () {
    let serviceType = this.item.serviceType;
    let applyTime = this.formatMyDate( new Date() );
    let serviceStatus = serviceType == "1" ? "10" : "20";
    let reviewTime = null;
    let reviewNoPassReason = "";
    let reviewName = "";
    return this.updateServiceOrder(
      { serviceStatus, reviewName, applyTime, reviewTime, reviewNoPassReason },
      [
        "applyTime",
        "reviewTime",
        "reviewName",
        "reviewNoPassReason",
        "serviceStatus"
      ]
    );
  }
  @Inject() formatMyDate;
  // 通过 按钮表单提交
  resolve () {
    let { serviceType } = this.item;
    let reviewTime = this.formatMyDate( new Date() );
    let serviceStatus =
      serviceType == "1" ? "11" : serviceType == "2" ? "21" : "31";
    let reviewName = this.reviewName;

    // 退款的金额 不要提交

    // let refundAmount = ( "" + suggestRefundAmount ).trim();
    // if ( serviceStatus == "11" && ( refundAmount === "" || +refundAmount < 0 ) ) {
    //   this.$notify( {
    //     type: "error",
    //     message: "请确认退款金额正确！"
    //   } );
    //   return Promise.reject( "fail" );
    // }
    // // let refundTime = this.formatMyDate( new Date() )
    // if ( serviceStatus == "21" || serviceStatus == "31" ) {
    //   refundAmount = "";
    // }

    return this.updateServiceOrder(
      { serviceStatus, reviewName, reviewTime, },
      [ 'reviewTime', 'reviewName', 'serviceStatus', 'refundTime' ]
    );
  }
  reject () {
    let reviewNoPassReason = this.reason.trim();
    if ( !reviewNoPassReason ) {
      this.$notify( {
        type: "error",
        message: "拒绝理由不能为空！"
      } );
      return Promise.reject( "fail" );
    }
    let serviceType = this.item.serviceType;
    let serviceStatus =
      serviceType == "1" ? "12" : serviceType == "2" ? "22" : "38";
    let reviewTime = this.formatMyDate( new Date() );

    let reviewName = this.reviewName;
    return this.updateServiceOrder(
      { serviceStatus, reviewNoPassReason, reviewName, reviewTime },
      [ "reviewNoPassReason", "reviewTime", "reviewName", "serviceStatus" ]
    );
  }
  refunding () {
    // let refundAmount = this.refundAmount.trim()

    // if ( refundAmount === '' || +refundAmount < 0 ) {
    //   this.$notify( {
    //     type: 'error',
    //     message: '请确认退款金额正确！'
    //   } )
    //   return Promise.reject( 'fail' )
    // }
    let refundTime = this.formatMyDate( new Date() );
    // let serviceType = this.item.serviceType
    let serviceStatus = "15";
    return this.updateServiceOrder(
      // { serviceStatus, refundAmount, refundTime },

      { serviceStatus, refundTime },
      [ "refundTime", "serviceStatus" ]
    );
  }
  exchange () {
    let serviceStatus = "25";
    let logisticNo = this.logisticNo.trim(),
      companyId = this.companyId;
    if ( !companyId || !logisticNo ) {
      return this.$notify( {
        type: "error",
        message: "物流信息不能为空！"
      } );
    }
    let exchangeTime = this.formatMyDate( new Date() );
    return this.updateServiceOrder(
      { serviceStatus, logisticNo, companyId, exchangeTime },
      [ "exchangeTime", "serviceStatus" ]
    ).then( res => {
      this.item.exchangeLogisticId = "无";
    } );
  }
  complete () {
    let serviceType = this.item.serviceType;
    let serviceStatus;
    switch ( serviceType ) {
      case 1:
        serviceStatus = 19;
        break;
      case 2:
        serviceStatus = 29;
        break;
      case 3:
        serviceStatus = 39;
        break;
    }
    // let serviceStatus = serviceType == '1' ? '19' : '29'
    let completeTime = this.formatMyDate( new Date() );
    return this.updateServiceOrder( { serviceStatus, completeTime }, [
      "completeTime",
      "serviceStatus"
    ] );
  }
  storageReceipt () {
    let serviceStatus;
    let { serviceType, orderType } = this.item;
    if ( orderType == 1 ) {
      // 月结订单
      serviceStatus = serviceType == "1" ? "19" : "29";
    } else {
      serviceStatus = serviceType == "1" ? "14" : "24";
    }
    // let serviceStatus = serviceType == '1' ? '14' : '24'
    let storageReceiptTime = this.formatMyDate( new Date() );
    return this.updateServiceOrder( { serviceStatus, storageReceiptTime }, [
      "storageReceiptTime",
      "serviceStatus"
    ] );
  }
  // o 传递的具体参数
  // shouldInitArr 请求成功后修改的字段，从o中获取数据
  updateServiceOrder ( o, shouldInitArr: string[] = [ "serviceStatus" ] ) {
    let { id, serviceSn } = this.item;
    return this.$http( API.updateServiceOrder, {
      id,
      serviceSn,
      ...o,
      broadcast: true
    } )
      .then( res => {
        shouldInitArr.forEach( val => {
          this.item[ val ] = o[ val ];
          console.log( this.item, o );
        } );
        return res;
      } )
      .catch( err => {
        this.$notify( {
          type: "error",
          message: err.data.msg || "请求错误"
        } );
        return err;
      } );
  }
  openRefundDeatilDialog ( item ) {
    this.$emit( "open-refund-application", item );
  }
}
</script>
<style lang="stylus">
// .el-dialog__wrapper {
// z-index: 99999 !important;
// }
.el-input-group__prepend
  width 90px
</style>
<style lang="stylus" scoped>
.el-button
  min-width 68px
., .margin0
  margin 0
.marginRight20
  margin-right 20px
  margin-bottom 5px
</style>



