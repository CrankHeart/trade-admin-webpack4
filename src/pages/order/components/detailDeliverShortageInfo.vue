<template>
  <div class="order-detail-deliver">
    <div class="order-detail-deliver__item">
      <div class="action-box">
        <el-button
          v-if="$permissionValidateWithEnv(1269,1260)"
          @click="refresh"
          class="pull-right all-refund-btn"
          type="primary"
          size="small"
        >刷新</el-button>
        <el-button
          v-if="$permissionValidate(deliveryTimePermission)"
          class="pull-right all-refund-btn"
          type="primary"
          size="small"
          @click="showDeliveryTypeDialog"
        >更改交期</el-button>
      </div>
      <template>
        <!-- <h3 style="overflow: hidden;"> -->

        <!-- </h3> -->
        <lc-table
          :max-height="500"
          :config="formatTableBaseConfig"
          :data="deliveryList"
          :has-page="false"
        >
          <template slot-scope="scope">
            <template v-if="scope.con.prop=='deliveryDate'">{{scope.row.deliveryTime}}</template>
            <template v-else-if="scope.con.prop=='expectedDate'">{{scope.row.expectedTime}}</template>
            <!-- <template
              v-if="scope.con.prop=='deliveryDate'"
            >{{scope.row.deliveryDate ? formatMyDate(scope.row.deliveryDate.time, 'yyyy-MM-dd') : ''}}</template>
            <template
              v-else-if="scope.con.prop=='expectedDate'"
            >{{scope.row.expectedDate ? formatMyDate(scope.row.expectedDate.time, 'yyyy-MM-dd') : ''}}</template>-->
            <template v-else-if="scope.con.prop == 'riskLevel'">
              <span
                :class="{'danger-risk': scope.row[scope.con.prop] == 1, 'warn-risk': scope.row[scope.con.prop] == 2, 'success-risk': scope.row[scope.con.prop] >= 3}"
              >{{ formatRiskLevel( scope.row[scope.con.prop] ) }}</span>
            </template>
            <template v-else-if="scope.con.prop=='realShortNumber'">{{scope.row.realShortNumber}}</template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
            <template v-if="scope.con.prop === 'control'">
              <!-- <el-button
                size="small"
                type="danger"
                @click="handleEdit(scope.$index, scope.row)"
              ></el-button>-->
              <a
                href="javascript:;"
                class="link-primary"
                @click="handleEdit(scope.$index, scope.row)"
              >更改交期</a>
            </template>
          </template>
        </lc-table>
      </template>
    </div>
    <el-dialog title="批量更改商品单交期" v-model="visibleFormBatchDialog" size="tiny">
      <!-- <span>修改交期</span>
      <el-date-picker
        v-model="currDeliveryTime"
        type="date"
        placeholder="选择日期"
        @change="changeDeliveryTime"
      ></el-date-picker>-->

      <el-form ref="formBatch" :model="formBatch" :rules="rules" label-width="100px">
        <el-form-item label="修改交期" prop="deliveryDataTime">
          <el-date-picker
            v-model="formBatch.deliveryDataTime"
            type="date"
            format="yyyy-MM-dd"
            placeholder="选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visibleFormBatchDialog=false" size="small">取&nbsp;&nbsp;消</el-button>
        <el-button type="primary" @click="submitFormBatch('formBatch')" size="small">确&nbsp;&nbsp;定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="更改商品单交期" v-model="visibleFormSingleDialog" size="tiny">
      <el-form ref="formSingle" :model="formSingle" :rules="rules" label-width="100px">
        <el-form-item label="商品名称">{{formSingle.skuName}}</el-form-item>
        <el-form-item label="规格">{{formSingle.specification}}</el-form-item>
        <el-form-item label="LC编码">{{formSingle.lcSkuCode}}</el-form-item>
        <el-form-item label="修改交期" prop="deliveryDataTime">
          <!-- format="yyyy-MM-dd" -->
          <el-date-picker
            :default-value="formSingle.deliveryDataTime"
            v-model="formSingle.deliveryDataTime"
            type="date"
            format="yyyy-MM-dd"
            placeholder="选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="visibleFormSingleDialog=false" size="small">取&nbsp;&nbsp;消</el-button>
        <el-button
          type="primary"
          @click="submitFormSingle('formSingle')"
          size="small"
        >确&nbsp;&nbsp;定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
