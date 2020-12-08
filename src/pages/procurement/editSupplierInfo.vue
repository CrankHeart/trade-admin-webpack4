<template>
  <div>
    <lc-title text="编辑供应商"></lc-title>
    <supplier-info @change-step="change" :supplierId2="supplierId"></supplier-info>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch, Prop } from 'vue-property-decorator'
import supplierInfo from './components/supplierInfo.vue'
import lcTitle from '../../components/title.vue'

@Component( {
  name: 'edit-supplier-info',
  components: {
    lcTitle,
    supplierInfo
  }
} )
export default class editSupplierInfo extends Vue {
  get supplierId () {
    return +this.$route.params.id
  }
  change() {}
}
</script>

<style lang="stylus" scoped>
.center
  text-align center
</style>


