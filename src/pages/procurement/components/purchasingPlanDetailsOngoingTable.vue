<template>
  <div class="purchasing-plan-details-ongoing-table">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button
          type="primary"
          size="small"
          @click="setInExcel"
          v-if="$permissionValidateWithEnv(1156, 1146)"
        >导入Excel</el-button>
        <el-button
          type="primary"
          size="small"
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
      :loading="fullTableLoading"
      :loading-text="loadingText"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <template>
          <template v-if="scope.con.prop=='purchasePlanNum'">
            <div class="ongoing-panel-purchases-number" style="height: 38px;">
              <span class="purchases-number">{{scope.row[scope.con.prop]}}</span>
              <proportion-img
                class="proportion-img-intable"
                :config="scope.row['puchasingNumDetailData']"
                style="width: 300px;"
              ></proportion-img>
            </div>
          </template>
          <template v-else-if="scope.con.prop=='currDeliveryDetails'">
            <template>
              <span class="pramary pointer" @click="showRiskStatus( scope.row )">查看详情</span>
            </template>
          </template>
          <template v-else-if="scope.con.prop=='deliveryResult'">
            <template>
              <span
                class="no-risk"
                :class="{'has-risk': scope.row['riskLevel'] == 1 || scope.row['riskLevel'] == 2}"
              >{{formatRiskLevel(scope.row['riskLevel'])}}</span>
            </template>
          </template>
          <template
            v-else-if="scope.con.prop==='goodLabel'"
          >{{formatLabel(scope.row[scope.con.prop])}}</template>
          <template v-else-if="scope.con.prop=='control'">
            <template>
              <el-button type="text" @click="deletePlan(scope.row)">删除</el-button>
            </template>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </template>
    </lc-table>
    <import-excel
      :url="importUrl"
      title="导入"
      :params="setInParams"
      v-model="showImportDialog"
      @file-upload-suc="fileUploadSuc"
      @file-upload-err="fileUploadErr"
    ></import-excel>
    <purchasing-task-details-dialog
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></purchasing-task-details-dialog>
    <!-- 文件上传弹框 -->
    <!-- <FileImport
      v-if="showImportDialog"
      :showFileImport.sync="showImportDialog"
      v-bind="uploadOptions"
      @refresh="uploadFileSuccess"
    ></FileImport>-->
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import importExcel from '@/components/importExcel.vue'
import { goodLabels } from '@/pages/product/const'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table'
import proportionImg from './proportionImg.vue'
import purchasingTaskDetailsDialog from './purchasingTaskDetailsDialog.vue'
// 文件上传组件
import FileImport from "./fileImport/index";
import API from '../../../API'
import { matchArrItem, isNotEmptyObj } from '../../../utils'
import { ongoingPlanDetailsConfig, purchasePlanStatus, riskLevels } from '../const'
import tablePage from "../public/tablePage";

@Component( {
  name: 'purchasing-plan-details-ongoing-table',
  mixins: [ tablePage ],
  components: {
    lcCondition,
    lcTable,
    proportionImg,
    importExcel,
    purchasingTaskDetailsDialog,
    FileImport
  }
} )
export default class purchasingPlanDetailsOngoingTable extends Vue {
  @Inject() formatMyDate
  @Action( "brand/getAllBrands" ) getAllBrands
  isNotEmptyObj = isNotEmptyObj
  tableList: any[] = []
  riskLevel: number = 1
  visibleRiskStatus: boolean = false
  currRiskLevleSkuId: string = ''
  currRiskLevelLcSkuCode: string = ''

