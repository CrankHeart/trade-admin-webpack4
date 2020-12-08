<template>
  <div id="data-tenant">
    <tenant-wrap v-if="isShow"></tenant-wrap>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import TenantWrap from './components/tenantWrap.vue'
import asyncEcharts from '../../components/asyncEcharts'
@Component( {
  name: "data-tenant",
  components: {
    TenantWrap
  }
} )
export default class DataTenant extends asyncEcharts {

}
</script>
