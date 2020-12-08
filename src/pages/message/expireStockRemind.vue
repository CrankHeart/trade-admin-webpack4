<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'abnormalDiscountRateRemind'
} )
export default class AbnormalDiscountRateRemind extends MessageRemind {
  type = 9
  activated () {
    this.$permissionValidateWithNotify( 759 )
    this.getData()
  }
}
</script>
