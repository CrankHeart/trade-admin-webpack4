<template>
  <lc-dataset :dataset="dataset"></lc-dataset>
</template>

<script>
import config from './listConfig'
export default {
  name: "stockDetailList",
  data() {
    return {
      dataset: ''
    };
  },
  computed: {},
  methods: {},
  created() {
    this.dataset = this.$dataSet( config )
    this.dataset.value = [ {} ]
  }
};
</script>

<style lang="stylus" scoped>
</style>