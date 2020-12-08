<template>
  <div class="refill-common-sku">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table-config :base-config="procurementSkuConfig" @set-config="setProcurementConf"></lc-table-config>
    <lc-table
      ref="skuTable"
      class="table-margin"
      :scroll-options="{offset: -350}"
      :config="baseConfig"
      :data="tableList"
      :page="page"
      :key="baseConfig.length"
      :selection="true"
      @data-selection-change="selectionChange"
      @cur-change="curChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='control'">
          <el-button
            v-if="scope.row.isAdded"
            size="mini"
            type="danger"
            @click="delRefillSkuListItem(scope.row)"
          >移除</el-button>
          <el-button v-else size="mini" type="primary" @click="addRefillSkuListItem(scope.row)">添加</el-button>
        </template>
        <template
          v-else-if="scope.con.prop=='goodLable'"
        >{{ formatGoodsLabel( scope.row.goodLable ) }}</template>
        <template
          v-else-if="scope.con.prop=='salesStatus'"
        >{{ formatSalesStatus( scope.row.salesStatus ) }}</template>
        <template
          v-else-if="scope.con.prop=='supplierName'"
          :filters="supplierNameFilter"
          :filter-method="filterBySupplierName"
          filter-placement="bottom-end"
        >
          <span class="pointer" @click="showSupplierDialog(scope.$index)">
            <a v-if="scope.row.supplierName.length > 0">{{scope.row.supplierName}}</a>
            <el-button type="primary" size="mini" v-else>选择供应商</el-button>
          </span>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>

    <procurement-supplier
      v-model="visibleSupplierDialog"
      :lc-sku-code="currSkuGoods.lcSkuCode"
      :curr-supplier="currSupplierName"
      @finish="changeCurrSupplier"
    ></procurement-supplier>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcTable from '../../../components/table/'
import lcTableConfig from "../../../components/table/control.vue"
import lcCondition from '../../../components/condition.vue'
import ProcurementSupplier from './procurementSupplier.vue'
import API from '../../../API'
import { salesStatus, goodsLabel } from '../const'
import refillGoods from '../mixins/refillGoods'

@Component( {
  name: 'refill-common-sku',
  components: {
    lcTable,
    lcTableConfig,
    lcCondition,
    ProcurementSupplier
  },
  mixins: [ refillGoods ]
} )
export default class refillCommonSku extends Vue {
  @State( state => state.procurement.commonSkuList ) commonSkuList
  @State( state => state.procurement.skuSupplierRelation ) skuSupplierRelation
  @State( state => state.procurement.commonSelectedSkuList ) commonSelectedSkuList
  @Getter( 'procurement/procurementSkuConfig' ) procurementSkuConfig
  @Mutation( 'procurement/setCommonSelectedSkuList' ) setCommonSelectedSkuList
  @Mutation( 'procurement/delSkuSupplierRelation' ) delSkuSupplierRelation
  @Mutation( 'procurement/setProcurementConf' ) setProcurementConf
  @Action( "brand/getAllBrands" ) getAllBrands
  @Inject() formatMyDate

  tableList: any[] = []
  // currSkuGoods: any = {}
  // visibleSupplierDialog: boolean = false
  page = {
    num: 10,
    cur: 1,
    total: 0
  }
  condition: any[] = [
    // { value: '', key: 'suppliers', label: '首选供应商', type: '', options: [] },
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: [] },
    { value: '', key: 'lcSkuCode', label: 'lc编码', type: 'text' },
    { value: '', key: 'skuName', label: '名称', type: 'text' },
    { value: '', key: 'skuSpecification', label: '规格', type: 'text' },
    { value: '', key: 'storeSkuCode', label: '自有编码', type: 'text' },
    {
      value: [], key: 'status', label: '状态', type: 'checkbox',
      col: { lg: 24, sm: 24 },
      valueType: 'array',
      options: [
        { id: 'preferredGoodsLess', name: '常备商品紧急缺货' },
        { id: 'preferredGoodsSafety', name: '常备商品安全补货' },
        { id: 'preferredGoodsAdd', name: '常备商品日常补货' },
        // { id: 'nonPreferredGoodsAdd', name: '非常备商品订购' },
        { id: 'ignoreOnWay', name: '忽略在途且不缺货商品' }
      ]
    },
  ]

  get baseConfig () {
    let con: any = { prop: 'supplierName', label: '供应商', width: '150px', filters: this.supplierNameFilters, filterMethod: this.filterBySupplierName, placement: 'bottom-end' }
    let conf = this.procurementSkuConfig.filter( v => v.isChecked ) || []
    conf.some( ( v, index ) => {
      if ( v.prop === 'supplierName' && v.isChecked ) {
        conf.splice( index, 1, con )
        return true
      }
      return false
    } )
    return conf
  }

  get lcSkuCode () {
    return this.currSkuGoods.lcSkuCode
  }
  get currSupplierName () {
    return this.currSkuGoods.supplierName
  }

  get supplierNameFilters () {
    let s = new Set()
    this.tableList.forEach( v => {
      if ( v.supplierName ) {
        s.add( v.supplierName )
      }
    } )
    return Array.from( s ).map( v => ( {
      text: v,
      value: v
    } ) )
  }


  @Watch( 'commonSelectedSkuList' )
  clearTableSelection ( newVal, oldVal ) {
    if ( newVal.length === 0 ) {
      let skuTable: any = this.$refs.skuTable
      skuTable.clearSelection()
    }
  }

  created () {
    Promise.resolve( this.getAllBrands() ).then( res => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) )
    } )
    this.search()
  }

  formatSalesStatus ( type ) {
    return salesStatus.filter( v => v.id === type )[ 0 ].name
  }

  formatGoodsLabel ( type ) {
    return goodsLabel.get( +type )
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
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
    this.$permissionValidateWithNotify( 627 )
    this.$http( API.selectProductList, this.formatOptions() ).then( ( { data } ) => {
      let d = data.data || {}
      this.tableList = ( d.list || [] ).map( v => {
        let { repNum, deliveryDate, lcSkuCode } = v
        repNum = repNum > 0 ? repNum : 0
        let result = {
          ...v,
          deliveryDate: this.formatMyDate( deliveryDate && deliveryDate.time, 'yyyy-MM-dd' ),
          repNum,
          supplyNum: repNum,
          number: 0
        }
        // 将sku 的供应商修改为本地的记录
        let localSupplierName = this.skuSupplierRelation[ lcSkuCode ] || ''
        if ( localSupplierName.length > 0 && localSupplierName !== result.supplierName ) {
          result.supplierName = localSupplierName
        } else if ( localSupplierName === result.supplierName ) {
          this.delSkuSupplierRelation( lcSkuCode )
        }
        return result
      } )
      this.setSkuIsAdded()
      this.page.total = d.total || 0
    } ).catch( rej => {
      this.tableList = []
      this.page.total = 0
    } )
  }

  filterBySupplierName ( value, row ) {
    return row.supplierName === value
  }

  selectionChange ( v ) {
    this.setCommonSelectedSkuList( v )
  }
}
</script>
<style lang="stylus" scoped>
.refill-common-sku
  margin-bottom 80px
</style>




