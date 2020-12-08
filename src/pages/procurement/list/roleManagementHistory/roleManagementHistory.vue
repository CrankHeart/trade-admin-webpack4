<template>
  <div>
    <lc-dataset :dataset="dataset"></lc-dataset>
  </div>
</template>

<script>
import config from './config'
export default {
  name: "roleManagementHistory",
  props: {},
  data() {
    return {
      dataset: ''
    };
  },
  computed: {},
  methods: {},
  created() {
    this.dataset = this.$dataSet( config )
  }
};
</script>

<style lang="stylus" scoped></style>