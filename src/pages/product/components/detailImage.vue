<template>
  <standard-image :can-edit="false" :spu="spu" :editable="$permissionValidate(503)"></standard-image>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import standardImage from './standardImage.vue'
@Component( {
  name: 'product-detail-image',
  components: {
    standardImage
  }
} )
export default class ProductDetailImage extends Vue {
  @Prop()
  spu: any
}
</script>