<template>
  <div class="purchasing-plan-details-unstarted-table">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <template v-if="currentPage!='createPurchasingPlan'">
          <el-button
            type="primary"
            @click="setInExcel"
            v-if="$permissionValidateWithEnv(1156, 1146)"
          >导入Excel</el-button>
          <template v-if="importTaskInfo.status==2">
            <el-button
              type="primary"
              @click="setInExcel"
              v-loading.fullscreen.lock="fullscreenLoading"
              element-loading-text="批量导入比较耗时,请耐心等候:>"
            >导入中,请稍后</el-button>
          </template>
          <template v-else-if="importTaskInfo.status==3">
            <el-button type="primary" @click="showErrorMsg">导入完成,查看结果</el-button>
          </template>
          <template v-else-if="importTaskInfo.status==4">
            <el-button type="danger" @click="showErrorMsg">导入失败,查看结果</el-button>
          </template>
        </template>
        <el-button
          type="primary"
          @click="setOutExcel"
          v-if="$permissionValidateWithEnv(1157, 1147)"
        >导出Excel</el-button>
      </template>
    </lc-condition>
    <lc-table
      ref="skuTable"
      class="table-margin"
      :config="planDetailsConfig"
      :data="tableList"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <template>
          <template v-if="scope.con.prop=='control'">
            <template v-if="scope.row.isEdit">
              <span class="pramary pointer" @click="saveEditorPlanData(scope.row)">保存</span>
              <span class="pramary pointer" @click="scope.row.isEdit = false">取消</span>
            </template>
            <span v-else class="pramary pointer" @click="scope.row.isEdit = true">编辑</span>
          </template>
          <!-- <template v-else-if="scope.con.prop=='gapsNumber'">
            <template>{{filterNotMined(+scope.row['purchaseNum'] - +scope.row['storedNum']||0 - +scope.row['onWayNum']||0)}}</template>
          </template>-->
          <!-- <template v-else-if="scope.con.prop=='currDeliveryDetails'">
            <template>
              <span class="pramary pointer">查看详情</span>
            </template>
          </template>-->
          <template v-else-if="scope.con.prop=='deliveryDate'">
            <template v-if="!!scope.row[scope.con.prop] && scope.row.isEdit">
              <el-date-picker
                style="width: 150px;"
                v-model="scope.row[scope.con.prop].time"
                type="date"
                placeholder="选择日期"
              ></el-date-picker>
            </template>
            <template
              v-else-if="!!scope.row[scope.con.prop] && !scope.row.isEdit"
            >{{formatMyDate( scope.row[scope.con.prop].time, 'yyyy-MM-dd' )}}</template>
          </template>
          <template v-else-if="scope.con.prop=='purchaseNum'">
            <template v-if="scope.row.isEdit">
              <el-input v-model="scope.row[scope.con.prop]" placeholder="请输入内容"></el-input>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
          <template
            v-else-if="scope.con.prop=='goodLabel'"
          >{{scope.row[scope.con.prop] ? '常备商品':'订购商品'}}</template>
          <!-- <template v-else-if="scope.con.prop=='buyerId'">
            <template v-if="scope.row.isEdit">
              <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择">
                <el-option
                  v-for="item in buyerList"
                  :key="item.id"
                  :label="item.loginName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </template>
            <template v-else>{{getBuyerName(scope.row[scope.con.prop])}}</template>
          </template>-->
          <template v-else-if="scope.con.prop=='taskGapNum'">
            <span v-if="parseInt(scope.row['taskGapNum'])<=0">0</span>
            <span v-else>{{scope.row['taskGapNum']}}</span>
          </template>
          <template v-else-if="scope.con.prop=='taskYingYu'">
            <span v-if="parseInt(scope.row['taskGapNum'])>=0">0</span>
            <span v-else>{{scope.row['taskGapNum']*-1}}</span>
          </template>
          <template v-else-if="scope.con.prop=='currDeliveryDetails'">
            <span class="pramary pointer" @click="showRiskStatus( scope.row )">查看详情</span>
          </template>
          <template v-else-if="scope.con.prop=='changeReasons'">
            <template v-if="scope.row.isEdit">
              <el-input v-model="scope.row[scope.con.prop]" placeholder="请输入变更原因"></el-input>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </template>
    </lc-table>
    <!-- 需要废弃 -->
    <sync-import
      ref="syncImport"
      v-model="visibleDialog"
      :params="setInParams"
      :importUrl="importUrl"
      :checkTastStatusUrl="checkImportStatusUrl"
      @taskOk="taskOk"
      @taskFail="taskFail"
      @taskAddSuc="taskAddSuc"
      @taskAddFail="taskAddFail"
    ></sync-import>

    <!-- 文件上传弹框 -->
    <FileImport
      v-if="showFileImport"
      :showFileImport.sync="showFileImport"
      v-bind="uploadOptions"
      @refresh="uploadFileSuccess"
    ></FileImport>

    <purchasing-task-details-dialog
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></purchasing-task-details-dialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Inject, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import syncImport from "@/pages/server/components/syncImport.vue";
import lcCondition from "../../../components/condition.vue";
import lcTable from "../../../components/table";
import API from "../../../API";
import { matchArrItem, isNotEmptyObj } from "../../../utils";
import {
  unStartedPlanDetailsConfig,
  purchasePlanStatus,
  riskLevels,
} from "../const";
import purchasingTaskDetailsDialog from "./purchasingTaskDetailsDialog.vue";
import tablePage from "../public/tablePage";

