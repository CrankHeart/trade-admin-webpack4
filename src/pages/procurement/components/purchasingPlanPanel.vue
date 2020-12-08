<template>
  <div class="purchasing-plan-panel">
    <p>
      {{ title }}
      <slot name="headerSlot"></slot>
    </p>
    <slot class="panel-content" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
@Component( {
  name: 'purchasing-plan-panel'
} )
export default class purchasingPlanPanel extends Vue {
  @Prop( { default: '' } ) title: string
}
</script>

<style lang='stylus' scoped>
.purchasing-plan-panel
  background-color #fff
  padding 0
  margin 10px 0
  border 1px solid #333
  color #333
  >p
    background-color #fff
    height 35px
    line-height 35px
    padding 0 9px
    font-size 14px
  .panel-content
    height 70px
    padding 0 9px
    line-height 70px
    font-size 14px
    border-top 1px solid #333
</style>
