<template>
  <lc-dataset :dataset="dataset"></lc-dataset>
</template>

<script>
import config from './listConfig'
export default {
  name: "stockTotalList",
  data() {
    return {
      dataset: ''
    };
  },
  computed: {},
  methods: {},
  created() {
    this.dataset = this.$dataSet( config )
    this.dataset.on( 'fieldClick', field => {
      if ( field.key === 'skuNum' ) {
        this.$router.push( { path: '/warehouse/stockTotalDetail', query: { code: field.parent.value.code } } )
      }
    } )
    this.dataset.value = [ { skuNum: 12345, code: 1 }, { skuNum: 12345, code: 2 }, { skuNum: 12345, code: 3 }, { skuNum: 12345, code: 4 } ]
  }
};
</script>

<style lang="stylus" scoped>
</style>