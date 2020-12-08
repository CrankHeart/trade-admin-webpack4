<template>
  <div class="refill-order-sku">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button
          v-if="$permissionValidateWithEnv(1158, 1154)"
          type="primary"
          @click="exportSupplySku"
        >导出到Excel</el-button>
      </template>
    </lc-condition>
    <lc-table-config
      :base-config="purchasingTaskOrdinarySkuConfig"
      @set-config="setPurchasingTaskOrdinaryConf"
    />
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
      @size-change="sizeChange"
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
            :class="{'danger-risk': row[con.prop] <= 2 }"
          >{{ formatRiskLevel( row[con.prop] )}}</span>
        </template>
        <template v-else-if="con.prop==='goodLabel'">{{formatLabel(row[con.prop])}}</template>
        <template v-else-if="con.prop==='gapsNumber'">
          <span>{{filterNotMined(+row['purchaseNum'] - +row['onWayNum'] - +row['storedNum'])}}</span>
        </template>
        <template v-else-if="con.prop === 'riskDeatil'">
          <el-button
            v-if="$permissionValidateWithEnv(1161, 1156)"
            type="primary"
            size="mini"
            @click="showRiskStatus( row )"
          >查看交付详情</el-button>
        </template>
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
    <purchasing-task-details-dialog
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></purchasing-task-details-dialog>
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
import { Component, Inject, Watch } from 'vue-property-decorator'
import { goodLabels } from '@/pages/product/const'
import lcTable from '../../../components/table/'
import lcTableConfig from "../../../components/table/control.vue"
import lcCondition from '../../../components/condition.vue'
import procurementSupplier from './procurementSupplier.vue'
import riskStatus from './riskStatus.vue'
import purchasingTaskDetailsDialog from './purchasingTaskDetailsDialog.vue'
import API from '../../../API'
import { matchArrItem } from '../../../utils/'
import { riskLevels } from '../const'
import refillGoods from '../mixins/refillGoods'
import tablePage from "../public/tablePage"

@Component( {
  name: 'purchasing-tasks-ordinary',
  components: {
    lcTable,
    lcTableConfig,
    lcCondition,
    riskStatus,
    purchasingTaskDetailsDialog,
    procurementSupplier
  },
  mixins: [ refillGoods, tablePage ]
} )
export default class purchasingTasksOrdinary extends Vue {
  @State( state => state.supplier.supplierList ) supplierList
  @State( state => state.procurement.skuSupplierRelation ) skuSupplierRelation
  @State( state => state.login.memberId ) memberId
  @State( state => state.login.token ) accessToken
  @Getter( 'procurement/purchasingTaskOrdinarySkuConfig' ) purchasingTaskOrdinarySkuConfig
  @Action( "brand/getAllBrands" ) getAllBrands
  @Action( 'supplier/getAllSuppliers' ) getAllSuppliers
  @Mutation( 'procurement/setCommonSelectedSkuList' ) setCommonSelectedSkuList
  @Mutation( 'procurement/delSkuSupplierRelation' ) delSkuSupplierRelation
  @Mutation( 'procurement/setPurchasingTaskOrdinaryConf' ) setPurchasingTaskOrdinaryConf

  @Inject() formatMyDate

  tableList: any[] = []
  condition: any[] = [
    { value: [], key: 'brandId', label: '品牌', type: 'select', multiple: true, options: [] },
    // { value: undefined, key: 'supplierId', label: '供应商', type: 'select', options: [] },
    { value: undefined, key: 'buyerId', label: '采购员', type: 'select', options: [] },
    { value: undefined, key: 'lcSkuCode', label: 'lc编码', type: 'text' },
    { value: undefined, key: 'skuName', label: '名称', type: 'text' },
    { value: undefined, key: 'specification', label: '规格', type: 'text' },
    { value: undefined, key: 'storeSkuCode', label: '自有编码', type: 'text' },
    { value: '', key: 'goodLabel', label: '商品标签', type: 'select', col: { lg: 8, sm: 8 }, options: goodLabels },
    {
      value: undefined, key: 'priority', label: '优先', type: 'radio',
      options: [
        { id: '1', name: '价格优先' },
        { id: '2', name: '交期优先' }
      ]
    },
    {
      value: [], key: 'riskLevel', label: '交付风险', type: 'select', multiple: true,
      options: [
        { id: '1', name: '仅显示交付不足风险' },
        { id: '2', name: '仅显示交付延期风险' },
        { id: '3', name: '仅显示无交付风险' }
      ],
      col: { lg: 8, sm: 16 }
    },
    {
      value: '',
      key: "isExitBuyer",
      label: "是否存在任务缺口数",
      type: "select",
      options: [
        {
          id: 1,
          name: "是"
        },
        {
          id: 0,
          name: "否"
        }
      ]
    },
    { value: '', key: 'supplierId', label: '供应商', type: 'select', multiple: true, options: [] },
  ]

