<template>
  <el-dialog v-model="visible" class="floor-list-config" :before-close="dialogClose" title="选择列表配置">

    <sku-selector v-model="curList" :total-sku="totalSku" :disabled="disabled" :check-trial="false" v-if="type==0"></sku-selector>

    <event-selector v-model="curList" :config="productConfig" :theme-event-id="themeEventId" :disabled="disabled" v-else-if="type==3"></event-selector>

    <promotion-selector v-model="curList" :disabled="disabled" v-else :type="type" :key="type" @change="promotionChange"></promotion-selector>

    <div slot="footer">
      <el-button @click="dialogClose">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>

  </el-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import skuSelector from '../../../components/skuSelector.vue'
import eventSelector from './eventSelector.vue'
import promotionSelector from './promotionSelector.vue'
import { floorTypes, themeEventModes, templateTypes } from '../const'

@Component( {
  name: 'floor-container-config',
  components: {
    skuSelector,
    eventSelector,
    promotionSelector
  }
} )
export default class FloorContainerConfig extends Vue {
  @Prop()
  type: number
  options = {
    floorTypes,
    templateTypes
  }
  myData: any = {}
  @Prop()
  disabled: boolean
  @Prop()
  value: boolean
  @Prop()
  themeEventType: number
  @Prop()
  container: any
  get visible () {
    return this.value
  }
  promotionChange ( v ) {
    this.$emit( 'promotion-change', v )
  }
  created () {
    this.initData()
  }
  get productConfig () {
    return this.myData.productConfig || []
  }
  get themeEventId () {
    return this.container.themeEventId
  }
  set visible ( v ) {
    this.$emit( 'input', v )
  }
  get totalSku () {
    return this.myData.data
  }
  // get templateType () {
  // }
  // set templateType ( v ) {
  //   this.myData.templateType = v
  // }

  // get floorType () {
  // }
  // set floorType ( v ) {
  //   this.$set( this.myData, 'floorType', v )
  // }

  initData () {
    let initData = {
      data: [],
      templateType: '',
      floorType: ''
    }
    this.myData = JSON.parse( JSON.stringify( Object.assign( initData, this.container ) ) )
    let { floorProducts, floorContainers } = this.myData

    if ( floorContainers.length ) {
      this.myData.data = floorContainers
      // this.myData.floorType = 'activity'
    } else if ( floorProducts.length ) {
      this.myData.data = floorProducts
      // this.myData.floorType = 'product'
    } else {
      this.myData.data = []
    }

  }
  get curList () {
    return this.myData.data
  }
  set curList ( v ) {
    this.myData.data = v
  }
  dialogClose ( done ) {
    this.$confirm( '确认关闭？' )
      .then( _ => {
        this.$emit( 'input', false )
      } )
      .catch( _ => { } )
  }
  save () {
    let o: any = Object.assign( {}, { data: [] } )
    let type = this.type == 3 ? 'floorContainers' : 'floorProducts'
    o = { ...this.myData, [ type ]: this.myData.data }
    delete o.data
    this.$emit( 'change', o )

    this.$emit( 'input', false )
  }
}
</script>
