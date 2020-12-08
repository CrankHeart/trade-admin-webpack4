<template>
  <div>
    <freight-template :disabled="true"></freight-template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Action } from 'vuex-class'
import freightTemplate from './components/freightTemplate.vue'

import { Component } from 'vue-property-decorator'

@Component( {
  name: 'freight-detail',
  components: {
    freightTemplate
  }
} )
export default class detail extends Vue {
  @Action( 'freight/getFreightData' ) getFreightData
  activated () {
    let params = this.$route.params
    this.getFreightData( params )
  }
}
</script>

