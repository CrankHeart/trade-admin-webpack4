<template>
  <el-select v-model="selection" filterable :size="size" :disabled="disabled">
    <el-option v-for="option in options" :label="objProp(option,'name')" :value="objProp(option,'id')" :key="objProp(option,'id')"></el-option>
  </el-select>
</template>
<script lang="ts">

import Vue from 'vue'
import { Component, Prop, Model } from 'vue-property-decorator'

interface Option {
  id: string | number,
  name: string
}
@Component( {
  name: 'lc-select'
} )
export default class LcSelect extends Vue {
  // selection: any = null
  @Prop()
  options: Option[]
  @Prop()
  size: string
  @Prop( { default: false } )
  disabled: boolean
  @Prop( { type: [ String, Number ] } )
  @Prop() value
  get selection () {
    return this.value
  }
  set selection ( v ) {
    this.$emit( 'input', v )
    this.$emit( 'change', v )
  }
  // created () {
  //   this.selection = this.value
  // }

  objProp ( o, prop ): any {
    return ( prop in o ) ? o[ prop ] : o
  }
}
</script>
