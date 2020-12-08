<template>
  <div class="standard-tabs">
    <ul>
      <li
        v-for="tab in tabs"
        :key="tab.prop"
        @click="activeName=tab.prop"
        :class="{'is-active':activeName==tab.prop}"
      >{{tab.label}}</li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component( {
  name: 'product-tabs'
} )
export default class ProductTabs extends Vue {
  @Prop( { type: String, default: 'merchant' } ) value: string
  tabs: Array<object> = [
    { prop: 'standard', label: '标品属性' },
    { prop: 'merchant', label: '商家属性' }
  ]

  get activeName (): string {
    return this.value
  }
  set activeName ( v ) {
    this.$emit( 'input', v )
    this.$emit( 'change', v )
  }
}
</script>
<style lang="stylus" scoped>
.standard-tabs
  display inline-block
  float right
  margin-right 50px
  ul
    display flex
  li
    padding 9px 10px
    border-bottom 2px solid transparent
    font-size 14px
    cursor pointer
    &.is-active
      border-bottom-color #20a0ff
      color #20a0ff
</style>
