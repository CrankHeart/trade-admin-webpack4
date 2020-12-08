<template>
  <div class="promotion-selector">
    <h3>
      {{typeName}}
      <el-input
        v-model.trim="promotionName"
        size="small"
        icon="search"
        :on-icon-click="promotionSearch"
        placeholder="输入促销名称进行搜索"
      ></el-input>
    </h3>
    <el-row :gutter="30">
      <el-col :span="8">
        <h5>
          <el-pagination
            class="pull-right"
            small
            layout="prev,next"
            :total="promotionListPage.total"
            :page-size="promotionListPage.num"
            @current-change="promotionPageChange"
          ></el-pagination>促销列表
        </h5>
        <div class="box">
          <ul>
            <li
              v-for="promotion in promotionList"
              :key="promotion.id"
              @click="selectPromotion(promotion)"
              :class="{'is-active':curPromotion == promotion}"
            >{{promotion.name}}</li>
          </ul>
        </div>
      </el-col>

      <el-col :span="8">
        <h5>
          <el-pagination
            class="pull-right"
            small
            layout="prev,next"
            :total="productListPage.total"
            :page-size="productListPage.num"
            @current-change="productPageChange"
          ></el-pagination>
          <el-checkbox v-model="productAll" @change="productAllChange"></el-checkbox>商品列表
        </h5>
        <div class="box">
          <ul>
            <li v-for="product in productList" :key="product.skuId">
              <el-checkbox v-model="product.checked" @change="productCheckedChange(product)">
                {{product.name||product.goodsName}}-
                {{product.specification}}
              </el-checkbox>
            </li>
          </ul>
        </div>
      </el-col>

      <el-col :span="8">
        <h5>已选商品</h5>
        <div class="box">
          <ul>
            <li v-for="(product,index) in selectedProduct" :key="product.skuId">
              <i class="el-icon-circle-cross pull-right" @click="delProduct(index)"></i>
              {{product.name||product.goodsName}}-
              {{product.specification}}
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { types } from '../../promotion/const'
import { matchArrItem } from '../../../utils'
import API from '../../../API'
@Component( {
  name: 'promotion-selector'
} )
export default class PromotionSelector extends Vue {
  @Prop()
  type: number
  @Prop( { default: () => [] } )
  value: any[]
  get promotionType () {
    switch ( this.type ) {
      case 1: // '限时促销'
        return '4'
      case 4: // '满赠' 
        return '2'
      case 5: // '满减'
        return '1'
      case 6: // '折扣'
        return '0'
    }
  }
  get typeName () {
    return matchArrItem( this.promotionType, types, 'id' ).name
  }
  created () {
    this.getPromotionList()
    this.selectedProduct = this.value.concat()
  }
  curPromotion: any = null
  promotionList: any[] = []
  promotionListPage = {
    cur: 1,
    total: 0,
    num: 10
  }

  promotionPageChange ( cur ) {
    this.promotionListPage.cur = cur
    this.getPromotionList()
  }
  promotionSearch () {
    this.promotionPageChange( 1 )
  }
  promotionBak: any = {}
  promotionName: string = ''
  getPromotionList () {
    let o: any = {
      type: this.promotionType,
      state: 0
    }
    let { num, cur } = this.promotionListPage
    o.size = num
    o.pos = ( cur - 1 ) * num
    o.name = this.promotionName || undefined
    this.$http( API.promotion, o ).then( ( { data } ) => {
      let { promotions, total } = data
      this.promotionList = promotions
      this.promotionListPage.total = total
      promotions.forEach( ( { id, title, name } ) => {
        this.$set( this.promotionBak, id, { id, title, name } )
      } )
    }, () => {
      this.promotionList = []
      this.promotionListPage.total = 0
    } )
  }
  productAll: boolean = false
  selectPromotion ( promotion ) {
    this.curPromotion = promotion
    this.productListPage.cur = 1
    this.getPromotionProduct( promotion.id )
  }
  getPromotionProduct ( discountId ) {
    let { cur, num } = this.productListPage
    let start = ( cur - 1 ) * num
    this.$http( API.getPromotionProduct, { discountId, start, num } ).then( ( { data = {} } ) => {
      let { list, total } = ( data as any )
      this.productList = list.map( v => ( {
        ...v,
        themeEventPrice: v.price,
        checked: this.isInSelectedProduct( v.skuId ),
        promotionId: discountId
      } ) )
      this.productListPage.total = total
      this.productAll = this.productList.every( v => v.checked )
    } )
  }
  productList: any[] = []
  productListPage = {
    cur: 1,
    total: 0,
    num: 10
  }
  selectedProduct: any[] = []
  @Watch( 'selectedProduct', { deep: true } )
  selectedProductWatcher ( list ) {
    this.$emit( 'input', list )
    let promitionIds = {}
    list.forEach( ( { promotionId } ) => promitionIds[ promotionId ] = true )
    this.$emit( 'change', Object.keys( promitionIds ).map( v => this.promotionBak[ v ] ) )
  }
  delProduct ( index ) {
    this.selectedProduct.splice( index, 1 )
  }
  isInSelectedProduct ( skuId ) {
    return this.selectedProduct.some( val => val.skuId == skuId )
  }
  productPageChange ( cur ) {
    this.productListPage.cur = cur
    this.getPromotionProduct( this.curPromotion.id )
  }

  productAllChange ( checked ) {
    // this.selectedProduct = this.selectedProduct.filter(v=>)
    this.productList.forEach( v => {
      v.checked = this.productAll
      this.productCheckedChange( v, false )
    } )
  }
  productCheckedChange ( product, checkAll = true ) {
    let { checked, skuId } = product
    if ( checked ) {
      if ( !this.isInSelectedProduct( skuId ) ) {
        this.selectedProduct.push( product )
      }
    } else {
      this.selectedProduct = this.selectedProduct.filter( v => v.skuId !== product.skuId )
    }
    if ( checkAll ) {
      this.productAll = this.productList.every( v => v.checked )
    }
  }
}
</script>
<style lang="stylus" scoped>
.box
  height 300px
h3
  .el-input
    display inline-block
    width 300px
h5
  line-height 30px
  .el-pagination
    margin-top 0
    height 26px
    overflow hidden
li
  line-height 30px
  padding 0 10px
  margin 0 -10px
  &.is-active
    background #4db3ff
    color #ffffff
</style>
