<template>
  <div class="product-detail">
    <LcTitle text="商品详情"></LcTitle>
    <DetailSpu :spu="spuBak" @save-spu="saveSpu" v-model="spu"></DetailSpu>
    <DetailSku :sku="skuBak" :spu="spu" :disabled="!!spuBak.trusteeshipStoreId" @save-sku="saveSku"></DetailSku>
    <DetailImage :spu="spu"></DetailImage>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Inject } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'

import LcTitle from '../../components/title.vue'
import DetailSpu from './components/detailSpu.vue'
import DetailSku from './components/detailSku.vue'
import DetailImage from './components/detailImage.vue'
import API from '../../API'

import { oversolds, findItem } from './const'

function rnd ( min: number, max: number ) {
  return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

@Component( {
  name: 'product-detail',
  components: {
    LcTitle,
    DetailSpu,
    DetailSku,
    DetailImage,
  }
} )
export default class ProductDetail extends Vue {
  @Inject() formatMyDate
  @Action( 'message/msgHandled' ) callBack
  product: any = {}
  spuBak: any = {}
  skuBak: any[] = []

  get id () {
    return this.$route.params.id
  }
  get spu () {
    let { spu = {}, vicePicList = [] } = this.product
    return Object.assign( spu, { imgList: vicePicList } )
  }
  get sku () {
    return ( this.product.sku || [] )
  }

  activated () {
    this.getData()
  }

  getData () {
    if ( !this.id ) {
      return this.$notify( {
        type: 'error',
        message: '无法获取正确的标品商品id'
      } )
    }
    // getProductExtroInfoList
    this.$http( API.getProductExtroInfoList, {
      id: this.id
    } ).then( ( { data } ) => {
      let sku = ( data.sku || [] ).map( item => {
        let o: any = {}
        let expiration = item.expirationDate || {}
        let { time } = expiration
        if ( time ) {
          o.expirationDate = this.formatMyDate( new Date( time ) )
        }
        o.stockBak = item.stock
        o.imgList = item.skuPicList
        // TODO 下期迭代使用 历史数据处理：订购商品:0为不限购purchaseLimit:-1  常备商品为:1 允许在途时超卖oversold:1，
        let { goodLabel, purchaseLimit, oversold } = item;

        console.log( 1, "goodLabel:", goodLabel, "purchaseLimit:", purchaseLimit, "oversold:", oversold, );


        let switchValue = false; // 是否限购 默认false 不限购
        // 下期迭代使用
        // 订购商品:0 数据结构:【goodLabel:0,purchaseLimit:[-1,N),oversold = ""】
        if ( goodLabel == 0 ) {
          if ( purchaseLimit === undefined ) {
            // 订购商品限购数量：-1表示不限购    
            purchaseLimit = -1;
          }
          // 不限购 
          if ( purchaseLimit === -1 ) {
            switchValue = false;
            purchaseLimit = "";
          } else {
            // 限购
            switchValue = true;
          }
          // switchValue = purchaseLimit === -1 ? false : true;
          // // 限购
          // if ( switchValue ) {
          //   purchaseLimit = "";
          // }
          // 数据初始化
          oversold = ""
        } else {
          // 常备商品为:1 数据结构:【goodLabel:1,oversold:[0,1,2,3],purchaseLimit = ""】
          if ( oversold === undefined ) {
            oversold = 1; // 允许在途时超卖:1
          }
          // 数据初始化
          purchaseLimit = "";
        }

        item.oversold = oversold;
        item.switchValue = switchValue;
        item.oldPurchaseLimit = purchaseLimit;
        item.purchaseLimit = purchaseLimit;

        console.log( 2, "goodLabel:", goodLabel, "purchaseLimit:", purchaseLimit, "oldPurchaseLimit:", item.oldPurchaseLimit, "oversold:", oversold, );
        return {
          ...item,
          contrastingRelations: JSON.parse( item.contrastingRelations || '[]' ),
          expirationDate: undefined,
          ...o
        }
      } )

      data.sku = sku;
      // data.spu.trusteeshipStoreId = data.spu.trusteeshipStoreId || 0
      this.product = data
      // 清洗数据
      // console.log( "清洗数据", sku );
      // console.log( "this.product.sku:", this.product.sku );
      // this.skuBak = ( this.product.sku || [] ).map( v => ( { ...v } ) )
      this.skuBak = JSON.parse( JSON.stringify( sku ) );
      // aptitudeStatus 商品资质是否有效：0 - 无效；1 - 有效
      // this.spuBak = { ...data.spu, imgList: data.vicePicList, aptitudeStatus: Math.random() > 0.5 }
      this.spuBak = { ...data.spu, imgList: data.vicePicList }
    } )
  }
  saveSpu ( spu ) {
    let callBack = spu.callBack || ( () => { } )
    delete spu.callBack
    // 无内容修改 不保存

    // let hasChanged = Object.keys( spu ).some( key => this.spu[ key ] !== spu[ key ] )
    // if ( !hasChanged ) {
    //   callBack()
    //   return
    // }
    this.$http( API.updateSpuStoreAttributes, {
      spu,
      broadcast: true
    } ).then( res => {
      let { type } = this.$route.query
      Object.assign( this.spu, spu )
      if ( type !== undefined ) {
        this.callBack( { id: spu.id, type } )
      }
      callBack()
    } )
  }
  saveSku ( sku ) {
    let callBack = sku.callBack || ( () => { } )
    delete sku.callBack
    // 无内容修改 不保存
    let oldSku = this.sku.filter( v => v.id == sku.id )[ 0 ] || {}

    this.$http( API.updateSkuStoreAttributes, {
      spu: this.product.spu,
      sku: [ sku ],
      broadcast: true
    } ).then( ( { data } ) => {
      this.skuBak.forEach( v => {
        if ( sku.id == v.id ) {
          v.stockBak = +sku.stock
        }
      } )

      let { type } = this.$route.query

      console.log( "type:", this.$route.query, type );

      Object.assign( oldSku, sku )
      if ( type !== undefined ) {
        this.callBack( { id: sku.id, type } )
      }
      callBack()
    } )
  }
}
</script>
