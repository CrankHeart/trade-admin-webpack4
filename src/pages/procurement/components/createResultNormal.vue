<template>
  <div class="procurement-create-result-normal">
    <div class="product-detail">
      <h4>采购商品明细</h4>
    </div>
    <create-result-delivery :data="selectedData"></create-result-delivery>
    <div style="text-align:right;margin-bottom:10px">
      <el-button type="primary" @click="importPro" v-if="$permissionValidateWithEnv(1159,1157)">导入</el-button>
      <el-button type="primary" @click="myExport" v-if="$permissionValidateWithEnv(624,624)">导出</el-button>
    </div>
    <lc-table-config :base-config="baseConfig" @set-config="setCreateTableConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="formatData"
      @cur-change="curChange"
      :page="page"
      :key="timestampId"
      :selection="true"
      @data-selection-change="selectionChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='lable'">{{scope.row.lable=='常备商品'?'是':'否'}}</template>
        <template
          v-else-if="scope.con.prop=='salesStatus'"
        >{{formatGoodStatuses(scope.row.salesStatus)}}</template>
        <template v-else-if="scope.con.prop=='skuLabel'">
          <el-select
            @change="skuLabelChange(scope.row)"
            v-model="scope.row.skuLabel"
            placeholder="请选择"
            clearable
            filterable
          >
            <el-option
              v-for="item in skuLableTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="scope.con.prop=='price'">
          <el-input-number v-model="scope.row.price" :min="0"></el-input-number>
        </template>
        <!-- 优惠总额 -->
        <template v-else-if="scope.con.prop=='skuDiscountAmount'">
          <el-input-number
            v-model="scope.row.skuDiscountAmount"
            :min="0"
            :max="parseFloat(scope.row.supplyNum * scope.row.price)"
          ></el-input-number>
        </template>
        <!-- 优惠单价 -->
        <template v-else-if="scope.con.prop=='skuDiscountPrice'">{{skuDiscountPriceFun(scope.row)}}</template>
        <!-- 实付金额 -->
        <template v-else-if="scope.con.prop=='pay_amount'">{{pay_amountFun(scope.row)}}</template>
        <template v-else-if="scope.con.prop=='supplyNum'">
          <el-input-number v-model="scope.row.supplyNum" size="small" :min="0"></el-input-number>
        </template>
        <template v-else-if="scope.con.prop=='taxPoint'">
          <el-input-number v-model="scope.row.taxPoint" size="small" :min="0"></el-input-number>
        </template>
        <template v-else-if="scope.con.prop=='goodsAmount'">{{goodsAmountFun(scope.row)}}</template>
        <!-- isLessGoods 是否缺货采购 -->
        <!-- <template v-else-if="scope.con.prop=='isLessGoods'">
          {{scope.row.supplyNum > scope.row.number ? '是' : '否' }}
        </template>-->
        <template v-else-if="scope.con.prop=='remark'">
          <el-input type="text" v-model="scope.row.remark" placeholder="填写备注"></el-input>
        </template>
        <template v-else-if="scope.con.prop=='deliveryDate'">
          <el-date-picker
            :editable="false"
            v-model="scope.row.deliveryDate"
            type="date"
            placeholder="选择日期"
          ></el-date-picker>
        </template>
        <template v-else-if="scope.con.prop=='control'">
          <el-button size="mini" type="danger" @click="delSelectedRow(scope.$index,scope.row)">删除</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>

    <import-excel
      :url="importUrl"
      title="采购单导入"
      v-model="showImportDialog"
      @file-upload-suc="fileUploadSuc"
      @file-upload-err="fileUploadErr"
    ></import-excel>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import { State, Mutation, Getter } from 'vuex-class'
import API from '@/API'
import importExcel from '@/components/importExcel.vue'
import lcTable from '../../../components/table'
import lcTableConfig from "../../../components/table/control.vue"
import CreateResultDelivery from './createResultDelivery.vue'
import { goodStatuses, skuLableTypes } from '../../product/const/'
import { matchArrItem } from '../../../utils/'


