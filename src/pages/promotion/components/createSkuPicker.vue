<template>
  <div class="promotion-create-sku-picker box">
    <h3>选择SKU商品</h3>
    <hr />
    <sku-selector v-model="value.brandProducts" :check-trial="checkTrialStatus" :total-sku="value.brandProducts" :short-cut="false" :disabled="disabled">
      <slot></slot>
    </sku-selector>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import skuSelector from '../../../components/skuSelector.vue'
@Component( {
  name: 'promotion-create-sku-picker',
  components: {
    skuSelector
  }
} )
export default class PromotionCreateSkuPicker extends Vue {
  // { label: '限时特价', status: 2 },
  // { label: '可试用', status: 1 }
  @Prop( { default: true } )
  checkTrialStatus: boolean
  @Prop()
  disabled: boolean
  @Prop( { default: () => { } } )
  value: any
  validate () {
    return !!this.value.brandProducts.length
  }

  decodeProduct ( brandProducts ) {
    let products = []
    brandProducts.forEach( value => {
      let { id, spu, type, name } = value
      let brandId = id
      if ( !type ) {
        products.push( { brandId, type: 'brand', name } )
      } else {
        spu.forEach( val => {
          let { id, type, sku, name } = val
          let productId = id
          if ( !type ) {
            products.push( { productId, brandId, type: 'spu', name } )
          } else {
            sku.forEach( ( { id, name } ) => {
              products.push( { productId, brandId, id, name } )
            } )
          }
        } )
      }
    } )
    return products
  }
  encodeProduct ( brandProducts ) {

    let products = {}
    brandProducts.forEach( val => {
      let { id, productId, brandId, name } = val
      if ( brandId ) {
        products[ brandId ] = products[ brandId ] || { name }
      }
      if ( productId ) {
        products[ brandId ][ productId ] = products[ brandId ][ productId ] || { name }
      }
      if ( id ) {
        products[ brandId ][ productId ][ id ] = val
      }
    } )

    return Object.keys( products ).reduce( ( total, next ) => {
      let o: any = {}
      o.id = next
      let brandData = products[ next ]
      o.type = +!!( Object.keys( brandData ).length - 1 )

      if ( o.type ) {
        o.spu = Object.keys( brandData ).filter( v => v !== 'name' ).map( val => {
          let spuData = brandData[ val ]
          let spu: any = {}
          spu.id = val
          spu.type = +!!( Object.keys( spuData ).length - 1 )

          if ( spu.type ) {
            spu.sku = Object.keys( spuData ).filter( v => v !== 'name' ).map( v => ( {
              id: spuData[ v ].id,
              name: spuData[ v ].specification
            } ) )
          } else {
            spu.name = spuData.name
          }
          return spu
        } )
      } else {
        o.name = brandData.name
      }
      total.push( o )
      return total
    }, [] )
  }
}
</script>