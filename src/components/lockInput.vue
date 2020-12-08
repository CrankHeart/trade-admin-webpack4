<template>
  <span class="lock-input">
    <el-input size="small" v-model="text" :disabled="lock" :placeholder="placeholder">
      <el-button slot="append" :icon="lock&&value==value?'edit':'circle-check'" :loading="loading" size="small" @click="toggleLock"></el-button>
    </el-input>
  </span>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
@Component( {
  name: 'lock-input'
} )
export default class LockInput extends Vue {
  @Prop()
  placeholder: string
  @Prop( { type: [ String, Number ] } )
  value
  lock: boolean = !!this.value

  text: string | number = this.value

  loading: boolean = false
  @Prop()
  payload: any
  @Watch( 'value' )
  valueWatcher ( v ) {
    this.text = v
    this.lock = !!v
  }
  // created () {
  //   this.text = this.value
  //   this.lock = !!this.value
  // }
  toggleLock () {
    if ( this.lock ) {
      this.lock = false
    } else {
      this.edit()
    }
  }
  edit () {
    this.text = `${this.text}`.trim()
    if ( this.text == this.value ) {
      if ( !this.text ) return
      this.lock = true
    } else {
      // this.loading = true
      let cb = () => {
        this.lock = true
        // this.loading = false
      }
      this.$emit( 'input', this.text )
      this.$emit( 'change', this.text, cb, this.payload )
    }
  }
}
</script>

