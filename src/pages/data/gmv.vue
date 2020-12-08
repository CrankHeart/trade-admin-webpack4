<template>
  <div id="gmv">
    <gmv-wrap v-if="isShow"></gmv-wrap>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import gmvWrap from './components/gmvWrap.vue'
import asyncEcharts from '../../components/asyncEcharts'
@Component( {
  name: 'gmv',
  components: {
    gmvWrap
  }
} )
export default class GMV extends asyncEcharts {

}
</script>

