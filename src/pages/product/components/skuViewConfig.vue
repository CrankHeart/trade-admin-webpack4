<template>
  <span>
    <template
      v-if="['goodLabel', 'isInCatalogue', 'whileStocksLast'].indexOf(prop)>-1"
    >{{convertData(item[prop],prop)}}</template>
    <!-- TODO 下期迭代使用  -->
    <template v-else-if="prop == 'oversold'">{{formatOversold(item.oversold)}}</template>
    <template v-else-if="prop == 'purchaseLimit'">
      <span>{{item.switchValue?`限购 ${item.purchaseLimit}`:`不限购`}}</span>
    </template>
    <template v-else-if="prop == 'goodStatus'">
      {{convertData(item[prop],prop)}}
      <template v-if="item.goodStatus===3">
        <el-tooltip :content="item.shortageReason" placement="top">
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </template>
    </template>
    <template v-else-if="prop == 'isVirtual'">{{convertData(item[prop],prop)}}</template>
    <template v-else-if="prop == 'isCash'">{{formatPriceIsCash(item[prop],prop)}}</template>
    <template v-else-if="prop == 'skuType'">
      <SkuVirturalConfig :key="item.id" :item="item" :is-edit="false"></SkuVirturalConfig>
    </template>
    <template v-else-if="prop == 'needAptitude'">
      <!-- <aptitude-config :item="item" type="sku" @handler-callback="saveSku(item)" :is-edit="false" :key="item.lcCode"></aptitude-config> -->
      <aptitude-config :item="item" type="sku" :is-edit="false" :key="item.lcCode"></aptitude-config>
    </template>
    <template v-else-if="prop == 'imgControl'">
      <img-config :item="item" :type="1" :is-edit="false" :key="item.lcCode"></img-config>
    </template>
    <template
      v-else-if="'level0Price,level1Price,level2Price'.indexOf(prop)>-1"
    >{{formatPrice(item.salesPrice,prop)}}</template>
    <template v-else-if="prop == 'activityEndTime'">{{formatMyDate(item[prop],void 0,true)}}</template>
    <template v-else>{{item[prop] || '-'}}</template>
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop, Inject } from 'vue-property-decorator'
import { skuExtendProps, goodStatuses, catalogueType, goodLabels, whileStocksLasts, isVirtuals, isCashs } from '../const'
import { matchArrItem } from '../../../utils/'
import SkuVirturalConfig from './skuVirturalConfig.vue'
import imgConfig from './imgConfig.vue'
import aptitudeConfig from './aptitudeConfig.vue'

import { oversolds, findItem } from '../const'

@Component( {
  name: 'sku-view-config',
  components: {
    SkuVirturalConfig, aptitudeConfig, imgConfig,
  }
} )
export default class SkuViewConfig extends Vue {
  @Inject() formatMyDate
  @Prop() item: any
  @Prop() spu: any
  @Prop() prop: string

  convertData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'goodLabel':
        arr = goodLabels
        break
      case 'goodStatus':
        arr = goodStatuses
        break
      case 'whileStocksLast':
        arr = whileStocksLasts
        break
      case 'isInCatalogue':
        arr = catalogueType
        break
      case 'isVirtual':
        arr = isVirtuals
        break
    }
    return matchArrItem( value, arr, 'id' ).name || '--'
  }
  formatPrice ( price = 0, type ) {
    let rate = this.spu[ type ] || 1
    let result = price * rate
    let scale = result >= 50 ? 1 : 10
    return ( Math.round( result * scale ) / scale ).toFixed( 2 )
  }
  formatPriceIsCash ( id ) {
    let info = isCashs.find( item => item.id == id )
    return info.name || '-'
  }

  formatOversold ( id ) {
    if ( id === "" || id === undefined || id === null ) return "";
    return findItem( id, oversolds ).name;
  }
}
</script>
