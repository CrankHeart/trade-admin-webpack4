<template>
  <flex-box :span="+moduleData.floorLayout || 12" class="product-list-view">
    <flex-box class="product-list-view-item">
      <p v-if="moduleData.haveTimeLimit" class="burst-tip">
        以下商品将于{{moduleData.endTime && formatMyDate(moduleData.endTime && moduleData.endTime.time)}}结束特价
      </p>
      <flex-box :span="24" v-for="(item,index) in moduleData.floorProducts" :key="index">
        <product-list-item :data="item" :moduleData="moduleData"></product-list-item>
      </flex-box>
    </flex-box>
    <slot></slot>
  </flex-box>
</template>
<script>
import templateMixins from './templateMixins'
import productListView from './app/productListView'
import productListItem from '../components/app/productListItem.vue'
import FlexBox from '../components/FlexBox.vue'
import { formatMyDate } from '@/utils'

export default {
  name: 'Normal_1_1',
  components: {
    productListItem,
    FlexBox
  },
  mixins: [ templateMixins, productListView ],
  data() {
    return {
      extendProps: [
        { prop: 'haveTimeLimit', label: '时间限制', type: 'radio', options: [ { name: '没有', id: 0, selected: 1 }, { name: '有', id: 1 } ] }
      ]
    }
  },
  computed: {
  },
  methods: {
    formatMyDate( v ) {
      return formatMyDate( v )
    }
  }
}
</script>