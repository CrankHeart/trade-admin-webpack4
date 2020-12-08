<template>
  <component :is="componentName" v-model="value.ruleInfo" :promotionProducts="value.brandProducts" ref="ruleInfo" :disabled="isDetail"></component>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import discountRuleInfo from './ruleInfoDiscount.vue'
import giftRuleInfo from './ruleInfoGift.vue'
import reductionRuleInfo from './ruleInfoReduction.vue'
import promotionLimitRuleInfo from './ruleInfoPromotionLimit.vue'
@Component( {
  name: 'promotion-create-rule-info',
  components: {
    discountRuleInfo,
    giftRuleInfo,
    reductionRuleInfo,
    promotionLimitRuleInfo
  }
} )
export default class PromotionCreateRuleInfo extends Vue {
  @Prop( { type: [ Number, String ] } )
  type
  @Prop( { default: () => { } } )
  value: any
  @Prop()
  isDetail: boolean
  get componentName () {
    if ( this.type == 0 ) {
      return 'discountRuleInfo'
    } else if ( this.type == 1 ) {
      return 'reductionRuleInfo'
    } else if ( this.type == 2 ) {
      return 'giftRuleInfo'
    } else if ( this.type == 6 ) { // 紧俏商品限售
      return 'promotionLimitRuleInfo'
    }
  }
  validate () {
    let ruleInfo: any = this.$refs[ 'ruleInfo' ]
    return ruleInfo.validate()
  }
}

</script>