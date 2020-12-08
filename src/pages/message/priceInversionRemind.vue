<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'priceInversionRemind'
} )
export default class PriceInversionRemind extends MessageRemind {
  type = 4
  activated () {
    this.$permissionValidateWithNotify( 433 )
    this.getData()
  }
}
</script>