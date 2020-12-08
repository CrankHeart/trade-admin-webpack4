<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import PromotionCreate from './create.vue'
@Component( {
  name: 'promotion-detail',
  mixins: [ PromotionCreate ],
} )
export default class PromotionDetail extends Vue {
  isDetail = true
}

</script>