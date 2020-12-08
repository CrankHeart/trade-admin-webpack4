<template>
  <div class="business-product-module">
    <lc-condition
      ref="product-module-condition"
      :condition="condition"
      @submit="search"
      label-width="100px"
    ></lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'goodStatus'"
        >{{ formatgoodStatus(scope.row.goodStatus) }}</template>
        <template
          v-else-if="scope.con.prop === 'salesPrice'"
        >{{ (+scope.row.salesPrice).toFixed(2) }}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Inject, Watch } from "vue-property-decorator"
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table/index'
import { State, Action } from "vuex-class"
import { goodStatuses } from '../../product/const/'
import { matchArrItem } from '../../../utils/'
import API from '../../../API'
@Component( {
  name: "business-product-module",
  components: {
    lcCondition,
    lcTable
  }
} )
export default class businessProductModule extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( "brand/getAllBrands" ) getAllBrands

  data = []
  config = [
    { prop: 'lcSpuCode', label: 'lcSpuCode', width: '145px' },
    { prop: 'lcSkuCode', label: 'lcSkuCode', width: '145px' },
    { prop: 'name', label: '名称' },
    { prop: 'specification', label: '规格' },
    { prop: 'storeSkuCode', label: '自有编码', width: '130px' },
    { prop: 'unit', label: '单位', width: '70px' },
    { prop: 'goodStatus', label: '是否上架', width: '100px' },
    { prop: 'salesPrice', label: '销售价', width: '130px' },
  ]
  condition = [
    { value: '', key: 'lcSkuCode', label: 'lcSkuCode', type: 'text' },
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: {} },
    { value: '', key: 'goodStatus', label: '是否上架', type: 'select', options: goodStatuses }
  ]
  page: any = {
    cur: 1,
    num: 50,
    total: 0,
    sizes: [ 10, 20, 50 ]
  }
  get id () {
    return this.$route.params.id
  }

  formatgoodStatus ( id ) {
    return matchArrItem( id, goodStatuses, 'id' ).name
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.search()
  }
  search ( cur?: number ) {
    this.page.cur = cur || this.page.cur
    this.dataAdapter()
  }
  dataAdapter () {
    let o: any = {}
    o.start = ( this.page.cur - 1 ) * ( this.page.num )
    o.num = this.page.num
    let route: any = {}
    this.condition.forEach( val => {
      let { key, value } = val
      route[ key ] = value
      if ( value !== '' && value !== undefined ) {
        o[ key ] = value
      }
    } )
    this.$http( API.getStoreSkuList, { ...o, storeId: this.id } ).then( ( { data } ) => {
      this.data = data.data.list
      this.page.total = data.data.total
    } )
  }
  created () {
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
    this.search()
  }
  activated () {
    this.search()
  }
  deactivated () {
    let moduleCondition: any = this.$refs[ 'product-module-condition' ]
    moduleCondition.resetField()
  }
}
</script>
