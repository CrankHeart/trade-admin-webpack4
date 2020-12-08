<template>
  <div class="product-detail">
    <lc-title text="商品详情"></lc-title>
    <detail-spu :spu="spu" class="detail-spu-margin"></detail-spu>
    <detail-sku :sku-list="sku"></detail-sku>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'

import lcTitle from "../../components/title.vue"
import detailSpu from './components/productDetailSpu.vue'
import detailSku from './components/productDetailSku.vue'
import API from '../../API'
@Component( {
  name: 'product-detail',
  components: {
    lcTitle,
    detailSpu,
    detailSku,
  }
} )
export default class ProductDetail extends Vue {
  @Action( 'message/msgHandled' ) callBack
  @Inject() formatMyDate
  sku: any[] = []
  spu: any = {}
  get id () {
    return this.$route.params.id
  }

  created () {
    // this.getDetail()
  }

  activated () {
    // this.getData()
    this.getDetail()
  }

  getDetail () {
    this.$permissionValidateWithNotify( 696 )
    if ( !this.id ) {
      return this.$notify( {
        type: 'error',
        message: '无法获取正确的商品id'
      } )
    }
    this.$http( API.getListOfCatalogSku, {
      catalogSpuId: this.id
    } ).then( ( { data } ) => {
      this.sku = []
      let product = data.data
      this.spu = product.spu || {}
      product.sku.forEach( v => {
        this.sku.push( {
          ...v,
          stockBak: v.stock
        } )
      } )
    } )
  }

}
</script>

<style lang="stylus" scoped>
.product-detail
  .detail-spu-margin
    margin-bottom 20px
</style>
