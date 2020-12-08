<template>
  <div>
    <freight-template @save="save"></freight-template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import freightTemplate from './components/freightTemplate.vue'
import { Mutation } from 'vuex-class'
import { Component } from 'vue-property-decorator'
import API from '../../API'

@Component( {
  name: 'freight-create',
  components: {
    freightTemplate
  }
} )
export default class detail extends Vue {

  @Mutation( 'freight/setFreightData' ) setFreightData
  @Mutation( 'freight/initFreeShipCondition' ) initFreeShipCondition

  activated () {
    this.setFreightData( {
      templateName: '',
      templateType: 0,
      chargeMode: 0,
      logisticCompanyId: 9,
      // freeShippingWeight: '',
      freeShippingCity: [],
      freeShippingRule: [
        {
          id: '0' + Date.now(),
          startWeight: '',
          endWeight: ''
        }
      ]
    } )
    this.initFreeShipCondition()
  }
  save ( freightData ) {
    this.$http( API.saveFreightTemplate, freightData ).then( res => {
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

