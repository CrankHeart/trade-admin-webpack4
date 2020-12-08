<template>
  <div id="quote-detail">
    <lc-title :text="`客户报价详情-${tenantName}`" v-if="!justContent">
      <el-tag
        :type="status==2?'primary':status==3?'danger':''"
      >{{converData(status,associationAuditStatuses)}}</el-tag>
      <!-- <el-button type="primary" class="pull-right" v-if="(status===0 ||status == 3)&&$permissionValidate(577)" @click="submitQuoteAudit">
        {{status===0?'提交审批':'重新提交审批'}}
      </el-button>-->
      <el-button
        class="pull-right"
        @click="exportQuote"
        v-if="status!==0&&$permissionValidate(669)"
      >导出报价单</el-button>
    </lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="120px"></lc-condition>
    <el-form inline class="pull-right" v-if="!(status==1 || status==2) ">
      <template v-if="$permissionValidate(1034)">
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
        <el-button
          type="primary"
          @click="confirmBatchUpdateQuotePrice"
          v-if="$permissionValidate(1034)"
        >确定</el-button>
        <el-button
          type="primary"
          @click="newQuoteItemDialogOpen"
          v-if="$permissionValidate(1032)"
        >新增商品</el-button>
      </el-form-item>
    </el-form>
    <h4>报价商品明细</h4>
    <el-table :data="myData" border stripe fit @selection-change="selectionChange">
      <el-table-column type="selection" width="55" fixed v-if="!(status==1 || status==2)"></el-table-column>
      <el-table-column label="客户商品信息" v-if="applyType == 1">
        <el-table-column
          v-for="con in cusConfig"
          :prop="con.prop"
          :label="con.label"
          :width="con.width"
          :resizable="true"
          :fixed="con.fixed"
          :key="con.prop"
        ></el-table-column>
      </el-table-column>
      <el-table-column label="领健商品信息">
        <el-table-column
          v-for="con in lcConfig"
          :prop="con.prop"
          :label="con.label"
          :width="con.width"
          :resizable="true"
          :key="con.prop"
        >
          <template slot-scope="scope">
            <!--非 待审批 已导入 -->
            <template v-if="!(status==1 || status==2)">
              <template v-if="con.prop=='isOriginalSku'">
                <el-select
                  v-model="scope.row[con.prop]"
                  size="small"
                  @change="emitChange(scope.row,1)"
                  :disabled="!$permissionValidate(579)"
                >
                  <el-option
                    v-for="opt in con.options"
                    :key="opt.id"
                    :label="opt.name"
                    :value="opt.id"
                  >{{opt.name}}</el-option>
                </el-select>
              </template>
              <template v-else-if="con.prop=='biddingStrategy'">
                <el-select
                  v-model="scope.row[con.prop]"
                  @input="biddingStrategyChange(scope.row)"
                  :disabled="!$permissionValidate(580)"
                >
                  <el-option
                    v-for="item in strategyLevels"
                    :key="item.label"
                    :value="item.prop"
                    :label="item.label"
                  ></el-option>
                </el-select>
              </template>
              <template v-else-if="con.prop=='lcSkuCode'">
                <i
                  class="el-icon-search"
                  @click="skuSelectorDialogOpen(scope.row)"
                  :disabled="$permissionValidate(579)"
                ></i>
                <template v-if="scope.row[con.prop]">{{scope.row[con.prop]}}</template>
                <template v-else>
                  <span>未匹配商品</span>
                </template>
              </template>
              <template v-else-if="con.prop=='quotePrice'">
                <template v-if="scope.row.biddingStrategy===4">
                  <el-input
                    v-model.trim.number="scope.row[con.prop]"
                    size="small"
                    @change="emitChange(scope.row,1)"
                    :disabled="!$permissionValidate(580)"
                  ></el-input>
                </template>
                <template v-else>{{scope.row.quotePrice}}</template>
              </template>
              <template
                v-else-if="con.prop=='grossProfit'"
              >{{scope.row[con.prop] && `${(scope.row[con.prop] * 100).toFixed(2)}%`}}</template>
              <template v-else>{{converData(scope.row[con.prop],con.prop)}}</template>
            </template>

            <template v-else>{{converData(scope.row[con.prop],con.prop)}}</template>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120" v-if="!(status==1 || status==2)">
        <template slot-scope="scope">
          <template>
            <el-button
              type="primary"
              size="small"
              :disabled="!(scope.row.hasChanged&&$permissionValidate(1031))"
              @click="updateQuoteItem(scope.row)"
            >保存</el-button>
            <el-button
              type="text"
              size="small"
              @click="deleteQuoteItem(scope.row)"
              v-if="$permissionValidate(581)"
            >删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="clearfix">
      <el-button
        type="primary"
        class="pull-right"
        @click="updateQuoteItem()"
        v-if="$permissionValidate(1031)&&(status===0 ||status == 3)"
      >保存当页</el-button>
      <el-button
        type="primary"
        class="pull-right"
        v-if="(status===0 ||status == 3)&&$permissionValidate(577)"
        @click="submitQuoteAudit"
      >{{status===0?'提交审批':'重新提交审批'}}</el-button>
      <el-button
        type="primary"
        class="pull-right"
        v-loading="requoteLoading"
        v-if="status == 2 && $permissionValidate(1033)"
        @click="requote"
      >重新报价</el-button>
    </div>
    <el-pagination
      :current-page="page.cur"
      :page-size="page.num"
      layout="total,prev, pager, next, sizes"
      :total="page.total"
      :page-sizes="page.sizes"
      class="center"
      @current-change="curChange"
      @size-change="sizeChange"
    ></el-pagination>

    <el-dialog
      :title="`商品匹配-${currentCustomSku.cusProuctName}`"
      v-model="visible"
      @before-close="skuSelectorDialogClose"
      size="large"
    >
      <sku-selector
        v-model="selectedSkuList"
        :tenant-id="tenantId"
        :office-id="officeId"
        :check-trial="false"
        :is-single="true"
        v-if="currentCustomSku"
        :key="currentCustomSku.id"
      ></sku-selector>
      <span slot="footer">
        <el-button type="text" @click="skuSelectorDialogClose">取消</el-button>
        <el-button type="primary" @click="matchQuoteItem">确认</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="新增报价商品"
      v-model="newQuoteItemVisible"
      @before-close="newQuoteItemDialogClose"
      size="large"
    >
      <association-product
        v-model="selectedSkuList"
        :tenant="{tenantId,tenantName}"
        :has-price="false"
      ></association-product>
      <span slot="footer">
        <el-button type="text" @click="skuSelectorDialogClose">取消</el-button>
        <el-button type="primary" @click="addNewQuoteItem">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Action, Getter } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import skuSelector from '../../components/skuSelector.vue'
