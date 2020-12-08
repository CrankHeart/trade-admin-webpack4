<template>
  <div class="virtual-sku-board">
    <lc-title text="虚拟sku看板"></lc-title>
    <lc-condition :condition="condition" @submit="skuSearch"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="['brandId','skuType','goodStatus','goodLabel','whileStocksLast'].indexOf(scope.con.prop)>-1"
        >{{convertData(scope.row[scope.con.prop],scope.con.prop)}}</template>
        <template v-else>
          <span v-html="scope.row[scope.con.prop]"></span>
        </template>
      </template>
    </lc-table>
    <el-button
      :disabled="!myData.length"
      class="pull-right"
      type="primary"
      @click="exportExcel"
    >导出excel</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import API from '../../API'
import { matchArrItem } from '../../utils'
import { goodLabels, skuTypes, goodStatuses, whileStocksLasts } from '../product/const'

const myGoodStatuses = goodStatuses.filter( v => v.id != 2 )
const mySkuTypes = skuTypes.filter( v => v.id && v.id != 3 )

@Component( {
  name: 'virtual-sku-board',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class VirtualSkuBoard extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( 'brand/getAllBrands' ) getAllBrands
  activated () {
    this.initGetData()
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
  }
  condition: any[] = [
    { value: undefined, key: 'lcSkuCode', label: 'sku编码', type: 'text' },
    { value: undefined, key: 'brandId', label: '品牌', type: 'select', options: [] },
    { value: undefined, key: 'skuName', label: '商品名称', type: 'text' },
    { value: undefined, key: 'goodStatus', label: '状态', type: 'radio', options: myGoodStatuses },
    { value: undefined, key: 'whileStocksLast', label: '售完即止', type: 'radio', options: whileStocksLasts },
    { value: undefined, key: 'skuType', label: '类型', type: 'radio', options: mySkuTypes }
  ]
  skuSearch ( cur = 1 ) {
    let o = this.formatRequest()
    this.$http( API.getVirtualSkuList, o ).then( ( { data } ) => {
      let response = data.data || {}
      this.myData = ( response.list || [] ).map( v => ( {
        ...v,
        relatedSkuCodes: v.relatedSkuCodes.join( '\n' )
      } ) )
      this.page.total = response.total
      this.$router.push( {
        path: '/data/virtualSkuBoard',
        query: o
      } )
    } )
  }
  config: any[] = [
    { prop: 'lcSkuCode', label: 'sku编码', width: '150' },
    { prop: 'brandId', label: '品牌', width: '150' },
    { prop: 'skuName', label: '名称', width: '210' },
    { prop: 'specification', label: '规格', width: '250' },
    { prop: 'storeSkuCode', label: '自有编码', width: '150' },
    { prop: 'unit', label: '单位' },
    { prop: 'skuType', label: '类型' },
    { prop: 'goodStatus', label: '状态' },
    { prop: 'goodLabel', label: '标签', width: '150' },
    { prop: 'whileStocksLast', label: '售完即止', width: '150' },
    { prop: 'relatedSkuCodes', label: '关联SKU', width: '150' }
  ]
  myData: any[] = []
  curChange ( cur ) {
    this.page.cur = cur
    this.skuSearch( cur )
  }
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  exportExcel () {
    this.$submit( API.exportVirtualSkuList, this.formatRequest() )
  }
  initGetData () {
    let query = this.$route.query
    this.condition.forEach( v => {
      let k = v.key
      if ( v.type === 'select' || v.type === 'radio' ) {
        v.value = +query[ k ] || undefined
      } else {
        v.value = query[ k ]
      }
    } )
    // let { start = 1, num = 10, fastSearch } = query
    // if ( fastSearch ) {
    //   this.page.num = num
    //   this.page.cur = parseInt( start / num ) + 1
    // }
    this.skuSearch()
  }
  formatRequest () {
    let o: any = {}
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    this.condition.forEach( val => {
      let { key, type, value } = val
      if ( type == 'select' ) {
        o[ key ] = value === '' ? undefined : value
      } else {
        o[ key ] = value
      }
    } )
    return o
  }
  convertData ( value, type ) {
    let arr = []
    switch ( type ) {
      case 'goodStatus':
        arr = myGoodStatuses
        break
      case 'goodLabel':
        arr = goodLabels
        break
      case 'skuType':
        arr = mySkuTypes
        break
      case 'brandId':
        arr = this.brandList
        break
      case 'whileStocksLast':
        arr = whileStocksLasts
        break
      default:
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
}
</script>

