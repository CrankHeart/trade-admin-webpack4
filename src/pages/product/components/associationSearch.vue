<template>
  <div id="product-association">
    <lc-title text="协议商品"></lc-title>
    <lc-condition :condition="condition" @submit="search">
      <template slot-scope="scope">
        <template v-if="scope.row.type=='multiLcCode'">
          <div class="multi-lc-code">
            <el-select v-model="scope.row.value.type">
              <el-option label="Spu" value="lcSpuCode"></el-option>
              <el-option label="Sku" value="lcSkuCode"></el-option>
            </el-select>
            <el-input v-model.trim="scope.row.value.value" placeholder="请输入lc编码"></el-input>
          </div>
        </template>
      </template>
    </lc-condition>
    <template v-if="searchType">
      <el-tabs v-model="activeName">
        <el-tab-pane label="查询结果" v-if="$permissionValidateWithEnv(1235,1231)" name="list">
          <el-button
            class="pull-right"
            type="primary"
            @click="exportData"
            v-if="$permissionValidate(1006)"
          >导出</el-button>
          <el-button
            class="pull-right"
            type="primary"
            v-if="searchType!==2 && $permissionValidate(498)"
            @click="addNewDialogVisible=true"
          >添加商品</el-button>
          <association-search-result
            :config="config"
            :list="list"
            :has-page="activeName=='list'"
            :page="page"
            :type="searchType"
            @page-change="pageChange"
            :tenant="tenant"
            @update="confirmAddAssociation"
            @push="pushToWaitList"
          ></association-search-result>
        </el-tab-pane>
        <el-tab-pane label="待提交列表" v-if="$permissionValidateWithEnv(1236,1232)" name="waitList">
          <el-button
            class="pull-right"
            type="primary"
            @click="exportData"
            v-if="$permissionValidate(1006)"
          >导出</el-button>
          <el-button
            class="pull-right"
            type="primary"
            v-if="searchType!==2 && $permissionValidate(498)"
            @click="addNewDialogVisible=true"
          >添加商品</el-button>
          <association-search-result
            :config="config"
            :list="list"
            :has-page="activeName=='list'"
            :page="page"
            :type="searchType"
            @page-change="pageChange"
            :tenant="tenant"
            @update="confirmAddAssociation"
            @push="pushToWaitList"
          ></association-search-result>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template v-if="activeName=='waitList'">
      <el-button class="pull-right" type="primary" @click="confirmAddAssociation(waitList)">保存</el-button>
      <el-button class="pull-right" @click="waitList=[]">取消</el-button>
    </template>
    <add-new-association
      v-if="addNewDialogVisible"
      v-model="addNewDialogVisible"
      :tenant="tenant"
      :source-data="productList"
      @addProducts="addProducts"
      @refresh="getData"
    ></add-new-association>

    <!-- <el-dialog title="添加协议商品" v-model="addNewDialogVisible" :before-close="closeAddNewDialog" size="large">
      <association-editor :source-data="productList" v-model="newProductList" :tenant="tenant"></association-editor>
      <div slot="footer" class="clearfix">
        <el-button type="primary" class="pull-right" @click="pushToWaitList(newProductList)">确认</el-button>
        <el-button class="pull-right" @click="closeAddNewDialog">取消</el-button>
      </div>
    </el-dialog>-->
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import lcTitle from '../../../components/title.vue'
import lcCondition from '../../../components/condition.vue'

import associationSearchResult from './associationSearchResult.vue'
import associationEditor from './associationEditor.vue'
import addNewAssociation from './addNewAssociation.vue'
import API from '../../../API'
interface Tenant {
  name: string
  id: string
  [ propName: string ]: any
}
@Component( {
  name: 'product-association-search',
  components: {
    lcTitle,
    lcCondition,
    associationSearchResult,
    associationEditor,
    addNewAssociation
  }
} )
export default class Productassociation extends Vue {
  get tenant () {
    let { tenantId, tenantName } = this.searchOption || {}
    return { tenantId, tenantName }
  }

