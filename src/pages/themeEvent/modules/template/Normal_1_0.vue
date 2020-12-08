<template>
  <flex-box :span="+moduleData.floorLayout || 12" class="home-floor-view" :class="`home-floor-item-${index}`">
    <h4 class="title-column">{{moduleData.floorName}}</h4>
    <p v-if="activityType=='haveDesc'" class="product-desc-show">{{moduleData.floorDesc}}</p>
    <flex-box :gutter="10" class="home-floor-item">
      <flex-box :span="(24/moduleData.column)" v-for="(item,index) in moduleData.floorProducts" :key="index">
        <home-floor-item :data="item" :activityType="activityType" :moduleData="moduleData"></home-floor-item>
      </flex-box>
    </flex-box>
    <slot></slot>
  </flex-box>
</template>
<script>
import templateMixins from './templateMixins'
import homeFloorView from './app/homeFloorView'
import homeFloorItem from '../components/app/homeFloorItem.vue'
import FlexBox from '../components/FlexBox'
export default {
  name: 'Normal_1_0',
  components: {
    homeFloorItem,
    FlexBox
  },
  mixins: [ templateMixins, homeFloorView ],
  data() {
    return {
      extendProps: [
        { prop: 'activityType', label: '活动种类', type: 'select', options: [ { name: '品牌活动', id: 'haveDesc' }, { name: '爆款', id: 'havePrice' } ] }
      ]
    }
  },
  props: [ 'index' ],
  computed: {
    activityType() {
      let floorLayoutDetail = this.moduleData.floorLayoutDetail || {}
      return floorLayoutDetail.activityType
    }
  },
  methods: {
  }
}
</script>