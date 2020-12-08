<template>
  <div>
    <lc-dataset :dataset="dataset"></lc-dataset>
  </div>
</template>

<script>
import config from './config'
export default {
  name: "warehousHistory",
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
    console.log( 'procurementSn', this.procurementSn )
    this.dataset = this.$dataSet( config )
    this.dataset.params = {
      procurementOrderSn: this.procurementSn
    }
    this.dataset.query()
  }
};
</script>

<style lang="stylus" scoped>
</style>