  baseCondition: any[] = [
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: [] },
    { value: '', key: 'lcSkuCode', label: 'lc编码', type: 'text' },
    { value: '', key: 'skuName', label: '名称', type: 'text' },
    { value: '', key: 'skuSpecification', label: '规格', type: 'text' },
    { value: '', key: 'storeSkuCode', label: '自有编码', type: 'text' }
  ]
  ongoingCondition: any[] = [
    ...this.baseCondition,
    { value: '', key: 'goodLabel', label: '商品标签', type: 'select', col: { lg: 8, sm: 8 }, options: goodLabels },
    {
      value: [], key: 'riskLevels', label: '交付风险', type: 'select', multiple: true,
      options: [
        { id: '1', name: '仅显示交付不足风险' },
        { id: '2', name: '仅显示交付延期风险' },
        { id: '3', name: '仅显示无交付风险' }
      ],
      col: { lg: 8, sm: 8 }
    }
  ]
  // 文件类型
  fileTypes: Array<string> = [ "xlsx", "xls", "csv" ];
  uploadOptions: any = {
    title: "采购计划详情导入",
    fileTypes: this.fileTypes,
    placeholder: `请选择${this.fileTypes.join( "," )}文件进行上传`,
    tips: `务必使用下载的模板进行数据导入，一次最多导入条6000条。`,
    uploadUrl: "",
    downUrl: "/excel/module/brandbuyer",
    params: { memberId: "" },
    // 表格字段
    tableConfig: [
      {
        label: "品牌",
        prop: "name"
      },
      {
        label: "采购员",
        prop: "buyerName"
      },
      {
        label: "失败结果",
        prop: "remark"
      }
    ]
  }
  importUrl = API.uploadOutPlanFile
  showImportDialog = false
  fullTableLoading = false
  loadingText = ''
  get setInParams () {
    return { planId: this.purchasePlanId }
  }
  fileUploadSuc ( data ) {
    this.fullTableLoading = true
    this.loadingText = '导入中，请稍后'
    setTimeout( () => {
      this.$notify( {
        type: 'success',
        message: data.msg || '导入成功'
      } )
      this.fullTableLoading = false
      this.loadingText = ''
      this.search()
      this.$emit( 'updatePanelData' )
    }, 15000 )
  }
  fileUploadErr ( data ) {
    this.$notify( {
      type: 'error',
      message: data.msg || '导入失败'
    } )
  }
  get condition () {
    return this.ongoingCondition
  }
  get planDetailsConfig () {
    return ongoingPlanDetailsConfig
  }
  purchasePlanStatu: number | string
  purchasePlanId: number | string
  created () {
    let { status, id } = this.$route.query
    this.purchasePlanStatu = status
    this.purchasePlanId = id
    Promise.resolve( this.getAllBrands() ).then( res => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) )
    } )
    this.search()
  }
  formatePlanTime ( time ) {
    return this.formatMyDate( time, 'yyyy/MM/dd hh:mm' )
  }
  compuCutOffTime ( endtime ) {
    let curTime = Date.now()
    let timeDiff = endtime - curTime
    let day = Math.floor( timeDiff / ( 24 * 3600 * 1000 ) )
    let hours = Math.floor( ( timeDiff % ( 24 * 3600 * 1000 ) ) / ( 3600 * 1000 ) )
    return `${day}天${hours}小时`
  }
  formatOptions () {
    let param: any = {}
    let { num, cur } = this.page
    let start = num * ( cur - 1 )

    this.condition.forEach( v => {
      if ( 'valueType' in v ) {
        let { value, options } = v
        options.forEach( v => {
          param[ v.id ] = +!( value.indexOf( v.id ) > -1 ) // 0 为选中， 1 为未选中
        } )
      } else {
        if ( v.value !== '' ) {
          param[ v.key ] = v.value
        }
      }
    } )

    return {
      ...param,
      num,
      start,
    }
  }
  filterNotMined ( num ) {
    return num < 0 ? 0 : num
  }
  getProportionImgConfig ( v ) {
    let { storedNum = 0, onWayNum = 0, purchasePlanNum, notMined = this.filterNotMined( +purchasePlanNum - +storedNum - +onWayNum ) } = v
    return [ {
      content: `已交付：`,
      bgColor: '#008000',
      number: storedNum
    }, {
      content: `交付中：`,
      bgColor: '#FF9900',
      number: onWayNum
    }, {
      content: `未采：`,
      bgColor: '#F40000',
      number: notMined
    } ]
  }
  search () {
    this.$permissionValidateWithNotify( 1148 )
    let param = { ...this.formatOptions(), purchasePlanId: +this.purchasePlanId }
    delete param.riskLevel
    this.$http( API.searchPlanSkuSum, param ).then( ( { data } ) => {
      let d = data.data || {}
      this.tableList = d.list && d.list.map( ( v, i, arr ) => ( {
        ...v,
        puchasingNumDetailData: this.getProportionImgConfig( v )
      } ) )
      this.page.total = d.total || 0
    } ).catch( rej => {
      this.page.total = 0
    } )
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  formatRiskLevel ( level ) {
    return matchArrItem( +level, riskLevels, 'id' ).name
  }
  formatLabel ( goodLabel ) {
    return matchArrItem( goodLabel, goodLabels, 'id' ).name
  }
  showRiskStatus ( row ) {

    this.currRiskLevleSkuId = row.skuId + ''
    this.currRiskLevelLcSkuCode = row.lcSkuCode
    this.visibleRiskStatus = true
  }
  deletePlan ( item ) {
    const h = this.$createElement;
    this.$msgbox( {
      title: "提示",
      message: h( 'p', null, [
        h( 'h4', null, '是否确认删除?' ),
        h( 'p', { style: 'margin-top: 8px' }, '订购任务不可删除，需在1分钟后刷新页面查看删除结果' )
      ] ),
      showCancelButton: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.delPlanSkuSum, { id: item.id } )
        .then( ( { data } ) => {
          // this.fullTableLoading = true
          // this.loadingText = "删除中，请稍后"
          // setTimeout( () => {
          //   this.$notify( {
          //     type: "success",
          //     message: data.msg || "删除采购详情成功"
          //   } );
          //   this.fullTableLoading = false
          //   this.loadingText = ""
          //   this.search()
          // }, 15000 )
        } )
        .catch( ( { err } ) => {
          this.$notify( {
            type: "success",
            message: err.msg || "删除采购详情失败"
          } );
        } );
    } );
  }
  setInExcel () {
    this.showImportDialog = true
  }
  setOutExcel () {
    let param = this.formatOptions()
    delete param.num
    delete param.start
    this.$submit( API.exportPlanSkuSum, {
      ...param,
      purchasePlanId: this.purchasePlanId,
    } )
  }
  uploadFileSuccess () { }
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
    display inline-block
    width 45px
    text-align right
    margin-right 10px
.no-risk
  color #008000
.has-risk
  color #FF0000
</style>


