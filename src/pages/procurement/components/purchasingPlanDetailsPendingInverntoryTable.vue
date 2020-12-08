<template>
  <div class="purchasing-plan-details-pending-inverntory">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <!-- <el-button
          type="primary"
          size="small"
          @click="setInExcel"
          v-if="purchasePlanStatu ===3 && $permissionValidateWithEnv(1156, 1146)"
        >导入Excel</el-button>-->
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
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <template v-if=" scope.con.prop=='control' && purchasePlanStatu == 3">
          <template v-if="scope.row.isPending">
            <el-button type="text" @click="pendingTableItem(scope.row)">确认</el-button>
            <el-button type="text" @click="scope.row.isPending = false">取消</el-button>
          </template>
          <template v-else>
            <el-button
              type="text"
              v-if="scope.row['status'] == 2"
              @click="scope.row.isPending = true"
            >已盘点</el-button>
            <el-button type="text" @click="scope.row.isPending = true" v-else>盘点</el-button>
          </template>
        </template>
        <template v-else-if="scope.con.prop=='inventoryRemarks'">
          <template v-if="scope.row.isPending">
            <el-input v-model="scope.row[scope.con.prop]" placeholder="请输入原因"></el-input>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
        <template v-else-if="scope.con.prop=='currDeliveryDetails'">
          <template>
            <span class="pramary pointer" @click="showRiskStatus( scope.row )">查看快照</span>
          </template>
        </template>
        <template v-else-if="scope.con.prop == 'deliveryResult'">
          <span
            class="no-risk"
            :class="{'has-risk': scope.row[scope.con.prop] <= 2, 'has-overdose-risk': scope.row[scope.con.prop] == 3}"
          >{{ formatRiskLevel( scope.row[scope.con.prop] ) }}</span>
          <!-- <span style="cursor: pointer" class="pramary">查看快照</span> -->
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <purchasing-plan-details-dialog
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :purchase-plan-id="purchasePlanId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></purchasing-plan-details-dialog>
    <!-- 文件上传弹框 -->
    <FileImport
      v-if="showImportDialog"
      :showFileImport.sync="showImportDialog"
      v-bind="uploadOptions"
      @refresh="uploadFileSuccess"
    ></FileImport>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table'
import proportionImg from './proportionImg.vue'
import purchasingPlanDetailsDialog from './purchasingPlanDetailsDialog.vue'
import API from '../../../API'
import { matchArrItem, isNotEmptyObj } from '../../../utils'
import { endPlanDetailsConfig, purchasePlanStatus, deliveryResults } from '../const'
// 文件上传组件
import FileImport from "./fileImport/index";
import tablePage from "../public/tablePage";
import props from './fileImport/props'

@Component( {
  name: 'purchasing-plan-details-pending-inverntory',
  mixins: [ tablePage ],
  components: {
    lcCondition,
    lcTable,
    proportionImg,
    purchasingPlanDetailsDialog,
    FileImport
  }
} )
export default class purchasingPlanDetailsPendingInverntoryTable extends Vue {
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
    { value: undefined, key: 'lcSkuCode', label: 'lc编码', type: 'text' },
    { value: undefined, key: 'skuName', label: '名称', type: 'text' },
    { value: undefined, key: 'skuSpecification', label: '规格', type: 'text' },
    { value: undefined, key: 'storeSkuCode', label: '自有编码', type: 'text' }
  ]
  pendingAndEndcondition: any[] = [
    ...this.baseCondition,
    {
      value: [], key: 'deliveryResults', label: '交付结果', type: 'select', multiple: true,
      options: [
        { id: '1', name: '交付不足' },
        { id: '2', name: '交付延期' },
        { id: '3', name: '交付过量' },
        { id: '4', name: '完成交付' }
      ]
    }
  ]
  showImportDialog = false
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
        label: "SKU编码",
        prop: "name"
      },
      {
        label: "盘点原因",
        prop: "buyerName"
      },
      {
        label: "失败结果",
        prop: "remark"
      }
    ]
  }
  get condition () {
    return this.pendingAndEndcondition
  }
  pendingPlanDetailsConfig = [
    ...endPlanDetailsConfig,
    { prop: 'control', label: '操作', width: '120px' }
  ]
  get planDetailsConfig () {
    if ( this.purchasePlanStatu == 3 ) {
      return this.pendingPlanDetailsConfig
    } else {
      return endPlanDetailsConfig
    }
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
  formatRiskLevel ( level ) {
    return matchArrItem( +level, deliveryResults, 'id' ).name
  }
  formatePlanTime ( time ) {
    return this.formatMyDate( time, 'yyyy/MM/dd hh:mm' )
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
  search () {
    this.$permissionValidateWithNotify( 1148 )
    this.$http( API.searchPlanSkuSumSnapshot, { ...this.formatOptions(), purchasePlanId: +this.purchasePlanId, status: +this.purchasePlanStatu } ).then( ( { data } ) => {
      let d = data.data || {}
      this.tableList = ( d.list || [] ).map( v => {
        let result = {
          ...v,
          isPending: false
        }
        return result
      } )
      this.page.total = d.total || 0
    } ).catch( rej => {
      this.tableList = []
      this.page.total = 0
    } )
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  pendingTableItem ( item ) {
    if ( typeof item.inventoryRemarks === "string" && item.inventoryRemarks.trim() == '' ) {
      this.$notify( {
        type: 'warning',
        message: '请输入盘点原因'
      } )
      return false
    }
    item.isPending = false
    this.$http( API.updatePlanSkuSumSnapshot, {
      inventoryRemarks: item.inventoryRemarks,
      id: item.id,
      status: 2
    } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: data.msg || '成功'
      } )
      this.search()
    } ).catch( ( { data: err } ) => {
      this.$notify( {
        type: 'error',
        message: err.msg || '失败'
      } )
    } )
  }
  showRiskStatus ( row ) {
    this.currRiskLevleSkuId = row.skuId + ''
    this.currRiskLevelLcSkuCode = row.lcSkuCode
    this.visibleRiskStatus = true
  }
  setInExcel () {
    this.showImportDialog = true
  }
  setOutExcel () {
    let param = this.formatOptions()
    delete param.num
    delete param.start
    this.$submit( API.exportPlanSkuSumSnapshot, {
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
    margin-right 10px
.no-risk
  color #008000
.has-risk
  color #FF0000
.has-overdose-risk
  color #FF6600
</style>