// import Vue from "vue";
import { Vue, Component, Inject, Prop, Watch } from "vue-property-decorator";
import API from "../../../API";
import { State } from "vuex-class";
import lcTableConfig from "../../../components/table/control.vue";
import lcTable from "../../../components/table/";
import { deliveryStates } from "../const/orderSearchCondition";
import { matchArrItem } from "../../../utils/";
import { riskLevels } from "../../procurement/const/index";

import { Form } from "element-ui";

// 批量
interface FormUpdateDeliveryTime {
  orderSn: string;
  deliveryDataTime: any; // 前台展现
  deliveryTime: string; // 传给后台
}
// 单个
interface FormUpdateDeliveryTimeSingle {
  skuName: string; // 商品名称
  specification: string; // 规格
  lcSkuCode: string; // LC编码
  skuId: string;
  orderSn: string;
  deliveryDataTime: any; // 前台展现
  deliveryTime: string; // 传给后台
}

@Component( {
  name: "orde-detail-deliver",
  components: {
    lcTable,
    lcTableConfig
  }
} )
export default class DetailDeliverShortageInfo extends Vue {
  @Prop( { default: {} } )
  memberOrder: any;
  @Prop() orderSn: string;
  @Prop() deliveryList: any[];

  @Watch( "deliveryList" )
  getDeliveryList ( newVal, oldVal ) {
    console.log( "watch deliveryList:", this.deliveryList );
  }
  @Inject() formatMyDate;
  visibleFormBatchDialog: boolean = false;
  visibleFormSingleDialog: boolean = false;
  currDelivery: any = {};
  currDeliveryTime: string = "";
  // 批量
  formBatch: FormUpdateDeliveryTime = {
    orderSn: "",
    deliveryDataTime: "",
    deliveryTime: ""
  };
  // 单个
  formSingle: FormUpdateDeliveryTimeSingle = {
    skuName: "", // 商品名称
    specification: "", // 规格
    lcSkuCode: "", // LC编码
    skuId: "",
    orderSn: "",
    deliveryDataTime: "",
    deliveryTime: ""
  };
  currentIndex: number = -1;
  rules: Object = {
    deliveryDataTime: [
      { type: "date", required: true, message: "请选择日期", trigger: "change" }
    ]
  };
  get deliveryTimePermission () {
    return process.env.NODE_ENV == "production" ? 1142 : 1144;
  }
  get memberId () {
    return this.memberOrder.member;
  }
  deliveryListItem: object = null;

  @State( state => state.order.config13 ) baseConfig1;

  shortageConfig = [
    { prop: "skuName", label: "商品名称", width: "210px" },
    { prop: "specification", label: "规格", width: "110px" },
    { prop: "lcSkuCode", label: "LC编码", width: "210px" },
    { prop: "storeSkuCode", label: "自有编码", width: "210px" },
    { prop: "skuNum", label: "未发数量", width: "110px" },
    { prop: "lockedNum", label: "库存预留数量", width: "100px" },
    { prop: "outStockNum", label: "缺货数量", width: "100px" },
    { prop: "unit", label: "单位", width: "100px" },
    { prop: "deliveryDate", label: "规定交期", width: "220px" },
    { prop: "expectedDate", label: "预计交期", width: "220px" },
    { prop: "riskLevel", label: "交付风险", width: "110px" },
    { prop: "control", label: "操作", width: "110px", fixed: 'right' }
  ];

  get formatTableBaseConfig () {
    let tableConfig = [ ...this.shortageConfig ];
    return tableConfig;
  }

  formatRiskLevel ( level ) {
    return matchArrItem( level, riskLevels, "id" ).name;
  }

