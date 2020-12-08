<template>
  <div class="refill-goods">
    <lc-title text="新建计划外采购任务"></lc-title>
    <purchasing-plan-details-ext-table   />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Loading } from 'element-ui';
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import API from "../../API"
import purchasingPlanDetailsExtTable from './components/purchasingPlanDetailsExtTable.vue'
@Component( {
  name: 'buying-requirement-ext',
  components: {
    lcTitle,
    purchasingPlanDetailsExtTable
  }
} )
export default class buyingRequirementExt extends Vue {
  activeComponent: string = 'buyingRequirementDetail'
}
</script>
<style lang="stylus" >
// .refill-goods
.el-select-width
  width 100%
</style>


