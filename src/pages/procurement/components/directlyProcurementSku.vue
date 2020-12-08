<template>
  <div class="directly-procurement-sku">
    <div class="product-detail">
      <h4>采购商品明细</h4>
    </div>
    <create-result-delivery :data="selectedData" :is-directly="true"></create-result-delivery>
    <lc-table-config :base-config="directlyProcurementConfig" @set-config="setDirectlySkuConf"></lc-table-config>
    <lc-table
      :config="baseConfig"
      :data="formatData"
      @cur-change="curChange"
      :page="page"
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
        <template v-else-if="scope.con.prop=='control' ">
          <el-button type="text" @click="delSku(scope.row.lcSkuCode)">删除</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table/index'
import lcTableConfig from "../../../components/table/control.vue"
import CreateResultDelivery from './createResultDelivery.vue'
import { State, Mutation, Getter, Action } from 'vuex-class'
import { skuLableTypes } from '../../product/const/'

@Component( {
  name: 'directly-procurement-sku',
  components: {
    lcTable,
    lcTableConfig,
    CreateResultDelivery
  }
} )
export default class CreateProcurementResult extends Vue {
  @State( state => state.procurement.directlySkuMap ) directlySkuMap
  @Getter( 'procurement/directlySkuList' ) directlySkuList
  // @Getter( 'procurement/directlyProcurementConfig' ) directlyProcurementConfig
  @Getter( 'procurement/procurementCreateConfig' ) directlyProcurementConfig
  @Mutation( 'procurement/delDirectlySku' ) delDirectlySku
  @Mutation( 'procurement/setDirectlySkuConf' ) setDirectlySkuConf
  @Prop( { default: true } ) isEdit: boolean

  selectedData: any[] = []
  skuLableTypes = skuLableTypes

  get baseConfig () {
    return this.directlyProcurementConfig.filter( v => v.isChecked )
  }

  get formatData () {
    let num = this.page.num
    let start = ( this.page.cur - 1 ) * num
    this.page.total = this.directlySkuList.length
    return this.directlySkuList.slice( start, start + num )
  }

  page = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 50, 100, 200 ]
  }
  curChange ( cur ) {
    this.page.cur = cur
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
  }

  toFixed ( n = 0 ) {
    if ( +n ) {
      return ( +n ).toFixed( 2 )
    }
    return n
  }

  delSku ( lcSkuCode ) {
    this.delDirectlySku( lcSkuCode )
  }

  selectionChange ( v ) {
    this.selectedData = v
  }

  skuLabelChange ( row ) {
    if ( row.skuLabel === 0 ) {
      row.price = row.price === 0 ? 0.01 : row.price
    }
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
}
</script>
<style lang="stylus">
.directly-procurement-sku
  table
    width 100% !important
  .el-table--hidden
    visibility visible !important
</style>
