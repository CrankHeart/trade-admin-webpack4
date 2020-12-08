<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'abnormalDiscountRateRemind'
} )
export default class AbnormalDiscountRateRemind extends MessageRemind {
  type = 5
  activated () {
    this.$permissionValidateWithNotify( 434 )
    this.getData()
  }
}
</script>