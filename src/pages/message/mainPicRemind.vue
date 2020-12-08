<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'mainPicRemind'
} )
export default class MainPicRemind extends MessageRemind {
  type = 3
  activated () {
    this.$permissionValidateWithNotify( 431 )
    this.getData()
  }
}
</script>