  visibleRiskStatus: boolean = false
  currRiskLevleSkuId: string = ''
  currRiskLevelLcSkuCode: string = ''

  get baseConfig () {
    return this.purchasingTaskOrdinarySkuConfig.filter( v => v.isChecked ) || []
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
    // this.watchForGetBuyerList()
    this.getAllBuyers()
  }
  getSuppliers ( supplierList ) {
    let d = supplierList.map( v => {
      return {
        name: v.name,
        id: v.id
      }
    } )
    let item = this.condition.find( item => item.key == 'supplierId' )
    item.options = d
  }
  getAllBuyers () {
    this.$http( API.getAllBuyers ).then( ( { data } ) => {
      let d = data.data.map( v => {
        return {
          name: v.loginName,
          id: v.id
        }
      } )
      let item = this.condition.find( item => item.key == 'buyerId' )
      item.options = d
    } )
  }
  filterNotMined ( num ) {
    return num < 0 ? 0 : num
  }

  formatLabel ( goodLabel ) {
    return matchArrItem( goodLabel, goodLabels, 'id' ).name
  }

  watchForGetBuyerList () {
    this.$watch( () => this.condition[ 0 ].value, function ( newv ) {
      this.$http( API.getUserByBrandId, { brandIds: newv } ).then( ( { data } ) => {
        let d = data.data.map( v => {
          return {
            name: v.loginName,
            id: v.id
          }
        } )
        let item = this.condition.find( item => item.key == 'buyerId' )
        item.options = d
      } )
    } )
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
    let param = this.formatParam()
    Promise.all( [ this.$http( API.searchPurchaseTask, param ).then( ( { data } ) => {
      data = data.data || {}
      this.page.total = data.total
      this.tableList = data.list
      return data.list
    } ), this.getAllSuppliers() ] ).then( ( [ data1, data2 ] ) => {
      let priority = sessionStorage.getItem( 'supplier-priority' ) || ''
      this.tableList.forEach( item => {
        let { supplierId, lcSkuCode, purchaseNum, onWayNum, storedNum, deliveryDate, supplierDeliveryDate } = item
        let lackingNum = +purchaseNum - +onWayNum - +storedNum < 0 ? 0 : +purchaseNum - +onWayNum - +storedNum
        let localSupplierName = this.skuSupplierRelation[ lcSkuCode ] || ''
        let resultSupplierName = this.supplierIdNameMap[ supplierId ] || ''

        item.supplyNum = lackingNum
        item.deliveryDate = deliveryDate && this.formatDate( deliveryDate )
        item.supplierDeliveryDate = supplierDeliveryDate && this.formatDate( supplierDeliveryDate )

        // if ( param.priority && param.priority.length > 0 && param.priority !== priority ) {
        //   Vue.set( item, 'supplierName', resultSupplierName )
        // } else if ( localSupplierName.length > 0 && localSupplierName !== resultSupplierName ) {
        //   Vue.set( item, 'supplierName', localSupplierName )
        // } else {
        //   Vue.set( item, 'supplierName', resultSupplierName )
        // }
        if ( localSupplierName === resultSupplierName ) {
          this.delSkuSupplierRelation( lcSkuCode )
        }
      } )
      this.setSkuIsAdded()
      this.setSupplierPriority( param.priority )
      this.getSuppliers( data2 )
    } )
  }

  formatParam () {
    let { num, cur } = this.page
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num
    }
    this.condition.forEach( con => {
      if ( ( con.key === 'brandId' || con.key == 'riskLevel' || con.key == 'supplierId' ) ) {
        if ( con.value.length > 0 ) {
          param[ `${con.key}s` ] = con.value
        }
      } else if ( con.value !== undefined && con.value !== '' ) {
        param[ con.key ] = con.value
      }
    } )
    return param
  }

  formatRiskLevel ( level ) {
    return matchArrItem( level, riskLevels, 'id' ).name
  }


  formatDate ( date ) {
    return this.formatMyDate( date && date.time, 'yyyy-MM-dd' )
  }

  selectionChange ( v ) {
    this.setCommonSelectedSkuList( v )
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
    this.$submit( API.exportPurchaseTask, {
      ...param,
      memberId: this.memberId,
      accessToken: this.accessToken
    } )
  }
}
</script>

<style lang="stylus" scoped >
.refill-order-sku
  margin-bottom 80px
.pointer
  cursor pointer
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>
