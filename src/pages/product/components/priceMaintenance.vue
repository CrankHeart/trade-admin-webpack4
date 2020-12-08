<template>
  <div id="price-maintenance" style="min-height: 550px">
    <lc-title text="商品价格维护" class="clearfix">
      <sync-imp-exp :params="params" @update-table-list="search"></sync-imp-exp>
    </lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table-config :base-config="baseConfig" @set-config="setPriceMaintenanceConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="tableDataList"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control'">
          <el-button
            v-if="$permissionValidateWithEnv(1257, 1253)"
            size="small"
            type="text"
            @click="editCommodityPrice(scope.row)"
          >编辑</el-button>
          <el-button v-if="$permissionValidateWithEnv(1258, 1254)" size="small" type="text">日志</el-button>
        </template>
        <template
          v-else-if="['skuType', 'goodStatus'].includes(scope.con.prop)"
        >{{scope.row[scope.con.prop] | formatId2Name(scope.con.prop, vm)}}</template>
        <template
          v-else-if="scope.con.prop === 'profitFactor'"
        >{{ formatPricingTypes(scope.row['pricingType'])}}&nbsp;&nbsp;{{scope.row[scope.con.prop]}}%</template>
        <template
          v-else-if="['purchasePrice', 'settlePrice', 'factorySettlePrice', 'bottomPrice', 'platformPrice', 'factoryLimitedPrice', 'factorySalesPrice', 'level0Price', 'level1Price', 'level2Price'].includes(scope.con.prop)"
        >{{scope.row[scope.con.prop] | fixed2(null)}}</template>
        <template
          v-else-if="scope.con.prop === 'regionalGuidancePrice' && $permissionValidateWithEnv(1256, 1252)"
        >
          <el-button type="text" @click="seeGuidePrice(scope.row)">查看</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <commodity-price
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      @update-table-list="search"
      :data="curItem"
    ></commodity-price>
    <guide-price v-model="guideDialogVisible" :data="curItem"></guide-price>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class"
import API from "../../../API"
import lcTitle from "../../../components/title.vue"
import lcCondition from "../../../components/condition.vue"
import lcTable from "../../../components/table/index"
import lcTableConfig from "../../../components/table/control.vue"
import commodityPrice from "./commodityPriceDialog.vue"
import guidePrice from "./guidePriceDialog.vue"
import syncImpExp from "./syncImpExp.vue"
import { matchArrItem } from '../../../utils'
import { goodStatuses, skuTypes, PricingTypes } from '../const'

@Component( {
  name: "price-maintenance",
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig,
    commodityPrice,
    syncImpExp,
    guidePrice
  },
  filters: {
    formatId2Name ( id, key, _this ) {
      let types
      switch ( key ) {
        case 'skuType':
          types = _this.skuTypes
          break;
        case 'goodStatus':
          types = _this.goodStatus
          break;
        default:
          types = _this.pricingTypes
          break;
      }
      return matchArrItem( id, types, 'id' ).name
    }
  }
} )
export default class ProductMaintenance extends Vue {
  @Mutation( "product/setPriceMaintenanceConf" ) setPriceMaintenanceConf
  @Getter( "product/priceMaintenanceConfig" ) baseConfig
  condition: any[] = [
    { value: undefined, key: 'lcSkuCode', label: 'SKU编码', type: 'text' },
    { value: undefined, key: 'lcSpuCode', label: 'SPU编码', type: 'text' },
    { value: undefined, key: 'name', label: '商品名称', type: 'text' },
    { value: undefined, key: "goodStatus", label: "状态", type: "radio", options: this.goodStatus },
    { value: undefined, key: "skuType", label: "sku类型", type: "radio", options: this.skuTypes },
    { value: undefined, key: "pricingType", label: "定价类型", type: "radio", options: PricingTypes }
  ]
  tableDataList = []
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  // 编辑
  editDialogVisible = false
  guideDialogVisible = false
  vm = this
  params: any = {}
  curItem: any = {}
  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  get goodStatus () {
    return goodStatuses.filter( item => item.id !== 2 )
  }
  get skuTypes () {
    // return skuTypes.filter( item => ( [ 4, 1, 3 ] as any ).includes( item.id ) )
    return skuTypes
  }
  get pricingTypes () {
    return PricingTypes
  }
  formatPricingTypes ( id ) {
    return matchArrItem( id, PricingTypes, 'id' ).name.replace( '类', '' )
  }
  activated () {
    this.search()
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  formatParam () {
    let { num, cur } = this.page
    let params: any = {
      start: ( cur - 1 ) * num,
      num: num
    }
    this.condition.forEach( con => {
      if ( con.value !== undefined && con.value !== '' ) {
        params[ con.key ] = con.value
      }
    } )
    return params
  }
  search () {
    this.$permissionValidateWithNotifyEnv( 1255, 1251 )
    this.params = this.formatParam()
    this.$http( API.getProductSkuList4Console, { ...this.params } ).then( ( { data } ) => {
      const { list, total } = data
      this.tableDataList = list
      this.page.total = total
    } )
  }
  editCommodityPrice ( row ) {
    this.curItem = row
    this.editDialogVisible = true
  }
  seeGuidePrice ( row ) {
    this.curItem = row
    this.guideDialogVisible = true
  }

}

</script>

