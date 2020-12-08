<template>
  <apply-wrapper :tenant="tenant"></apply-wrapper>
</template>
<script lang="ts">

import applyWrapper from './components/bmsQuoteApplyWrapper.vue'

import { Component,Vue } from 'vue-property-decorator'

@Component( {
  name: 'bms-quote-apply',
  components:{
    applyWrapper
  }
} )
export default class BmsQuoteApply extends Vue {
  get tenant () {
    let { tenantId, officeId, tenantName, name } = this.$route.query
    return {
      tenantId, officeId, tenantName, name
    }
  }
}
</script>
<style lang="stylus" scoped>
.bms-quote-apply
  position relative
  padding-bottom 50px
  .footer
    position fixed
    left 0
    right 0
    bottom 0
    line-height 40px
    border-top 1px solid #eeeeee
    background #fff
    text-align right
    padding 0 12px
    box-sizing border-box
    z-index 9
</style>

