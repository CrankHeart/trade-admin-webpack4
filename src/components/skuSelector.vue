<template>
  <div class="sku-selector">
    <el-row :gutter="10" type="flex">
      <el-col :span="6">
        <h5>
          选择品牌
          <fast-search @fast-search="fastSearchBrand" :basic-list="myBrandList" prop-name="name" key="brand"></fast-search>
        </h5>
        <div class="box">
          <ul>
            <li v-for="brand in filterBrand" :key="brand.id" :class="{'is-active':curBrand&&curBrand.id==brand.id}" @click="getSpuByBrand(brand)">
              [{{brand.id}}] {{brand.name.split(/\//)[0]}}
              <span v-if="brand.selectedNum">({{brand.selectedNum}})</span>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="6">
        <h5>
          <el-tooltip content="全选当前品牌下所有商品" placement="top">
            <el-checkbox v-model="isSpuListAll" @change="selectSpuAll(curBrand)" v-if="shortCut" :disabled="!spuList.length || disabled" />
          </el-tooltip>
          选择SPU({{spuList.length}})
          <fast-search @fast-search="fastSearchSpu" :basic-list="spuList" :prop-name="['productName','lcCode']" key="spu"></fast-search>
        </h5>
        <div class="box">
          <ul>
            <li v-for="spu in filterSpu" :key="spu.productId" :class="{'is-active':curSpu==spu}" @click="getSkuListBySpuId(spu)">
              <template v-if="shortCut">
                <el-checkbox v-model="spu.isSelected" @change="selectSpu(spu)" :key="spu.productId" :disabled="disabled" />
              </template>
              {{spu.productName}}-[{{spu.lcCode}}]
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="6">
        <h5>
          <el-tooltip content="全选当前SPU下所有商品" placement="top">
            <el-checkbox v-model="curSpu.isSelected" @change="selectSpu(curSpu)" v-if="shortCut" :disabled="!skuList.length || disabled" />
          </el-tooltip>
          选择SKU({{skuList.length}})
          <fast-search @fast-search="fastSearchSku" :basic-list="skuList" :prop-name="['specification','lcSkuCode']" key="sku"></fast-search>
        </h5>
        <div class="box" v-loading="skuLoading">
          <ul>
            <li v-for="sku in filterSku" :key="sku.id">
              <el-checkbox v-model="sku.isSelected" @change="selectSku(sku)" :disabled="checkSkuDisabled(sku)" :key="sku.id">
                <el-tooltip :content="`${checkSkuTrial(sku).map(v=>v.label).join(',')}`" placement="top" v-if="checkSkuTrial(sku).map(v=>v.label).join(',')">
                  <i class="el-icon-information"></i>
                </el-tooltip>
                {{sku.specification}}-[{{sku.lcSkuCode}}]
              </el-checkbox>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="6">
        <h5>已选SKU ({{selectedSkuList && selectedSkuList.length || 0}}件)</h5>
        <div class="box">
          <ul>
            <li v-for="(item,index) in selectedSkuList" :key="item.id">
              <i class="el-icon-circle-close" @click="removeItem(index)"></i>
              [{{item.id || item.productId}}]-
              <!-- <router-link :to="`/product/detail/${item.goodsId}`" class="el-icon-information" tag="i" v-if="item.goodsId"></router-link> -->
              {{formatName(item)}}
            </li>
          </ul>
        </div>
      </el-col>
      <slot></slot>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { State, Mutation, Action, Getter } from 'vuex-class'
import API from '../API/'
import fastSearch from './fastSearch.vue'

@Component( {
  name: 'sku-selector',
  components: {
    fastSearch
  }
} )
export default class SkuSelector extends Vue {
  // 是否检查商品是否参加其他活动
  @Prop( { default: true } )
  checkTrial: boolean
  @Prop( { default: undefined } )
  tenantId: string
  @Prop( { default: undefined })
  officeId:string
  // 快捷方式 spu是否可选
  @Prop( { default: false } )
  shortCut: boolean
  @Prop( { default: () => [] } )
  totalSku: any[]
  @Prop( { default: false } )
  disabled: boolean
  @Prop()
  value: any[]
  @Prop( { default: false } )
  isSingle: boolean
  get shouldInit () {
    return this.isSingle
  }
  @Watch( 'value' )
  valueWatcher ( v, o ) {
    if ( v !== o ) {
      this.skuList = []
    }
  }
  @State( state => state.brand.brandList ) brandList
  @Action( 'brand/getAllBrands' ) getAllBrands
  created () {
    this.getAllBrands().then( () => {
      if ( this.shouldInit ) {
        this.initSelector()
      }
    } )
  }
  initSelector () {
    if(!this.value.length){
      return
    }
    let { brandId, productId, skuId, productName, skuName } = this.value.shift() 
    let brand = this.brandList.filter( brand => brand.id == brandId )[ 0 ]

    if ( brand ) {
      this.getSpuByBrand( brand ).then( () => {
        let spu
        if ( productName ) {
          spu = this.spuList.filter( item => item.productName == productName )[ 0 ]
        } else {
          spu = this.spuList.filter( item => item.productId == productId )[ 0 ]
        }
        if ( spu ) {
          this.getSkuListBySpuId( spu ).then( () => {
            let sku
            if ( skuName ) {
              sku = this.skuList.filter( item => item.specification == skuName )[ 0 ]
            } else {
              sku = this.skuList.filter( item => item.id == skuId )[ 0 ]
            }
            if ( sku ) {
              this.selectSku( sku )
            }
          } )
        }
      } )
    }
  }
  checkSkuTrial ( sku: any ) {
    if ( this.checkTrial ) {
      let validator = [
        { label: '限时特价', status: 2 },
        { label: '可试用', status: 1 }
      ]
      return validator.map( v => ( {
        ...v,
        isActive: v.status & sku.trialStatus
      } ) ).filter( v => v.isActive )
    }
    return []
  }
  checkSkuDisabled ( sku: any ) {
    // 检测是否可以选择
    let trialStatusDisabled = !!this.checkSkuTrial( sku ).length
    return sku.isDisabled || this.disabled || trialStatusDisabled
  }

  get myBrandList () {
    return this.brandList.map( v => ( { ...v, isSelected: false } ) )
  }
  searchBrandResult: any[] = []
  fastSearchBrand ( v ) {
    this.searchBrandResult = v
  }
  get filterBrand () {
    return ( this.searchBrandResult.length && this.searchBrandResult ) || this.myBrandList
  }

  spuList: any[] = []
  skuList: any[] = []
  searchSpuResult: any[] = []
  searchSkuResult: any[] = []

  brandSpuBak: any = {}
  spuSkuBak: any = {}

  fastSearchSpu ( v ) {
    this.searchSpuResult = v
  }
  fastSearchSku ( v ) {
    this.searchSkuResult = v
  }
  get filterSpu () {
    return ( this.searchSpuResult.length && this.searchSpuResult ) || this.spuList
  }
  spuPage = {
    total: 0,
    cur: 1,
    num: 10
  }
  spuPageChange ( v ) {
    this.spuPage.cur = v
  }
  get splitFilterSpu () {
    this.spuPage.total = this.filterSpu.length
    let { cur, num } = this.spuPage
    let start = ( cur - 1 ) * num
    return this.filterSpu.slice( start, start + num ) || []
  }
  get filterSku () {
    return ( this.searchSkuResult.length && this.searchSkuResult ) || this.skuList
  }
  curBrand: any = {}
  curSpu: any = {}
  getSpuByBrand ( brand ) {
    this.curBrand = brand
    // this.$set( brand, 'isSelected', brand.isSelected || false )
    this.skuList = []
    let brandId = brand.id
    let promise
    this.isSpuListAll = false
    if ( this.brandSpuBak[ brandId ] ) {
      promise = Promise.resolve( this.brandSpuBak[ brandId ] )
    } else {
      promise = this.$http( API.getProductByBrandId, { brandId: brand.id } ).then( ( { data } ) => {
        let productList = data.productList.map( v => ( { ...v, brandId, isSelected: false } ) )
        this.$set( this.brandSpuBak, brandId, productList )
        return productList
      } )
    }
    return promise.then( ( productList ) => {
      this.searchSpuResult = []
      this.spuList = productList
      this.getSpuByBrandCallBack()
    } )
  }
  getSpuByBrandCallBack () {
    this.spuList.forEach( val => {
      val.isSelected = this.selectedSkuList.some( v => v.productId == val.productId && v.type == 'spu' )
    } )
    this.isSpuListAll = this.spuList.every( v => v.isSelected )
    // let { id } = this.curBrand
    // this.curBrand.isSelected = this.selectedSkuList.some( v => v.brandId == id && v.type == 'brand' )

    // this.spuList.forEach( val => {
    //   val.isSelected = this.curBrand.isSelected || this.selectedSkuList.some( v => v.productId == val.productId && v.type == 'spu' )
    // } )
  }
  skuLoading: boolean = false
  getSkuListBySpuId ( spu: any = {} ) {
    let spuId = ( this.curSpu = spu ).productId
    this.skuList = []
    this.skuLoading = true
    let promise

    if ( this.spuSkuBak[ spuId ] ) {
      this.skuLoading = false
      promise = Promise.resolve( this.spuSkuBak[ spuId ] )
    } else {
      promise = this.$http( API.getSkuListBySpuId, {
        spuId,
        tenantId: this.tenantId,
        officeId: this.officeId
      } ).then( ( { data } ) => {
        let skuList = data.data.filter( item => !item.goodStatus ).map( ( val: any ) => ( {
          ...val,
          salesLimitNum:val.salesLimitNum || '', // 限购数量默认值
          level1Price:val.level1Price, // B价格
          themeEventPrice: '',
          isSelected: this.totalSku.some( v => v.skuId == val.id ),
          skuId: val.id,
          spuId: val.productId,
          brandId: spu.brandId,
          isDisabled: this.totalSku.some( v => v.skuId == val.id )
            && this.selectedSkuList.every( v => v.skuId !== val.id )
        } ) )
        this.$set( this.spuSkuBak, spuId, skuList )
        this.skuLoading = false
        return skuList
      } )
    }

    return promise.then( ( skuList ) => {
      this.skuList = skuList

      this.getSkuListBySpuIdCallBack()

    }, () => {
      this.skuList = []
    } )
  }

  getSkuListBySpuIdCallBack () {
    this.skuList.forEach( val => {
      val.isSelected = this.curSpu.isSelected || this.selectedSkuList.some( v => v.id == val.id )
    } )
  }

  selectSku ( sku ) {
    if ( this.isSingle ) {
      let item
      let isSelected = sku.isSelected
      while ( item = this.selectedSkuList.pop() ) {
        item.isSelected = false
      }
      if( isSelected ){
        sku.isSelected = true
      }
    }
    if ( sku.isSelected ) {
      this.selectedSkuList.push( sku ) // 这里新注入输入框等变量
      let { productId } = sku
      this.curSpu.isSelected = this.spuSkuBak[ productId ].every( v => v.isSelected )
    } else {
      let index
      for ( let i = 0, l = this.selectedSkuList.length; i < l; i++ ) {
        let skuInList = this.selectedSkuList[ i ]
        if ( sku.id == skuInList.id ) {
          index = i
          break
        }
      }
      if ( index > -1 ) {
        this.selectedSkuList.splice( index, 1 )
      } else {

      }
      this.curSpu.isSelected = false
    }
    if ( !this.disabled ) {
      this.selectSpu( this.curSpu, true )
    }
  }
  selectSpu ( spu: any = {}, isFromChild = false /* 是否是来自于sku的更新 */ ) {
    let { productId, brandId, isSelected, productName } = spu
    if ( !isFromChild ) {
      let spuSkuBak = this.spuSkuBak[ productId ] || []
      spuSkuBak.forEach( sku => {
        sku.isSelected = isSelected
      } )
    }

    if ( productId ) {
      this.clearSelectedSkuList( productId, 'productId', true )
    }
    if ( isSelected && this.shortCut ) {
      this.selectedSkuList.push( {
        type: 'spu',
        productId,
        name: productName,
        brandId
      } )
    } else {
      // this.selectedSkuList.push( ...this.skuList.filter( val => val.isSelected && this.selectedSkuList.every( v => v.id !== val.id ) ) )
      let selectAllTemp = this.skuList.filter( val => val.isSelected && this.selectedSkuList.every( v => v.id !== val.id ) )
      this.selectedSkuList.push( ...selectAllTemp )
    }
    this.isSpuListAll = this.spuList.every( v => v.isSelected )
    // this.selectSpuAll()
  }
  isSpuListAll: boolean = false
  selectSpuAll () {
    this.spuList.forEach( spu => {
      spu.isSelected = this.isSpuListAll
    } )
    this.spuList.forEach( spu => {
      this.selectSpu( spu )
    } )
  }
  // selectSpuAll ( brand: any = {}, isFromChild = false ) {
  //   let { id, name, isSelected } = brand
  //   let brandSpuBak = this.brandSpuBak[ id ] || []
  //   if ( !isFromChild ) {
  //     brandSpuBak.forEach( spu => {
  //       spu.isSelected = isSelected
  //     } )
  //     this.skuList.forEach( sku => {
  //       sku.isSelected = isSelected
  //     } )
  //   } else {
  //     brand.isSelected = this.spuList.every( v => v.isSelected )
  //   }

  //   if ( this.curBrand.isSelected ) {
  //     this.clearSelectedSkuList( id, 'brandId', true )
  //     this.selectedSkuList.push( {
  //       type: 'brand',
  //       brandId: id,
  //       name
  //     } )
  //   } else {
  //     this.clearSelectedSkuList( id, 'brandId' )
  //     this.selectedSkuList.push( ...brandSpuBak.filter( val => val.isSelected && this.selectedSkuList.every( v => v.productId !== val.productId
  //     ) ).map( v => ( {
  //       type: 'spu',
  //       productId: v.productId,
  //       name: v.productName,
  //       brandId: id
  //     } ) ) )
  //   }
  // }

  clearSelectedSkuList ( id, type, isAll = false ) {
    for ( let i = this.selectedSkuList.length - 1; i >= 0; i-- ) {
      let item = this.selectedSkuList[ i ]
      if ( item[ type ] == id && ( item.type == 'brand' || item.type == 'sku' || isAll ) ) {
        this.selectedSkuList.splice( i, 1 )
      }
    }
  }
  skuPage = {
    total: 0,
    cur: 1,
    num: 10
  }
  removeItem ( index ) {
    if ( index < 0 || this.disabled ) {
      return false
    }
    let item = this.selectedSkuList[ index ]
    // if ( item.type == 'brand' ) {
    //   let { brandId, name } = item
    //   let matchedBrand = {}
    //   this.myBrandList.forEach( brand => {
    //     if ( brand.id == brandId ) {
    //       matchedBrand = brand
    //     }
    //   } )
    //   // this.selectSpuAll( Object.assign( matchedBrand, { isSelcted: false } ) )
    //   this.selectSpuAll()
    // } else 
    if ( item.type == 'spu' ) {
      let { brandId, productId, name } = item
      let bak = this.brandSpuBak[ brandId ] || []
      let matchedSpu = {}
      bak.forEach( spu => {
        if ( spu.productId == productId ) {
          matchedSpu = spu
        }
      } )
      this.selectSpu( Object.assign( matchedSpu, { isSelected: false } ) )
    } else {
      // item.isSelected = false
      this.selectSku( Object.assign( item, { isSelected: false } ) )
      // this.selectedSkuList.splice( index, 1 )

    }

  }
  get selectedSkuList () {
    return this.value || []
  }
  set selectedSkuList ( v ) {
    this.$emit( 'input', v )
  }

  formatName ( item ) {
    if ( item.type == 'spu' || item.type == 'brand' ) {
      return `[${item.type}]-${item.name}`
    } else {
      return `[sku]-${[ item.name, item.specification ].join('-')}`
    }
  }
}
</script>
<style lang="stylus" scoped>
h5
  display flex
.sku-selector
  height 400px
  li
    padding 0 5px
    [class*='close']
      opacity 0
      float right
      line-height 30px
    &:hover
      [class*='close']
        opacity 1
        position relative
        z-index 999
  overflow hidden
  .el-row
  .el-col
    height 100%
  .el-col
    display flex
    flex-direction column
    h5
      line-height 30px
      height 30px
      flex-shrink 0
      flex-grow 0
    .box
      flex-grow 1
      overflow auto
      line-height 30px
      z-index 999
      li
        cursor pointer
        white-space nowrap
        &:hover
        &.is-active
          background #20a0ff
          color #fff
          // text-indent 1em
        & +li
          border-top 1px solid #eee
    .el-pagination
      height 30px
      flex-shrink 0
      margin-top 5px
</style>
<style lang="stylus">
// .sku-selector
//   .el-checkbox__inner
//     position static
//   .el-checkbox__input
//     position static
//   .el-checkbox
//     position static
</style>