// 文件上传组件
import FileImport from "./fileImport/index";

@Component( {
  name: "purchasing-plan-details-unstarted-table",
  mixins: [ tablePage ],
  components: {
    lcCondition,
    lcTable,
    purchasingTaskDetailsDialog,
    syncImport,
    FileImport,
  },
} )
export default class purchasingPlan extends Vue {
  @State( ( state ) => state.login.memberId ) memberId;
  @Inject() formatMyDate;
  @Action( "brand/getAllBrands" ) getAllBrands;
  @Prop( { default: "" } ) currentPage: string;
  isNotEmptyObj = isNotEmptyObj;
  tableList: any[] = [];
  importUrl = API.uploadInPlanFile;
  checkImportStatusUrl = API.getJobResult;
  showImportDialog = false;
  fullscreenLoading = false;
  visibleDialog = false;
  get setInParams () {
    return { planId: this.purchasePlanId };
  }
  fileUploadSuc ( data ) {
    this.fullscreenLoading = true;
    setTimeout( () => {
      this.$notify( {
        type: "success",
        message: data.msg || "导入成功",
      } );
      this.fullscreenLoading = false;
      this.search();
      this.$emit( "updatePanelData" );
    }, 3000 );
  }
  fileUploadErr ( data ) {
    this.$notify( {
      type: "error",
      message: data.msg || "导入失败",
    } );
  }

  importTaskInfo = {
    // 异步导入状态
    status: 1,
    jobId: null,
  };

  baseCondition: any[] = [
    { value: "", key: "brandId", label: "品牌", type: "select", options: [] },
    { value: "", key: "lcSkuCode", label: "lc编码", type: "text" },
    { value: "", key: "skuName", label: "名称", type: "text" },
    { value: "", key: "skuSpecification", label: "规格", type: "text" },
    { value: "", key: "storeSkuCode", label: "自有编码", type: "text" },
  ];
  get condition () {
    return this.baseCondition;
  }
  get planDetailsConfig () {
    return unStartedPlanDetailsConfig;
  }
  purchasePlanStatu: number | string;
  purchasePlanId: number | string = -1;

  visibleRiskStatus: boolean = false;
  currRiskLevleSkuId: string = "";
  currRiskLevelLcSkuCode: string = "";

  // 文件上传
  showFileImport: boolean = false;
  // 文件类型
  fileTypes: Array<string> = [ "xlsx", "xls", "csv" ];
  uploadOptions: any = {
    title: "采购计划导入",
    fileTypes: this.fileTypes,
    placeholder: `请选择${this.fileTypes.join( "," )}文件进行上传`,
    tips: `务必使用下载的模板进行数据导入，一次最多导入条6000条。`,
    uploadUrl: "/purchaseTaskMeta/uploadInPlanFile",
    downUrl: "/excel/module/noStartPlan",
    params: { memberId: "" },
    // 表格字段
    tableConfig: [
      { prop: "lcSkuCode", label: "SKU编码", width: "230px" },
      { prop: "deliveryDate", label: "交付日期" },
      { prop: "purchasePlanNum", label: "采购数" },
      { prop: "remark", label: "失败结果" },
    ],
  };
  uploadFileSuccess ( data ) {
    // this.showFileImport = false;
    console.log( "uploadFileSuccess", data );
    // this.refresh();
    // this.shopListData = data;
    // this.changeData();
  }

  setInExcel () {
    this.visibleDialog = true
    // this.showFileImport = true;
    this.importTaskInfo.status = 1;
    this.uploadOptions.params = {
      memberId: this.memberId,
    };
    console.log( "setInExcel:", this.showFileImport );
  }

