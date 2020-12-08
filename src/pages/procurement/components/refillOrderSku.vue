<template>
  <div class="refill-order-sku">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button
          v-if="$permissionValidateWithEnv(1168,1161)"
          type="primary"
          @click="exportSupplySku"
        >导出到Excel</el-button>
      </template>
    </lc-condition>
    <lc-table
      ref="skuTable"
      class="table-margin"
      :scroll-options="{offset: -350}"
      :config="refillOrderSkuTableConfig"
      :data="tableList"
      :page="page"
      :key="baseConfig.length"
      :selection="true"
      @data-selection-change="selectionChange"
      @cur-change="curChange"
    >
      <template slot-scope="{row,con,$index}">
        <template v-if="con.prop === 'recentDate' ">{{ formatDate( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'supplierName'">
          <span class="pointer" @click="showSupplierDialog($index)">
            <a v-if="row.supplierName && row.supplierName.length > 0">{{row.supplierName}}</a>
            <el-button type="primary" size="mini" v-else>选择供应商</el-button>
          </span>
        </template>
        <template v-else-if="con.prop==='riskLevel'">
          <span
            class="success-risk"
            :class="{'danger-risk': row[con.prop] <= 2  }"
          >{{ formatRiskLevel( row[con.prop] )}}</span>
        </template>

        <template v-else-if="con.prop==='riskDeatil'">
          <span
            v-if="$permissionValidate(1125)"
            class="primary pointer"
            @click="showRiskStatus( row )"
          >点击查看</span>
        </template>
        <template v-else-if="con.prop=='goodLabel'">{{row[con.prop] ? '是':'否'}}</template>
        <!-- <template v-else-if="con.prop==='lockedNum'">
          <span :class="{'success-risk': row.requireNum == row.lockedNum }">{{formatLockedNum( row )}}</span>
        </template>-->
        <template v-else-if="con.prop==='control'">
          <el-button
            v-if="row.isAdded"
            size="mini"
            type="danger"
            @click="delRefillSkuListItem(row)"
          >移除</el-button>
          <el-button v-else size="mini" type="primary" @click="addRefillSkuListItem(row)">添加</el-button>
        </template>
        <template v-else>{{row[ con.prop ]}}</template>
      </template>
    </lc-table>

    <risk-status
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></risk-status>
    <procurement-supplier
      v-model="visibleSupplierDialog"
      :lc-sku-code="currSkuGoods.lcSkuCode"
      :curr-supplier="currSkuGoods.supplierName"
      @finish="changeCurrSupplier"
    ></procurement-supplier>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { State, Action, Getter, Mutation } from 'vuex-class'
import { Component, Inject } from 'vue-property-decorator'
import lcTable from '../../../components/table/'
import lcTableConfig from "../../../components/table/control.vue"
import lcCondition from '../../../components/condition.vue'
import procurementSupplier from './procurementSupplier.vue'
import riskStatus from './riskStatus.vue'
import API from '../../../API'
import { matchArrItem } from '../../../utils/'
import { riskLevels } from '../const'
import refillGoods from '../mixins/refillGoods'
import { goodLabels } from '../../product/const'

@Component( {
  name: 'refill-order-sku',
  components: {
    lcTable,
    lcTableConfig,
    lcCondition,
    riskStatus,
    procurementSupplier
  },
  mixins: [ refillGoods ]
} )
export default class refillOrderSku extends Vue {
  @State( state => state.supplier.supplierList ) supplierList
  @State( state => state.procurement.skuSupplierRelation ) skuSupplierRelation
  @Getter( 'procurement/refillOrderSkuTableConfig' ) refillOrderSkuTableConfig
  @Action( "brand/getAllBrands" ) getAllBrands
  @Action( 'supplier/getAllSuppliers' ) getAllSuppliers
  @Mutation( 'procurement/setOrderSkuConf' ) setOrderSkuConf
  @Mutation( 'procurement/setOrderSelectedSkuList' ) setOrderSelectedSkuList
  @Mutation( 'procurement/delSkuSupplierRelation' ) delSkuSupplierRelation

  @Inject() formatMyDate

  tableList: any[] = []
  page = {
    num: 10,
    cur: 1,
    total: 0
  }
  condition: any[] = [
    // { value: '', key: 'suppliers', label: '首选供应商', type: '', options: [] },
    { value: [], key: 'brandId', label: '品牌', type: 'select', multiple: true, options: [] },
    { value: undefined, key: 'lcSkuCode', label: 'lc编码', type: 'text' },
    { value: undefined, key: 'name', label: '名称', type: 'text' },
    { value: undefined, key: 'specification', label: '规格', type: 'text' },
    { value: undefined, key: 'storeSkuCode', label: '自有编码', type: 'text' },
    { value: undefined, key: 'goodLabel', label: '商品标签', type: 'radio', options: goodLabels },
    {
      value: [], key: 'type', label: '', type: 'checkbox',
      col: { lg: 24, sm: 24 },
      valueType: 'array',
      options: [
        { id: 'missionLackingQuery', name: '仅显示有任务缺口的记录' },
        { id: 'payNotEnough', name: '仅显示交付不足风险' },
        { id: 'payDelay', name: '仅显示交付延期风险' },
      ]
    }
  ]

  visibleRiskStatus: boolean = false
  currRiskLevleSkuId: string = ''
  currRiskLevelLcSkuCode: string = ''
  // visibleSupplierDialog: boolean = false
  // currSkuGoods: any = {}

  get baseConfig () {
    let conf = this.refillOrderSkuTableConfig.filter( v => v.isChecked ) || []
    return conf
  }

  get supplierIdNameMap () {
    let map = this.supplierList.reduce( ( total, curr ) => {
      total[ curr.id ] = curr.name
      return total
    }, {} )
    return map
  }

  created () {
    Promise.resolve( this.getAllBrands() ).then( res => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) )
    } )
    this.search()
    this.setSupplierPriority( '' )
  }

  setSupplierPriority ( priority ) {
    // 暂存 供应商展示的优先水平
    sessionStorage.setItem( 'supplier-priority', priority )
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  search () {
    this.$permissionValidateWithNotifyEnv( 1163, 1159 )
    let param = this.formatParam()
    Promise.all( [ this.$http( API.getSupplySku, param ).then( ( { data } ) => {
      data = data.data || {}
      this.page.total = data.total
      this.tableList = data.list
      return data.list
    } ), this.getAllSuppliers() ] ).then( ( [ data1, data2 ] ) => {
      this.tableList.forEach( item => {
        let { supplierId, lcSkuCode, lackingNum, deliveryDate } = item
        item.supplyNum = lackingNum
        item.deliveryDate = this.formatDate( deliveryDate )

      } )
      this.setSkuIsAdded()
    } )
  }

  formatParam () {
    let { num, cur } = this.page
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num
    }
    this.condition.forEach( con => {
      if ( ( con.key === 'brandId' ) ) {
        if ( con.value.length > 0 ) {
          param[ `${con.key}s` ] = con.value
        }

      } else if ( ( con.key === 'type' ) ) {
        let { value, options } = con
        options.forEach( v => {
          param[ v.id ] = +!( value.indexOf( v.id ) > -1 ) // 0 为选中， 1 为未选中
        } )
      } else if ( con.value !== undefined && con.value != '' ) {
        param[ con.key ] = con.value
      }
    } )

    return param
  }

  formatRiskLevel ( level ) {
    return matchArrItem( level, riskLevels, 'id' ).name
  }

  formatLabel ( goodLabel ) {
    return matchArrItem( goodLabel, goodLabels, 'id' ).name
  }


  formatDate ( date ) {
    return this.formatMyDate( date && date.time, 'yyyy-MM-dd' )
  }

  selectionChange ( v ) {
    this.setOrderSelectedSkuList( v )
  }

  showRiskStatus ( row ) {
    this.currRiskLevleSkuId = row.skuId + ''
    this.currRiskLevelLcSkuCode = row.lcSkuCode
    this.visibleRiskStatus = true
  }

  exportSupplySku () {
    let param = this.formatParam()
    delete param.num
    delete param.start
    this.$submit( API.exportSupplySku, param )
  }
}
</script>


<style lang="stylus" scoped >
.refill-order-sku
  margin-bottom 80px
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>
