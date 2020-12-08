.<template>
  <div id="standard-product-detail">
    <lc-title :text="`【${spu.name}】-标品管理`"></lc-title>
    <standard-spu
      :spu="spuBak"
      @save-spu="saveSpu"
      v-model="spu"
      :editable="$permissionValidate(512)"
    ></standard-spu>
    <standard-sku
      :sku="skuBak"
      @save-sku="saveSku"
      @add-sku="addSku"
      :editable="$permissionValidate(512)"
    ></standard-sku>
    <standard-image :spu="spu" :editable="$permissionValidate(512)"></standard-image>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import standardSpu from './components/standardSpu.vue'
import standardSku from './components/standardSku.vue'
import standardImage from './components/standardImage.vue'
import API from '../../API'
import { Object } from 'core-js';

@Component( {
  name: 'standard-product-detail',
  components: {
    lcTitle,
    standardSpu,
    standardSku,
    standardImage
  }
} )
export default class StandardProductDetail extends Vue {
  @Action( "category/getAllCategory2" ) getAllCategory
  @State( state => state.category.category2 ) allTypes
  @Action( "brand/getAllBrands" ) getAllBrands
  @State( state => state.brand.brandList ) brandList
  @Action( 'message/msgHandled' ) callBack
  product: any = {}
  get spu () {
    return this.product.spu || {}
  }
  spuBak: any = {}
  get sku () {
    return this.product.sku || []
  }
  skuBak: any[] = []

  activated () {
    this.getData()
  }
  get id () {
    return this.$route.params.id
  }
  @Inject() formatMyDate
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

      data.sku = data.sku.map( v => {
        let o: any = {}
        let expiration = v.expirationDate || {}
        let { time } = expiration
        if ( time ) {
          o.expirationDate = this.formatMyDate( new Date( time ) )
        }
        o.imgList = v.skuPicList
        return {
          ...v,
          contrastingRelations: JSON.parse( v.contrastingRelations || '[]' ),
          expirationDate: undefined,
          ...o
        }
      } )

      this.product = data
      this.skuBak = ( this.product.sku || [] ).map( v => ( { ...v } ) )
      this.spuBak = { ...data.spu }
    } )
  }
  saveSpu ( spu ) {

    let callBack = spu.callBack
    delete spu.callBack
    // 无内容修改 不保存
    let hasChanged = Object.keys( this.spu ).some( key => this.spu[ key ] !== spu[ key ] )
    if ( !hasChanged ) {
      callBack()
      return
    }
    this.$http( API.updateSpuPlatformAttributes, {
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
    let callBack = sku.callBack
    delete sku.callBack
    // 无内容修改 不保存
    let oldSku = this.sku.filter( v => v.id == sku.id )[ 0 ] || {}
    let hasChanged = Object.keys( oldSku ).some( key => oldSku[ key ] !== sku[ key ] )
    if ( !hasChanged ) {
      callBack()
      return
    }
    this.$http( API.updateSkuPlatformAttributes, {
      spu: this.product.spu,
      sku: [ sku ],
      broadcast: true
    } ).then( ( { data } ) => {
      let { type } = this.$route.query
      if ( type !== undefined ) {
        this.callBack( { id: sku.id, type } )
      }
      callBack()
    } )
  }
  addSku ( { sku, callBack } ) {
    this.$http( API.addSkuInfo, {
      ...sku,
      // name: sku.specification,
      name: this.spu.name,
      lcSpuCode: this.spu.lcCode,
      productId: this.id,
      goodLabel: 0
    } ).then( ( { data } ) => {
      let o: any = Object.assign(
        data.data,
        {
          contrastingRelations: sku.contrastingRelations,
          needAptitude: 0
        } )

      this.skuBak = this.skuBak.concat( o )
      this.product.sku = this.product.sku.concat( { ...o } )
      this.saveSku( { ...data.data, callBack } )
    } )
  }

}
</script>