  created () {
    if ( this.currentPage == "createPurchasingPlan" ) {
      this.purchasePlanStatu = "";
      this.purchasePlanId = -1;
    } else {
      let { status, id: id = -1 } = this.$route.query;
      this.purchasePlanStatu = status;
      this.purchasePlanId = id;
    }

    Promise.resolve( this.getAllBrands() ).then( ( res ) => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) );
    } );
    this.search();
  }

  taskAddSuc ( info ) {
    this.importTaskInfo.status = 2;
    this.importTaskInfo.jobId = info.jobId;
    this.fullscreenLoading = true;
  }
  taskAddFail ( err ) {
    this.importTaskInfo.status = 4;
    this.importTaskInfo.jobId = null;
    this.$message( {
      type: "error",
      message: err.msg,
    } );
  }
  taskOk ( okJobs ) {
    this.importTaskInfo.status = okJobs.exportStatus;
    this.importTaskInfo.jobId = okJobs.jobId;
    this.fullscreenLoading = false;
    this.search();
    this.$emit( "updatePanelData" );
  }
  taskFail ( failJobs ) {
    this.importTaskInfo.status = failJobs.exportStatus;
    this.importTaskInfo.jobId = failJobs.jobId;
    this.fullscreenLoading = false;
  }

  formatOptions () {
    let param: any = {};
    let { num, cur } = this.page;
    let start = num * ( cur - 1 );

    this.condition.forEach( ( v ) => {
      if ( "valueType" in v ) {
        let { value, options } = v;
        options.forEach( ( v ) => {
          param[ v.id ] = +!( value.indexOf( v.id ) > -1 ); // 0 为选中， 1 为未选中
        } );
      } else {
        if ( v.value !== "" ) {
          param[ v.key ] = v.value;
        }
      }
    } );

    return {
      ...param,
      num,
      start,
    };
  }
  filterNotMined ( num ) {
    return num < 0 ? 0 : num;
  }
  getTableList: any[] = [];
  search () {
    this.$permissionValidateWithNotify( 1148 );
    this.$http( API.searchSkuMeta, {
      ...this.formatOptions(),
      purchasePlanId: this.purchasePlanId,
    } )
      .then( ( { data } ) => {
        // this.getTableList = data.data.list;
        // this.tableList = [];
        // // *直接执行下面的$set可能导致tableList有内容为空而报错
        // this.getTableList.forEach( ( item ) => {
        //   this.tableList.push( [] );
        // } );
        // this.getTableList.forEach( async ( v, i ) => {
        //   let item = await this.dealTableBuyerData( v, i );
        //   // *防止异步导致的排序问题
        //   this.$set( this.tableList, i, item );
        // } );
        this.tableList = data.data.list
        this.tableList.forEach( item => {
          this.$set( item, 'isEdit', false )
        } )
        this.page.total = data.data.total || 0;
      } )
      .catch( ( rej ) => {
        this.tableList = [];
        this.page.total = 0;
      } );
  }
  // getBuyerName ( id ) {
  //   let item = !!this.buyerList && this.buyerList.find( ( v ) => v.id == id );
  //   return !!item ? item.loginName : "";
  // }
  async dealTableBuyerData ( v, i ) {
    let { data } = await this.$http( API.getUserByBrandId, {
      brandIds: [ v.brandId ],
    } );
    return {
      ...v,
      isEdit: false,
      buyerList: data.data,
    };
    // this.$http( API.getUserByBrandId, { brandIds: [ v.brandId ] } ).then( ( { data } ) => {
    //   Object.assign( v, {
    //     isEdit: false,
    //     buyerList: data.data
    //   } )
    //   this.tableList.push( v )
    // } )
  }
  curChange ( cur ) {
    this.page.cur = cur;
    this.search();
  }

  showErrorMsg () {
    this.$refs.syncImport && this.$refs.syncImport.showErrDialog();
  }
  setOutExcel () {
    let param = this.formatOptions();
    delete param.num;
    delete param.start;
    this.$submit( API.exportTaskMeta, {
      ...param,
      purchasePlanId: this.purchasePlanId,
    } );
  }
  showRiskStatus ( row ) {
    this.currRiskLevleSkuId = row.skuId + "";
    this.currRiskLevelLcSkuCode = row.lcSkuCode;
    this.visibleRiskStatus = true;
  }
  validateItemInfo ( item ) {
    if ( typeof item.purchaseNum === "string" && item.purchaseNum.trim() == "" ) {
      this.$notify( {
        type: "warning",
        message: "请输入计划采购数",
      } );
      return false;
    }
    if ( !item.deliveryDate.time ) {
      this.$notify( {
        type: "warning",
        message: "请选择交付日期",
      } );
      return false;
    }
    // 推荐跟实际不一样要写原因
    if (
      item.purchaseNum != item.recommendPurchaseNum &&
      item.changeReasons == ""
    ) {
      this.$notify( {
        type: "warning",
        message: "请输入变更原因",
      } );
      return false;
    }
    if ( item.deliveryDate.buyerId == "" ) {
      this.$notify( {
        type: "warning",
        message: "请选择买手",
      } );
      return false;
    }
    return true;
  }
  saveEditorPlanData ( item ) {
    if ( !this.validateItemInfo( item ) ) {
      return;
    }
    item.isEdit = false;
    let { id, deliveryDate, buyerId, purchaseNum, changeReasons } = item;
    this.$http( API.updateTaskMeta, {
      id,
      buyerId,
      purchaseNum: +purchaseNum,
      changeReasons,
      deliveryDate: this.formatMyDate( deliveryDate.time, "yyyy/MM/dd" ),
    } ).then( ( { data } ) => {
      this.$notify( {
        type: "success",
        message: data.msg || "保存成功",
      } );
    } );
  }
}
</script>
<style lang='stylus' rel="stylesheet/stylus" scoped>
.flex
  display flex
  justify-content center
  align-items center
.purchasing-plan-details-ongoing
  .ongoing-panel-content
    @extend .flex
    justify-content flex-start
  .ongoing-panel-details
    padding-left 20px
.ongoing-panel-purchases-number
  @extend .flex
  .purchases-number
    margin-right 10px
</style>