@Component( {
  name: 'procurement-create-result-normal',
  components: {
    lcTable,
    lcTableConfig,
    CreateResultDelivery,
    importExcel
  }
} )
export default class ProcurementCreateResultNormal extends Vue {
  @Getter( 'procurement/procurementCreateConfig' ) baseConfig
  @State( state => state.procurement.commonSkuList ) commonSkuList
  @Mutation( 'procurement/delCommonSkuList' ) delCommonSkuList
  @Mutation( 'procurement/delCommonSkuListByIndex' ) delCommonSkuListByIndex
  @Mutation( 'procurement/setCreateTableConf' ) setCreateTableConf
  @Mutation( 'procurement/addCommonSkuListByImport' ) addCommonSkuListByImport

  selectedData: any[] = []
  deliveryDate: any = ''
  page = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 50, 100, 200 ]
  }
  timestampId: number = null
  dialogVisible: boolean = false
  skuLableTypes = skuLableTypes

  importUrl = API.importProcurement
  showImportDialog = false
  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  get procurementSn () {
    let sn = this.$route.params.procurementSn || ''
    return sn
  }
  // 分页数据
  get formatData () {
    let { num, cur } = this.page
    let start = ( cur - 1 ) * num
    this.page.total = this.commonSkuList.length
    return this.commonSkuList.slice( start, start + num ) || []
  }
  created () {
    this.baseConfig.forEach( element => {
      element.isChecked = true
    } );
  }
  activated () {
    this.timestampId = new Date().getTime()
  }

  skuDiscountPriceFun ( record ) {
    if ( record.skuDiscountAmount > 0 && record.supplyNum > 0 ) {
      let val = record.skuDiscountAmount / record.supplyNum
      return val.toFixed( 2 )
    }
    return '0.00'
  }
  goodsAmountFun ( record ) {
    if ( record.supplyNum > 0 && record.price > 0 ) {
      let val = record.supplyNum * record.price
      return val.toFixed( 2 )
    }
    return '0.00'
  }
  pay_amountFun ( record ) {
    let total = parseFloat( this.goodsAmountFun( record ) )
    if ( total > 0 ) {
      let val = total - ( record.skuDiscountAmount || 0 )
      return val.toFixed( 2 )
    }
    return '0.00'
  }

  skuLabelChange ( row ) {
    if ( row.skuLabel === 0 ) {
      row.price = row.price === 0 ? 0.01 : row.price
    }
  }

  formatGoodStatuses ( id ) {
    return matchArrItem( id, goodStatuses, 'id' ).name
  }

  curChange ( cur ) {
    this.page.cur = cur
  }

  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
  }

  selectionChange ( v ) {
    this.selectedData = v
  }

  delSelectedRow ( index, row ) {
    this.$confirm( `确定删除吗`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    } ).then( () => {
      // let { lcSkuCode = '' } = row
      // this.delCommonSkuList( lcSkuCode )
      let { num, cur } = this.page
      let start = ( cur - 1 ) * num + index
      this.delCommonSkuListByIndex( start )
    } )
  }

  importPro () {
    // this.dialogVisible = true
    this.showImportDialog = true
  }

  myExport () {
    this.$submit( API.exportProcurement, {
      procurementSn: this.procurementSn
    } )
  }

  mergeData ( data ) {
    let items = data.items || [];
    let skus = data.detail || [];
    skus.map( ( sku ) => {
      let item = items[ sku.lcSkuCode ] || {}
      Object.assign( sku, { price: item.price, deliveryDate: item.deliveryDate, supplyNum: item.quantity, amount: item.amount } )
    } )
  }

  addCallback ( data ) {
    let lists = data.data
    this.mergeData( lists )
    let { discount, freight, detail, supplierId, supplierName } = lists
    this.addCommonSkuListByImport( detail )
  }

  fileUploadSuc ( data ) {
    let lists = data.data
    let allSize = Object.keys( lists.items ).length // 总的导入数量
    let successSize = lists.detail.length  // 成功导入的数量
    this.mergeData( lists )
    let { discount, freight, detail, supplierId, supplierName } = lists
    this.addCommonSkuListByImport( detail )
    this.$emit( 'add-callback', { discount, freight, supplierId, supplierName } )
    this.$message( {
      title: '导入成功',
      message: `总导入${allSize}条,导入成功${successSize}条`,
      type: allSize === successSize ? 'success' : 'warning',
      showClose: true,
      duration: 5000
    } )
  }

  fileUploadErr ( data ) {
    this.$message( {
      title: '导入失败',
      message: `${data.msg || '未知错误'}`,
      type: 'warning',
      showClose: true,
      duration: 5000
    } )
  }
}
</script>

<style lang="stylus" scoped >
.deliveryDate
  text-align right
</style>
