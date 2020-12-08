<template>
  <div id="quote-detail-customer-apply">
    <lc-title :text="`客户报价详情-${tenantName}`" />
    <lc-condition :condition="condition" @submit="search" label-width="120px" size="mini"></lc-condition>
    <el-form inline class="pull-right" v-if="!hasSubmitAudit">
      <template>
        <el-form-item label="协议价策略">
          <el-select v-model="biddingStrategy" clearable>
            <el-option
              v-for="item in strategyLevels"
              :key="item.label"
              :value="item.prop"
              :label="item.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品范围">
          <el-radio-group v-model="selectScope">
            <el-radio :label="0">当前选中</el-radio>
            <el-radio :label="1">所有商品</el-radio>
            <el-radio :label="2">选择品牌</el-radio>
          </el-radio-group>
          <el-select v-model="selectBrand" clearable filterable v-if="selectScope==2">
            <el-option v-for="item in brandList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label>
        <el-button type="primary" @click="confirmBatchUpdateQuotePrice">确定</el-button>
      </el-form-item>
    </el-form>
    <lc-table
      :config="lcConfig"
      :data="myData"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
      :selection="!hasSubmitAudit"
      @data-selection-change="selectionChange"
      controller-name="associationAuditDetail"
    >
      <template slot-scope="{row,con}">
        <template v-if="!(status==1 || status==2)">
          <template v-if="con.prop=='isOriginalSku'">
            <el-select v-model="row[con.prop]" size="small" @change="emitChange(row,1)">
              <el-option
                v-for="opt in con.options"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              >{{opt.name}}</el-option>
            </el-select>
          </template>
          <template v-else-if="con.prop=='biddingStrategy'">
            <el-select v-model="row[con.prop]" @change="biddingStrategyChange(row)">
              <el-option
                v-for="item in strategyLevels"
                :key="item.label"
                :value="item.prop"
                :label="item.label"
              ></el-option>
            </el-select>
          </template>
          <template v-else-if="con.prop=='quotePrice'">
            <template v-if="row.biddingStrategy===4">
              <el-input
                v-model.trim.number="row[con.prop]"
                size="small"
                @change="emitChange(row,1)"
              ></el-input>
            </template>
            <template v-else>{{row.quotePrice}}</template>
          </template>
          <template
            v-else-if="con.prop=='grossProfit'"
          >{{row[con.prop] && `${(row[con.prop] * 100).toFixed(2)}%`}}</template>
          <template v-else-if="con.prop=='control'">
            <template v-if="!row.hasSubmit">
              <el-button
                type="primary"
                size="small"
                :disabled="!row.hasChanged"
                @click="updateQuoteItem(row)"
              >保存</el-button>
              <el-button
                type="primary"
                size="small"
                v-if="!row.hasChanged && row.quotePrice"
                @click="submitQuoteAudit(row)"
              >提交</el-button>
            </template>
            <!-- <el-button type="text" size="small" @click="deleteQuoteItem(row)">删除</el-button> -->
          </template>
          <template v-else>{{converData(row[con.prop],con.prop)}}</template>
        </template>

        <template v-else>{{converData(row[con.prop],con.prop)}}</template>
      </template>
      <div class="clearfix" slot="append" v-if="!hasSubmitAudit">
        <el-button type="primary" class="pull-right" @click="updateQuoteItem()">保存当页</el-button>
        <el-button type="primary" class="pull-right" @click="submitQuoteAudit()">提交当页</el-button>
      </div>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Action, Getter } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import API from '../../API'
import { isOriginalSku, associationAuditStatuses, agreePriceStatuses, quoteItemStatuses } from './const'
import { matchArrItem, formatPrice } from '../../utils'

