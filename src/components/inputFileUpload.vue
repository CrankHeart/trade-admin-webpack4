<template>
  <span class="input-file-upload">
    <slot></slot>
    <input class='edit-file' type="file" multiple :name="'_file'+Math.random()" @change="change" :disabled="disabled"></input>
  </span>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
@Component( {
  name: 'InputFileUpload'
} )
export default class InputFileUpload extends Vue {
  @Prop( { default: false } )
  disabled: boolean
  change ( target ) {
    if(!this.disabled){
      this.$emit( 'change', target )
    }
  }
}
</script>
<style lang="stylus" scoped>
.input-file-upload
  position relative
  overflow hidden
  display inline-block
  vertical-align middle
  cursor pointer
  .edit-file
    position absolute 
    left 0
    top 0
    width 100%
    height 100%
    z-index 99
    opacity 0
</style>

