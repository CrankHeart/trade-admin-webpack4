<template>
  <component :is="componentName"></component>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import createCommonProcurement from './createCommonProcurement.vue'
import createDirectlyProcurement from './createDirectlyProcurement.vue'
@Component( {
  name: 'procurement-edit',
  components: {
    createCommonProcurement,
    createDirectlyProcurement
  }
} )
export default class ProcurementEdit extends Vue {
  get deliverySource () {
    return +this.$route.query.deliverySource
  }
  get componentName () {
    if ( this.deliverySource == 0 ) {
      return 'createCommonProcurement'
    } else {
      return 'createDirectlyProcurement'
    }
  }
}
</script>