@Component( {
  name: 'quote-detail-customer-apply',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class QuoteDetailCustomerApply extends Vue {
  @State( state => state.brand.brandList ) brandList
  @Action( "brand/getAllBrands" ) getAllBrands
  @Getter( 'association/strategyLevel' ) strategyLevels
  @Action( 'association/getDefaultConfig' ) getDefaultConfig
  get tenantName () {
    return this.$route.query.tenantName
  }
  get status () {
    return +this.$route.query.status
  }
  get tenantId () {
    return this.$route.query.tenantId
  }
  get officeId () {
    return this.$route.query.officeId
  }
  biddingStrategy: number = null
  selectScope: number = 0
  selectBrand: number = null
  myData: any[] = []
  condition = [
    { value: undefined, key: 'name', label: '商品名称', type: 'text' },
    { value: undefined, key: 'brandId', label: '商品品牌', type: 'select', options: [] },
    { value: undefined, key: 'specification', label: '商品规格', type: 'text' },
    { value: undefined, key: 'lcSpuCode', label: 'Spu编码', type: 'text' },
    { value: undefined, key: 'lcSkuCode', label: 'Sku编码', type: 'text' },
    {
      value: undefined, key: 'unmatch', label: '', type: 'checkbox', options: [ { name: '仅显示未匹配物品', id: 1 } ]
    },
    {
      value: undefined, key: 'notQuote', label: '', type: 'checkbox', options: [ { name: '仅显示未报价物品', id: 1 } ]
    }
  ]
  get hasSubmitAudit () {
    return [ 1, 2, 3, 5, 6, 7 ].includes( this.status )
  }
  get lcConfig () {
    let lcConfig: any[] = [
      { prop: 'bigCustomerQuoteId', label: '申请单号', width: '200' },
      { prop: 'lcSkuCode', label: 'sku编码', width: '200' },
      { prop: 'lcSpuCode', label: 'spu编码', width: '200' },
      // { prop: 'isOriginalSku', label: '是否原商品', width: '200', options: isOriginalSku },
      { prop: 'lcProductName', label: '名称', width: '200' },
      { prop: 'lcBrandName', label: '品牌', width: '' },
      { prop: 'lcSpecification', label: '规格', width: '200' },
      { prop: 'lcUnit', label: '单位', width: '' },
      { prop: 'salesGuidePriceStr', label: '销售指导价', width: '200' },
      { prop: 'salesPrice', label: '售价', width: '200' },
      { prop: 'memberPrice', label: '会员价', width: '200' },
      { prop: 'biddingStrategy', label: '协议价策略', width: '180' },
      { prop: 'quoteItemStatus', label: '报价状态', width: '180', options: quoteItemStatuses },
      // { prop: 'currentAgreePrice', label: '已有协议价', width: '200' },
      { prop: 'quotePrice', label: '报价', width: '200' }
    ]
    if ( this.$permissionValidate( 487 ) ) {
      lcConfig.push( { prop: 'grossProfit', label: '毛利率', width: '200' } )
    }
    if ( this.$permissionValidate( 730 ) ) {
      lcConfig.push( { prop: 'bottomPrice', label: '综合成本价', width: '200' } )
    }
    if ( this.hasSubmitAudit ) {
      lcConfig.push( { prop: 'agreePriceStatus', label: '审核状态', width: '200' } )
      lcConfig.push( { prop: 'agreePriceInvalidTime', label: '协议价到期日期', width: '200' } )
    }
    lcConfig.push( { prop: 'remark', label: '备注', width: '200' } )

    if ( !this.hasSubmitAudit ) {
      lcConfig.push( { prop: 'control', label: '操作', width: '200', fixed: 'right' } )
    }

    return lcConfig
  }
  created () {
    this.getDefaultConfig()
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
  }
  activated () {
    this.myData = []
    this.page.total = 0
    this.search()
  }
  page = {
    cur: 1,
    num: 20,
    total: 0,
    sizes: [ 20, 30, 40, 50 ]
  }
  curChange ( cur ) {
    this.search( cur )
  }
  sizeChange ( size ) {
    this.page.num = size
    this.search( 1 )
  }
  selectItems: any[] = []
  selectionChange ( item ) {
    this.selectItems = item.map( v => v.id )
  }
  computeSearchOption () {
    let o: any = {}
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    this.condition.forEach( val => {
      let { value, key } = val
      o[ key ] = value
    } )

    o.unmatch = +!!o.unmatch
    o.notQuote = +!!o.notQuote
    let { bigCustomerQuoteIds, quoteType } = this.$route.query
    Object.assign( o, {
      bigCustomerQuoteIds, quoteType, tenantId: this.tenantId, officeId: this.officeId
    } )
    return o
  }
  search ( cur = 1 ) {
    this.page.cur = cur
    this.$http( API.getCustomerQuoteItemList, this.computeSearchOption() ).then( ( { data } ) => {
      let myData = data.data
      this.myData = myData.list || []
      this.page.total = myData.total || 0
    } )
  }
  confirmBatchUpdateQuotePrice () {
    // this.$permissionValidateWithNotify( 1034 )
    if ( ( this.biddingStrategy as any ) === '' || this.biddingStrategy === null || ( this.selectScope === 0 && !this.selectItems.length ) || ( this.selectScope == 2 && !this.selectBrand ) ) {
      return
    }
    this.$confirm( `此操作将修改${this.selectScope == 0 ? '选中商品' : this.selectScope == 1 ? '所有商品' : '选中品牌'}的报价, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.batchUpdateCustomerQuotePrice()
    } )
  }
  batchUpdateCustomerQuotePrice () {
    let o: any = {
      biddingStrategy: this.biddingStrategy,
      tenantId: this.tenantId,
      ...this.computeSearchOption()
    }
    // 当前选中
    switch ( this.selectScope ) {
      case 0:
        if ( this.selectItems.length ) {
          o.ids = this.selectItems.join( ';' )
        }
        break
      case 1:
        o.ids = '-1'
        break
      case 2:
        o.brandId = this.selectBrand
        break
    }

    o.broadcast = true
    this.$http( API.batchUpdateCustomerQuotePrice, o ).then( ( { data } ) => {
      this.search( this.page.cur )
    } )
  }
  submitQuoteAudit ( item?) {
    let quoteItemList: any[] = []
    if ( item ) {
      quoteItemList = [ item ]
    } else {
      quoteItemList = this.myData.filter( v => !v.hasChanged && v.quotePrice )
    }
    if ( !quoteItemList.length ) {
      return
    }
    this.$http( API.updateCustomerQuoteStatus, {
      bigCustomerQuoteIds: quoteItemList.map( ( { bigCustomerQuoteId } ) => bigCustomerQuoteId ).join( ',' ),
      status: 1,
      tenantId: this.tenantId,
      broadcast: true
    } ).then( () => {
      // this.$router.go( -1 )
      quoteItemList.forEach( item => this.$set( item, 'hasSubmit', true ) )
    } )
  }

  updateQuoteItem ( item?) {

    let quoteItemList = []
    if ( item ) {
      quoteItemList = [ item ]
    } else {
      quoteItemList = this.myData.filter( v => v.hasChanged && v.quotePrice )
    }
    if ( !quoteItemList.length ) {
      return
    }
    let isUseabledPrice = quoteItemList.every( ( { quotePrice, biddingStrategy, salesGuidePriceStr } ) => {
      let guidePrice = +salesGuidePriceStr.split( ' ~ ' )[ 0 ] || 0
      return +quotePrice && ( biddingStrategy !== 4 || quotePrice >= guidePrice )
    } )
    if ( !isUseabledPrice ) {
      this.$notify( {
        type: 'error',
        message: '商品存在报价低于销售底价，请重新设置确认后保存'
      } )
      return
    }
    this.$http( API.customerUpdateQuoteItem, {
      quoteItemList: quoteItemList.map( ( {
        id, skuId, isOriginalSku, quotePrice, biddingStrategy, bigCustomerQuoteId
      } ) => ( {
        id, skuId, isOriginalSku, quotePrice, biddingStrategy, bigCustomerQuoteId
      } ) ),
      tenantId: this.tenantId,
      broadcast: true
    } ).then( ( { data } ) => {
      let list = data.data || []
      for ( let i = 0, l = list.length; i < l; i++ ) {
        let { id, grossProfit } = list[ i ]
        let item = this.myData.filter( v => v.id == id )[ 0 ] || {}
        if ( item.id == id ) {
          this.$set( item, 'grossProfit', grossProfit )
          this.emitChange( item, false )
        }
      }
    } )
  }
  emitChange ( item, bo = true ) {
    this.$set( item, 'hasChanged', bo )
  }
  // deleteQuoteItem ( item ) {
  //   this.$http( API.deleteQuoteItem, {
  //     id: item.id,
  //     broadcast: true
  //   } ).then( () => {
  //     let index = this.myData.indexOf( item )
  //     if ( index > -1 ) {
  //       this.myData.splice( index, 1 )
  //     }
  //   } )
  // }
  converData ( value, prop, key = 'id', resultProp = 'name' ) {
    let arr = []

    if ( Array.isArray( prop ) ) {
      arr = prop
    } else {
      switch ( prop ) {
        case 'isOriginalSku':
          arr = isOriginalSku
          break
        case 'biddingStrategy':
          arr = Object.keys( this.strategyLevels ).map( key => this.strategyLevels[ key ] )
          key = 'prop'
          resultProp = 'label'
          break
        case 'agreePriceStatus':
          arr = agreePriceStatuses
          break
        case 'quoteItemStatus':
          arr = quoteItemStatuses
          break
      }
    }
    if ( !arr.length ) {
      return value
    }
    return matchArrItem( value, arr, [ key ] )[ resultProp ]
  }
  biddingStrategyChange ( item ) {
    let { biddingStrategy, memberPrice } = item
    if ( biddingStrategy !== 4 ) {
      let scale = ( this.strategyLevels[ biddingStrategy ] || {} ).value
      item.quotePrice = formatPrice( memberPrice * scale || 0, true )
    } else {
      item.quotePrice = ( item.salesGuidePriceStr || '' ).split( ' ~ ' )[ 0 ]
    }
    this.emitChange( item, 1 )
  }
}
</script>
