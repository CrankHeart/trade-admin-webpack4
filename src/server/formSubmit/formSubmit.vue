<template>
  <div style="display:none;">
    <iframe
      :id="'yexiao-'+random"
      :src="realUrl"
      :name="'yexiao-'+random"
      ref="yexiao-frame"
      style="display:none;"
      v-if="target"
    ></iframe>
    <form
      :action="realUrl"
      :target="target?'yexiao-'+random:'_blank'"
      :method="method"
      ref="yexiao-form"
    >
      <input v-for="(item,key) in params" :name="key" :value="item" :key="key" />
    </form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { baseURL } from '../../API'
@Component( {
  name: 'form-submit'
} )
export default class FormSubmit extends Vue {
  target: boolean = false
  method: string = 'post'
  params: object = {}
  url: string = ''
  random: number = Math.random() * 10e10
  get realUrl (): string {
    return baseURL + this.url
  }
}
</script>
