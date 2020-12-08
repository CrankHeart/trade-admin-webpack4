<template>
  <div>
    <freight-template @save="update"></freight-template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Action } from 'vuex-class'
import freightTemplate from './components/freightTemplate.vue'
import API from '../../API'

import { Component } from 'vue-property-decorator'

@Component( {
  name: 'freight-edit',
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
  update ( freightData ) {
    this.$http( API.updateFreightTemplate, freightData ).then( res => {
      this.$router.push( '/freight/list' )
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
    } )
  }
}
</script>