  showDeliveryTypeDialog () {
    let max = this.deliveryList[ 0 ].deliveryDate.time;
    for ( let i = 1; i < this.deliveryList.length; i++ ) {
      let cur = this.deliveryList[ i ].deliveryDate.time;
      cur > max ? ( max = cur ) : null;
    }

    // this.deliveryList.forEach(item => item.deliveryDate.time = max)
    this.visibleFormBatchDialog = true;
  }

  changeDeliveryTime ( date ) {
    if ( !date ) {
      return;
    }
    this.$http( API.updateDeliveryTime, {
      orderSn: this.orderSn,
      deliveryTime: date
    } )
      .then( res => {
        this.visibleFormBatchDialog = false;
        // this.currDelivery.deliveryDate.time = date
        this.deliveryList.forEach( item => ( item.deliveryDate.time = date ) );
      } )
      .catch( err => {
        this.$notify( {
          type: "error",
          message: err.msg || "修改错误"
        } );
      } );
  }

  refresh () {
    // shortageInfo
    this.$emit( "refresh", "shortageInfo" );
  }
  submitFormBatch ( formName ) {
    // this.$refs[formName].validate(valid => {
    // (this.$refs['form'] as any).validate((valid : boolean)=> {
    ( this.$refs[ formName ] as Form ).validate( async ( valid: boolean ) => {
      if ( !valid ) return;
      const formData = JSON.parse( JSON.stringify( this.formBatch ) );
      formData.orderSn = this.orderSn;

      let { deliveryDataTime } = formData;
      let deliveryTime = this.formatMyDate( deliveryDataTime, "yyyy-MM-dd" );
      formData.deliveryTime = deliveryTime;

      const {
        status,
        data: { msg, code }
      } = await this.$http( API.updateDeliveryTime, formData );

      if ( status == 200 ) {
        // this.deliveryList.forEach(item => {
        //   item.deliveryTime = deliveryTime;
        // });
        this.refresh();
        this.visibleFormBatchDialog = false;

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
  handleEdit ( index, row ) {
    // scope:{con: {…}, row: {…}, $index: 0}
    let { deliveryDataTime } = row;

    this.currentIndex = index; // 当前修改的数据索引
    this.visibleFormSingleDialog = true;
    this.formSingle = {
      ...this.formSingle,
      ...JSON.parse( JSON.stringify( row ) ),
      // 必须重新赋值为Date类型，解决element-ui验证失败的问题
      deliveryDataTime: new Date( deliveryDataTime )
    };
  }
  submitFormSingle ( formName ) {
    // this.$refs[formName].validate(valid => {
    // (this.$refs['form'] as any).validate((valid : boolean)=> {
    ( this.$refs[ formName ] as Form ).validate( async ( valid: boolean ) => {
      if ( !valid ) return;
      const formData = JSON.parse( JSON.stringify( this.formSingle ) );
      // formData.orderSn = this.orderSn;

      let { deliveryDataTime } = formData;
      let deliveryTime = this.formatMyDate( deliveryDataTime, "yyyy-MM-dd" );
      formData.deliveryTime = deliveryTime;
      const {
        status,
        data: { msg, code }
      } = await this.$http( API.updateDeliveryTimeSingle, formData );

      if ( status == 200 ) {
        // this.deliveryList.splice(this.currentIndex, 1, formData);
        this.refresh();
        this.visibleFormSingleDialog = false;
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
}
</script>
<style lang="stylus" scoped>
.el-date-editor.el-input
  width 140px
.order-detail-deliver__item
  > p
    border 2px solid #ccc
    line-height 35px
    padding 5px 20px 0
.refund-introduce
  text-decoration underline
  margin-left 5px
  cursor pointer
.all-refund-btn
  margin 0 0 10px
.delivery-time-link
  color #20a0ff
  cursor pointer
.success-risk
  color #20a0ff
.warn-risk
  color #FF9900
.danger-risk
  color #ff4949
.link-primary
  text-decoration underline
  color #409eff
  cursor pointer
  padding 0
  font-size 14px
  font-weight 500
.link-primary:hover
  color #66b1ff
</style>
<style lang="stylus">
.order-detail-deliver
  .el-table__body-wrapper
    z-index 1
  .el-dialog.el-dialog--samll
    width 20%
</style>