  condition: any[] = [
    { value: undefined, key: 'tenant', label: '集团企业', type: 'tenantSearch', twoWay: true, col: { lg: 24, sm: 24 } },
    { value: { type: undefined, value: undefined }, key: 'lcCode', label: 'lcCode', type: 'multiLcCode', col: { lg: 24, sm: 24 } },
  ]
  searchType: number = 0
  showAdd: boolean = false
  computedSearchOption () {
    let o: any = {}
    this.condition.forEach( val => {
      let { key, value, type } = val
      o[ key ] = value
      if ( type == 'tenantSearch' ) {
        o.tenantId = value && value.id
        o.tenantName = value && value.name
        delete o.tenant
      } else if ( type == 'multiLcCode' ) {
        let lcType = value.type
        if ( lcType ) {
          o[ lcType ] = value.value
        }
        delete o.lcCode
      }
    } )

    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    this.searchOption = o
  }
  waitList: any[] = []
  pushToWaitList ( list, isChangeStatus = false ) {
    let listObj = list.reduce( ( total, prev ) => {
      let key = prev.lcSkuCode + prev.tenantId
      total[ key ] = prev
      return total
    }, {} )
    this.waitList = this.waitList.map( v => {
      let key = v.lcSkuCode + v.tenantId
      let newObj = listObj[ key ]
      if ( newObj ) {
        let o
        if ( isChangeStatus ) {
          o = Object.assign( {}, v, { status: newObj.status, remark: newObj.remark } )
        } else {
          o = Object.assign( {}, newObj, { status: v.status, remark: v.remark } )
        }
        delete listObj[ key ]
        return o
      }
      return v
    } ).concat( Object.keys( listObj ).map( key => listObj[ key ] ) )
    this.closeAddNewDialog()
  }
  activeName = 'list'
  get list () {
    return this.activeName == 'list' && this.productList || this.waitList
  }
  addProducts ( lists ) {
    this.pushToWaitList( lists )
    this.closeAddNewDialog()
  }
  confirmAddAssociation ( list ) {
    if ( !list.length ) {
      return
    }
    // let { tenantId, tenantName } = this.tenant
    // if ( !tenantId ) {
    //   let item = list[ 0 ]
    //   tenantId = item.tenantId
    //   tenantName = item.tenantName
    // }
    let option = {
      // tenantId, tenantName,
      skuList: list.map( ( { skuId, agreePrice, levelPrice, levelRate, strategyLevel, status, remark, tenantId } ) => ( {
        skuId, agreePrice, levelPrice, levelRate, strategyLevel, status, remark, tenantId
      } ) ),
      broadcast: true
    }
    this.$http( API.addAgreeProduct, option ).then( ( { data } ) => {
      // list.forEach( v => v.hasChanged = false )
      // if ( this.addNewDialogVisible ) {
      //   this.closeAddNewDialog()
      this.search()
      this.waitList = []
      this.activeName = 'list'
      // }
    } )
  }

  getData ( data ) {
    console.log( data )
    this.search()
  }

  computedSearchType ( o ) {
    let { tenantId, lcSpuCode, lcSkuCode } = o
    let res = Number( !!tenantId ) + Number( !!lcSpuCode || !!lcSkuCode )
    switch ( res ) {
      case 1:
        if ( tenantId ) {
          this.searchType = 1 // 仅搜索tenant
        } else {
          this.searchType = 2 // 仅搜索 lcCode
        }
        break
      case 2:
        this.searchType = 3 // 两者并存搜索
        break
      default:
        this.searchType = 0
    }
  }
  searchOption: any = null
  page = {
    cur: 1,
    num: 20,
    sizes: [ 10, 20, 50, 100 ],
    total: 0
  }
  pageChange ( type, value ) {
    switch ( type ) {
      case 'size':
        return this.pageSizeChange( value )
      case 'current':
        return this.pageCurChange( value )
    }
  }
  pageCurChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  pageSizeChange ( size ) {
    this.page.num = size
    this.pageCurChange( 1 )
  }
  productList: any[] = []
  search () {
    this.$permissionValidateWithNotify( 497 )
    this.showAdd = false
    this.computedSearchOption()
    this.computedSearchType( this.searchOption )

    this.$http( API.getAgreeProduct, this.searchOption ).then( ( { data } ) => {
      this.page.total = data.total
      this.productList = data.list.map( v => {
        // let name = v.name.split( '-' )
        // v.name = name[ 0 ]
        // v.specification = name[ 1 ]
        v.agreePriceBak = v.agreePrice
        v.strategyLevelBak = v.strategyLevel
        v.hasChanged = false
        delete v.level0Price
        delete v.level1Price
        delete v.level2Price
        return v
      } )
    }, () => {
      this.page.total = 0
      this.productList = []
    } )
  }
  exportData () {
    // console.log(JSON.stringify(this.searchOption))
    this.$submit( API.exportAgreeProduct, this.searchOption )
  }
  get config (): any[] {
    let arr = [
      { prop: 'lcSpuCode', label: 'spu编码', width: '150' },
      { prop: 'lcSkuCode', label: 'sku编码', width: '150' },
      { prop: 'name', label: '名称', width: '150' },
      { prop: 'brandName', label: '品牌' },
      { prop: 'specification', label: '规格', width: '250' },
      { prop: 'salesPrice', label: '售价', width: '150' },
      { prop: 'levelPrice', label: '会员价(A/B/C)', width: '150' },
      { prop: 'strategyLevel', label: '会员价折扣率', width: '150' },
      { prop: 'agreePrice', label: '协议价', width: '150' },
      { prop: 'status', label: '协议价状态', width: '120' },
      { prop: 'expirationDate', label: '协议价到期日', width: '180' },
      { prop: 'guidePrice', label: '销售底价', width: '150' },
      { prop: 'quoteStatus', label: '报价状态', width: '120' },
      { prop: 'whetherPurchase', label: '是否有成交', width: '120' }
    ]
    if ( this.searchType === 2 ) {
      arr.splice( 2, 0, ...[
        { prop: 'tenantId', label: '集团Id', width: '250' },
        { prop: 'tenantName', label: '集团名称', width: '250' },
      ] )
    }
    return arr
  }
  addNewDialogVisible: boolean = false
  newProductList: any[] = []
  closeAddNewDialog () {
    this.addNewDialogVisible = false
    this.newProductList = []
  }

}
</script>
<style lang="stylus" scoped>
.el-button.pull-right
  position relative
  z-index 9
.multi-lc-code
  display flex
  .el-select
    width 150px
    flex-shrink 0
    margin-right 10px
  .el-input
    flex-grow 1
</style>