import associationProduct from '../../components/associationProduct.vue'
import { isOriginalSku, associationAuditStatuses, agreePriceStatuses, quoteItemStatuses } from './const'
import { matchArrItem, formatPrice } from '../../utils'
import API from '../../API'

import { bmsMessage } from '../../plugins/bms'

@Component( {
  name: 'quote-detail',
  components: {
    lcTitle,
    lcCondition,
    skuSelector,
    associationProduct
    // lcTableConfig
  }
} )
export default class QuoteDetail extends Vue {
  @State( state => state.brand.brandList ) brandList
  @State( state => state.clientType ) clientType
  @Action( "brand/getAllBrands" ) getAllBrands
  @Getter( 'association/strategyLevel' ) strategyLevels
  @Action( 'association/getDefaultConfig' ) getDefaultConfig
  get justContent () {
    return !!this.clientType
  }
  created () {
    this.search()
    this.getDefaultConfig()
    let brand: any = this.condition[ 1 ]
    this.getAllBrands().then( () => brand.options = this.brandList )
  }
  @Watch( '$route', { deep: true } )
  routeWatcher () {
    // if(this.$route.path.indexOf('/vip/quoteDetail')>-1){

    // }
    this.search()
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
  newQuoteItemVisible: boolean = false
  newQuoteItemDialogOpen () {
    this.newQuoteItemVisible = true
  }
  newQuoteItemDialogClose () {
    this.selectedSkuList = []
    this.newQuoteItemVisible = false
  }
  addNewQuoteItem () {
    this.$permissionValidateWithNotify( 1032 )
    for ( let i = 0, l = this.selectedSkuList.length; i < l; i += 1 ) {
      let item = this.selectedSkuList[ i ]
      if ( item.isError ) {
        return this.$notify( {
          type: 'error',
          message: '所选商品中存在价格设置错误，请确认后提交'
        } )
      }
    }
    let option = {
      broadcast: true,
      bigCustomerQuoteId: this.bigCustomerQuoteId,
      skuList: this.selectedSkuList.map( ( { skuId, quotePrice } ) => ( {
        skuId, quotePrice
      } ) ),
      tenantId: this.tenantId
    }
    this.$http( API.addQuoteItem, option ).then( ( { data } ) => {
      this.search()
      this.newQuoteItemDialogClose()
    } )
  }
  selectScope: number = 0
  selectBrand: number = null
  selectItems: any[] = []
  selectionChange ( item ) {
    this.selectItems = item.map( v => v.id )
  }
  confirmBatchUpdateQuotePrice () {
    this.$permissionValidateWithNotify( 1034 )
    if ( ( this.biddingStrategy as any ) === '' || this.biddingStrategy === null || ( this.selectScope === 0 && !this.selectItems.length ) || ( this.selectScope == 2 && !this.selectBrand ) ) {
      return
    }
    this.$confirm( `此操作将修改${this.selectScope == 0 ? '选中商品' : this.selectScope == 1 ? '所有商品' : '选中品牌'}的报价, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.batchUpdateQuotePrice()
    } )
  }
  batchUpdateQuotePrice () {
    let o: any = {
      bigCustomerQuoteId: this.bigCustomerQuoteId,
      biddingStrategy: this.biddingStrategy,
      tenantId: this.tenantId
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
    this.$http( API.batchUpdateQuotePrice, o ).then( ( { data } ) => {
      this.search( this.page.cur )
    } )
  }
  submitQuoteAudit () {
    this.$http( API.updateQuoteStatus, {
      id: this.bigCustomerQuoteId,
      status: 1,
      tenantId: this.tenantId,
      broadcast: true
    } ).then( ( { data } ) => {
      this.$router.go( -1 )
      bmsMessage( {
        action: 'quoteSubmit',
        id: this.bigCustomerQuoteId,
        ...( data || {} )
      } )
    } )
  }
  biddingStrategy: number = null
  associationAuditStatuses = associationAuditStatuses
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
  get applyType () {
    return this.$route.query.applyType
  }
  cusConfig: any[] = [
    { prop: 'cusProuctName', label: '名称', width: '200' },
    { prop: 'cusBrandName', label: '品牌', width: '200' },
    { prop: 'cusSpecification', label: '规格', width: '200' },
    { prop: 'cusUnit', label: '单位', width: '' },
    { prop: 'cusReferencePrice', label: '参考价', width: '' },
  ]
  get lcConfig () {
    let lcConfig: any[] = [
      { prop: 'lcSkuCode', label: 'sku编码', width: '200' },
      { prop: 'lcSpuCode', label: 'spu编码', width: '200' },
      { prop: 'isOriginalSku', label: '是否原商品', width: '200', options: isOriginalSku },
      { prop: 'lcProductName', label: '名称', width: '200' },
      { prop: 'lcBrandName', label: '品牌', width: '' },
      { prop: 'lcSpecification', label: '规格', width: '200' },
      { prop: 'lcUnit', label: '单位', width: '' },
      { prop: 'salesGuidePriceStr', label: '销售底价', width: '200' },
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
    if ( this.status == 1 || this.status == 2 ) {
      lcConfig.push( { prop: 'agreePriceStatus', label: '审核状态', width: '200' } )
      lcConfig.push( { prop: 'agreePriceInvalidTime', label: '协议价到期日期', width: '200' } )
    }
    lcConfig.push( { prop: 'remark', label: '备注', width: '200' } )
    return lcConfig
  }
  myData: any[] = []
  page = {
    cur: 1,
    num: 20,
    total: 0,
    sizes: [ 20, 30, 40, 50 ]
  }
  get bigCustomerQuoteId () {
    return +this.$route.params.id
  }
  get status () {
    return +this.$route.query.status
  }
  get tenantName () {
    return this.$route.query.tenantName
  }
  get tenantId () {
    return this.$route.query.tenantId
  }
  get officeId () {
    return this.$route.query.officeId
  }
  curChange ( cur ) {
    this.search( cur )
  }
  sizeChange ( size ) {
    this.page.num = size
    this.search( 1 )
  }
  emitChange ( item, bo = true ) {
    this.$set( item, 'hasChanged', bo )
  }
  computeGetDataOption () {
    let o: any = {}
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    o.bigCustomerQuoteId = this.bigCustomerQuoteId
    this.condition.forEach( val => {
      let { value, key } = val
      o[ key ] = value
    } )
    o.unmatch = +o.unmatch
    o.notQuote = +o.notQuote
    return o
  }
  search ( cur = 1 ) {
    this.$permissionValidateWithNotify( 578 )
    this.page.cur = cur
    this.selectItems = []
    this.$http( API.getQuoteItemList, this.computeGetDataOption() ).then( ( { data } ) => {
      let { list = [], total = 0 } = data.data || {}
      if ( this.status == 0 ) { // 未提交
        this.myData = list.map( v => {
          let { biddingStrategy, memberPrice } = v

          if ( biddingStrategy !== 4 ) {
            let scale = ( this.strategyLevels[ biddingStrategy ] || {} ).value
            v.quotePrice = formatPrice( memberPrice * scale || 0, true )
          }
          if ( biddingStrategy === 5 ) {
            v.biddingStrategy = undefined
          }
          return v
        } )
      } else {
        this.myData = list
      }
      this.page.total = total
    }, () => {
      this.myData = []
      this.page.total = 0
    } )
  }

  currentCustomSku: any = {}
  selectedSkuList: any[] = []
  visible: boolean = false
  skuSelectorDialogOpen ( item ) {
    let { cusBrandName, cusProuctName, cusSpecification, lcProductName, lcSpecification, lcBrandId } = item
    let brandId = lcBrandId || this.converData( cusBrandName, this.brandList, 'name', 'id' )
    this.selectedSkuList = [ {
      brandId,
      productName: lcProductName || cusProuctName,
      skuName: lcSpecification || cusSpecification
    } ]
    this.currentCustomSku = item

    this.visible = true
  }
  skuSelectorDialogClose ( bo?) {
    this.selectedSkuList = []
    this.visible = false
    this.currentCustomSku = {}
  }
  matchQuoteItem () {

    let item = this.selectedSkuList[ 0 ]
    if ( !item ) {
      return this.$notify( {
        type: 'error',
        message: '请选择匹配的商品！'
      } )
    } else {
      let { lcSkuCode, lcSpuCode, name, brandName, specification, unit, bottomPrice, id, salesGuidePrice, salesPrice, memberPrice } = item
      this.$set( this.currentCustomSku, 'lcSpuCode', lcSpuCode )
      this.$set( this.currentCustomSku, 'lcSkuCode', lcSkuCode )
      this.$set( this.currentCustomSku, 'lcProductName', name )
      this.$set( this.currentCustomSku, 'lcBrandName', brandName )
      this.$set( this.currentCustomSku, 'skuId', id )
      this.$set( this.currentCustomSku, 'lcSpecification', specification )
      this.$set( this.currentCustomSku, 'lcUnit', unit )
      this.$set( this.currentCustomSku, 'salesGuidePrice', salesGuidePrice )
      this.$set( this.currentCustomSku, 'salesGuidePriceStr', salesGuidePrice )
      this.$set( this.currentCustomSku, 'salesPrice', salesPrice )
      this.$set( this.currentCustomSku, 'memberPrice', memberPrice )
      this.$set( this.currentCustomSku, 'quotePrice', '' )
      this.$set( this.currentCustomSku, 'grossProfit', '' )
      this.$set( this.currentCustomSku, 'grossProfit', '' )
      this.$set( this.currentCustomSku, 'biddingStrategy', undefined )
      this.emitChange( this.currentCustomSku )
      this.skuSelectorDialogClose()
    }
  }
  deleteQuoteItem ( item ) {
    this.$http( API.deleteQuoteItem, {
      id: item.id,
      broadcast: true
    } ).then( () => {
      let index = this.myData.indexOf( item )
      if ( index > -1 ) {
        this.myData.splice( index, 1 )
      }
    } )
  }
  updateQuoteItem ( item?) {
    // if ( quotePrice.length === 0 ) {
    //   this.$notify( {
    //     type: 'error',
    //     message: '请输入报价'
    //   } )
    //   return
    // }
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
    this.$http( API.updateQuoteItem, {
      quoteItemList: quoteItemList.map( ( { id, skuId, isOriginalSku, quotePrice, biddingStrategy } ) => ( { id, skuId, isOriginalSku, quotePrice, biddingStrategy } ) ),
      tenantId: this.tenantId,
      broadcast: true
    } ).then( ( { data } ) => {
      let list = data.data || []
      for ( let i = 0, l = list.length; i < l; i++ ) {
        let { id, grossProfit } = list[ i ]
        let o = this.myData.filter( v => v.id == id )[ 0 ] || {}
        if ( o.id == id ) {
          this.$set( o, 'grossProfit', grossProfit )
          this.emitChange( o, false )
        }
      }
      bmsMessage( {
        action: item ? 'quoteSave' : 'quoteSaveCurPage',
        id: this.bigCustomerQuoteId,
        ...( data || {} )
      } )
    } )
  }
  exportQuote () {
    this.$submit( API.exportExcelFile, { id: this.bigCustomerQuoteId } )
  }
  requoteLoading: boolean = false
  requote () {
    if ( this.requoteLoading ) return
    this.requoteLoading = true
    this.$http( API.requote, {
      bigCustomerQuoteId: this.bigCustomerQuoteId,
      broadcast: true
    } ).then( ( { data } ) => {
      this.requoteLoading = false
      let { bigCustomerQuoteId } = ( data.data || {} ) as any
      // this.$router.go(-1)
      if ( bigCustomerQuoteId ) {
        this.$router.replace( {
          path: `/vip/quoteDetail/${bigCustomerQuoteId}`,
          query: {
            ...this.$route.query,
            status: 0
          }
        } )
      }
    }, () => {
      this.requoteLoading = false
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-icon-search
  cursor pointer
  & + span
    color red
h4
  padding 10px 0
</style>

