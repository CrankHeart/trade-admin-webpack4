<template>
  <div id="page-error">
    <h1>404</h1>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'page-error'
} )
export default class PageError extends Vue {

}

</script>
