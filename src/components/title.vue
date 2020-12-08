<template>
  <h2 class="title" v-if="text">
    {{text}}
    <slot></slot>
  </h2>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
@Component
export default class LcTitle extends Vue {
  @Prop( { default: '' } )
  text: string
}
</script>
<style lang="stylus" scoped>
.title
  margin-bottom 10px
  text-align left
</style>

