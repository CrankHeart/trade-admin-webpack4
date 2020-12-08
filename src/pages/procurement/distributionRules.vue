<template>
  <div>
    <keep-alive>
      <component :is="activeComponent"></component>
    </keep-alive>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import distributionRuleDetail from "./components/distributionRuleDetail.vue";

@Component({
  name: "distribution-rule",
  components: {
    distributionRuleDetail
  }
})
export default class distributionRule extends Vue {
  activeComponent: string = "distributionRuleDetail";

  deactivated() {
    this.$destroy();
  }
}
</script>
<style lang="stylus" >
.el-select-width
  width 100%
</style>