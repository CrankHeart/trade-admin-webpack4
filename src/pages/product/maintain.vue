<template>
  <div id="product-maintain">
    <lc-title text="商品维护"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table-config :base-config="baseConfig" @set-config="setMaintainConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :loading="loading"
      :key="config.length"
    >
      <template slot-scope="scope">
        <!--状态-->
        <template v-if="scope.con.prop =='salesStatus'">
          <el-select
            v-if="$permissionValidate(495)"
            :value="scope.row.salesStatus"
            placeholder="请选择"
            size="small"
            @input="updateStatus(scope.row,$event)"
            :key="`${scope.row.id}_${scope.row.salesStatus}`"
          >
            <el-option
              v-for="item in salesStatus"
              :label="item.name"
              :value="item.id"
              :key="item.id"
            ></el-option>
          </el-select>
          <template v-else>{{convertData(scope.row.salesStatus,'salesStatus')}}</template>
        </template>
        <router-link
          v-else-if="scope.con.prop =='detail' && $permissionValidate(496)"
          :to="'/product/detail/'+scope.row.id"
          class="el-button el-button--text"
          tag="button"
        >点击查看</router-link>
        <span v-else>{{scope.row[scope.con.prop]}}</span>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import API from "../../API"
import lcTitle from "../../components/title.vue"
import lcCondition from "../../components/condition.vue"
import lcTable from "../../components/table/index"
import lcTableConfig from "../../components/table/control.vue"
import { State, Action, Getter, Mutation } from "vuex-class"
import { matchArrItem } from '../../utils'
// import { SelectOption, Condition } from '../../typing/index'

@Component( {
  name: "product-maintain",
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig
  }
} )
export default class ProductMaintain extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( "brand/getAllBrands" ) getAllBrands
  @Mutation( "product/setMaintainConf" ) setMaintainConf
  @Getter( "product/maintainConfig" ) baseConfig
  salesStatus = [
    { name: '上架', id: 0 },
    { name: '停售', id: 3 },
    { name: '下架', id: 1 },
    { name: '作废', id: 2 }
  ]
  convertData ( value, type ) {
    let arr = []
    switch ( type ) {
      case 'salesStatus':
        arr = this.salesStatus
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
  configContrl: boolean = true
  condition: any[] = [
    { value: "", key: "lcCode", label: "LC编码", type: "text" },
    { value: "", key: "brandId", label: "品牌", type: "select", options: [] },
    { value: "", key: "name", label: "商品名称", type: "text" },
    { value: [], key: [ 'category1stId', 'category2stId', 'category3stId' ], label: "类目", type: "cascader" },
    // { value: [], key: "categoryId", label: "类目", type: "cascader" },
    { value: "", key: "salesStatus", label: "状态", type: "select", options: this.salesStatus }
  ]
  loading = false

  get config () {
    return this.baseConfig.filter( v => v.isChecked )
  }
  data = []
  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  activated () {
    this.initGetData()
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
  }
  initGetData () {
    let query = this.$route.query
    // for (var i in query) {
    this.condition.forEach( v => {
      let k = v.key
      if ( v.type === "cascader" ) {
        v.value.push( +query[ k[ 0 ] ] || '' )
        v.value.push( +query[ k[ 1 ] ] || '' )
        v.value.push( +query[ k[ 2 ] ] || '' )
        // v.value = ( query[ k ] || "" ).split( "," )
      } else if ( v.type === "select" ) {
        v.value = +query[ k ] || ""
      } else {
        v.value = query[ k ]
      }
    } )
    this.search()
    return
    // }
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  search ( cur?: number ) {
    this.$permissionValidateWithNotify( 494 )
    this.loading = true
    let o: any = {}
    this.condition.forEach( v => {
      let { key, value, type } = v
      if ( type === 'cascader' ) {
        if ( value[ 2 ] ) {
          o[ key[ 2 ] ] = +value[ 2 ]
        }
        if ( value[ 1 ] ) {
          o[ key[ 1 ] ] = +value[ 1 ]
        }
        if ( value[ 0 ] ) {
          o[ key[ 0 ] ] = +value[ 0 ]
        }
      } else if ( type == 'text' ) {
        o[ key ] = value && value.trim()
      } else {
        o[ key ] = value
      }
      // o[ key ] = type == 'text' ? value && value.trim() : value
    } )
    this.page.cur = cur || this.page.cur
    o.start = ( this.page.cur - 1 ) * this.page.num
    // o.categoryId = o.categoryId.join( "," )
    this.$router.push( {
      path: "/product/maintain",
      query: { ...o }
    } )
    o.num = this.page.num
    // o.categoryId = o.categoryId.split( "," ).splice( -1 )[ 0 ]
    Object.keys( o ).forEach( v => {
      if ( o[ v ] === "" ) {
        delete o[ v ]
      }
      if ( o[ 'category3stId' ] ) {
        delete o[ 'category1stId' ]
        delete o[ 'category2stId' ]
      } else if ( o[ 'category2stId' ] ) {
        delete o[ 'category1stId' ]
      }
    } )
    if ( o.lcCode ) {
      if ( o.lcCode.length == 8 ) {
        o.lcCode = '11000' + o.lcCode
      }
    }
    this.$http( API.getProductList, o )
      .then( ( { data } ) => {
        this.loading = false
        this.data = data.list
        this.page.total = data.total
      } )
      .catch( err => {
        this.data = []
        this.page.total = 0
        this.loading = false
      } )
  }
  updateStatus ( item, status ) {
    console.log( item )
    this.$http( API.updateProductStatus, {
      id: item.id,
      status
    } ).then( () => {
      item.salesStatus = status
    } )
  }
}
</script>

