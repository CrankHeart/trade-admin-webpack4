<template>
  <el-col :span="+moduleData.floorLayout || 24" class="time-limit-box">
    <div class="time-limit-img pull-left">
      <img v-if="moduleData.image" :src="moduleData.image">
      <img v-else src="../../assets/time-limit-banner.jpg">
    </div>
    <el-carousel height="350px" :arrow="'always'" :autoplay="false" indicator-position="none">
      <el-carousel-item v-for="(item,index) in otherProductsContainers" :key="index">
        <el-col :span="(24/moduleData.column)" v-for="(itemList,i) in item" :key="i">
          <product-item-have-time-limit :data="itemList" :moduleData="moduleData"></product-item-have-time-limit>
        </el-col>
      </el-carousel-item>
    </el-carousel>
    <slot></slot>

  </el-col>
</template>
<script>
import templateMixins from '../templateMixins'
import timeLimitPriceView2 from './timeLimitPriceView2'
import productItemHaveTimeLimit from '../../components/pc/productItemHaveTimeLimit'

export default {
  name: 'time-limit-price',
  components: {
    productItemHaveTimeLimit
  },
  mixins: [ templateMixins, timeLimitPriceView2 ],
  data () {
    return {
      initModuleData: {},
      extendProps: [ { prop: 'image', label: '图片显示', type: 'fileUpload' } ],
      curTab: null,
      productConfig: [
        { label: '图片', prop: 'goodsImage', type: 'upload' },
        { label: 'spu', prop: 'goodsName', type: 'text' },
        { label: 'sku', prop: 'specification', type: 'text' },
        { label: '原价', prop: 'goodsPrice', type: 'text' },
        { label: '现价', prop: 'realPrice', type: 'text' }
      ]
    }
  },
  computed: {
    otherProducts () {
      let a = []
      let length = this.moduleData.floorProducts && this.moduleData.floorProducts.length
      for ( let i = 0; i < ( length / 4 ); i++ ) {
        let array = []
        for ( let j = 0; j < 4; j++ ) {
          array.push( this.moduleData.floorProducts[ ( 4 * i + j ) ] )
        }
        a.push( array )
      }
      return a
    },
    floorContainers () {
      return this.moduleData.floorContainers || {}
    },
    otherProductsContainers () {
      let a = []
      let length = this.floorContainers && this.floorContainers.length
      for ( let i = 0; i < ( length / 4 ); i += 1 ) {
        let array = []
        for ( let j = 0; j < 4; j += 1 ) {
          let o = this.floorContainers[ ( 4 * i + j ) ]
          if ( o ) {
            array.push( { ...JSON.parse( this.floorContainers[ ( 4 * i + j ) ].containerInfo || '{}' ), ...this.floorContainers[ ( 4 * i + j ) ] } )
          }
        }
        a.push( array )
      }
      return a
    },
    titleContainer () {
      // return JSON.parse(this.floorContainers)
      return this.floorContainers[ 0 ]
    },
    floorLayoutDetail () {
      return this.moduleData.floorLayoutDetail || {}
    },
    column () {
      return 4
    }
  }
}
</script>
