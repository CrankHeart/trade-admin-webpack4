<template>
  <div>
    <lc-dataset :dataset="dataset"></lc-dataset>
  </div>
</template>

<script>
import config from './config'
export default {
  name: "backGoodsHistory",
  props: {
    procurementSn: ''
  },
  data() {
    return {
      dataset: ''
    };
  },
  computed: {},
  methods: {},
  created() {
    this.dataset = this.$dataSet( config )
    this.dataset.params = { procurementOrderSn: this.procurementSn }
    this.dataset.query()
    this.dataset.on( 'fieldClick', field => {
      if ( field.key === 'serviceSn' ) {
        this.$permissionValidateWithNotifyEnv( 1292, 1282 )
        this.$router.push( { path: '/procurement/returnGoodsDetail', query: { code: field.value } } )
      }
    } )
  }
};
</script>

<style lang="stylus" scoped>
</style>