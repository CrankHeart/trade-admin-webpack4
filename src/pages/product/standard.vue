<template>
  <div id="standard-product">
    <lc-title text="标品管理"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='control'&&$permissionValidate(502)">
          <router-link :to="`/product/standardDetail/${scope.row.id}`">查看</router-link>
        </template>
        <template v-else>
          <span>{{scope.row[scope.con.prop]}}</span>
        </template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import API from '../../API'
@Component( {
  name: 'standard-product',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class StandardProduct extends Vue {
  condition: any[] = [
    { value: undefined, key: 'name', label: '商品名称', type: 'text' },
    { value: undefined, key: 'lcCode', label: 'SPU编码', type: 'text' },
    // { value: '', key: 'skuid', label: 'SKU编码', type: 'text' }
  ]
  config = [
    { prop: 'lcCode', label: 'lcCode', width: '150' },
    { prop: 'name', label: '商品名称' },
    { prop: 'brandName', label: '品牌', width: '150' },
    { prop: 'categoryName', label: '类目', width: '100' },
    { prop: 'control', label: '操作', width: '100' }
  ]
  data: any[] = []
  curChange ( cur ) {
    this.search( cur )
  }
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  activated () {
    this.search()
  }
  computeCondition () {
    let o: any = {}
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    this.condition.forEach( ( { value, key } ) => {
      if ( value !== undefined ) {
        o[ key ] = value
      }
    } )
    if ( /^\d{8}$/.test( o.lcCode ) ) {
      o.lcCode = '11000' + o.lcCode
    }
    return o
  }

  search ( cur = 1 ) {
    this.$permissionValidateWithNotify( 501 )
    this.page.cur = cur
    let o = this.computeCondition()
    this.$http( API.getProductList, o )
      .then( ( { data } ) => {
        this.data = data.list
        this.page.total = data.total
      } )
      .catch( err => {
        this.data = []
        this.page.total = 0
      } )
  }

}
</script>
