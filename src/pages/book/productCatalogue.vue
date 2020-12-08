<template>
  <div id="product-catalogue">
    <lc-title text="商品目录册"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :data="tableData"
      :config="config"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'salesStatus'"
        >{{formatSalesStatus(scope.row['salesStatus'])}}</template>
        <template v-else-if="scope.con.prop === 'category'">{{ formatCategory( scope.row )}}</template>
        <template v-else-if="scope.con.prop === 'control'">
          <el-button
            v-if="$permissionValidate(696)"
            size="small"
            type="primary"
            @click="goDetail(scope.row.id)"
          >详情</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop] || ''}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import API from '../../API'
import { salesStatus } from './const'

@Component( {
  name: 'product-catalogue',
  components: {
    lcTitle,
    lcTable,
    lcCondition
  }
} )
export default class productCatalogue extends Vue {
  @Action( "brand/getAllBrands" ) getAllBrands
  condition: any[] = [
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: [] },
    { value: '', key: 'salesStatus', label: '状态', type: 'select', options: salesStatus },
    { value: '', key: 'lcSpuCode', label: 'LC编码', type: 'text' },
    // { value: '', key: 'category', label: '类目', type: 'text' }, // 全部类目
    { value: [], key: [ 'category1stId', 'category2stId', 'category3stId' ], label: "类目", type: "cascader" },
    { value: '', key: 'name', label: '商品名称', type: 'text' }
  ]
  config = [
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'brandName', label: '品牌', width: '150px' },
    { prop: 'name', label: 'SPU名称', width: '250px' },
    { prop: 'lcSpuCode', label: 'LC编码' },
    { prop: 'category', label: '类目' },
    { prop: 'salesStatus', label: '状态' },
    { prop: 'control', label: '操作' },
  ]
  page = {
    num: 50,
    cur: 1,
    total: 0
  }
  tableData: any[] = []
  salesStatus = salesStatus

  activated () {
    Promise.resolve( this.getAllBrands() ).then( res => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) )
    } )
    this.search()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  formatSalesStatus ( status ) {
    if ( status === undefined ) {
      return ''
    }
    return salesStatus.filter( v => v.id === status )[ 0 ].name
  }
  formatCategory ( row ) {
    let { category1stName, category2stName, category3stName } = row
    if ( !( category3stName && category2stName && category1stName ) ) {
      return ''
    }
    return `${category1stName}/${category2stName}/${category3stName}`
  }

  formatParam () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    let param: any = {
      start,
      num
    }

    this.condition.forEach( v => {
      if ( v.type === 'cascader' ) {
        if ( v.value[ 2 ] ) {
          param[ v.key[ 2 ] ] = v.value[ 2 ]
        } else if ( v.value[ 1 ] ) {
          param[ v.key[ 1 ] ] = v.value[ 1 ]
        } else if ( v.value[ 0 ] ) {
          param[ v.key[ 0 ] ] = v.value[ 0 ]
        }
      } else if ( ( v.value + '' ).length > 0 ) {
        param[ v.key ] = v.value
      }
    } )
    return param
  }

  search () {
    this.$permissionValidateWithNotify( 695 )
    this.$http( API.getCatalogSpuList, this.formatParam() ).then( ( { data } ) => {
      let table = data.data || []
      this.page.total = table.total
      this.tableData = table.list
    } )
  }

  goDetail ( id ) {
    this.$router.push( '/themeEvent/productDetail/' + id )
  }
}
</script>
<style lang="stylus">

// #product-catalogue

</style>




