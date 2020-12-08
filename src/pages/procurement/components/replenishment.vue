<template>
  <div class="procurement-replenishment">
    <el-tabs type="border-card">
      <el-tab-pane label="品牌查询">
        <brand-products-search></brand-products-search>
      </el-tab-pane>
      <el-tab-pane label="lc code 查询">
        <lc-code-products-search></lc-code-products-search>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
  import Vue from 'vue'
  import { Component, Inject } from 'vue-property-decorator'
  import { Getter, State, Mutation, Action } from 'vuex-class'
  import lcTable from '../../../components/table/index'
  import lcCodeProductsSearch from './lcCodeProductsSearch.vue'
  import brandProductsSearch from './brandProductsSearch.vue'
  @Component({
    name: 'procurement-replenishment',
    components: {
      lcCodeProductsSearch,
      brandProductsSearch
    }
  })
  export default class ProcurementReplenishment extends Vue {

  }
</script>
<style lang="stylus" scoped>
.action
  margin-top 20px

</style>

