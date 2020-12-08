<template>
  <div id="product-association">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="协议申请单审批" name="audit" v-if="$permissionValidate(1005)">
        <association-audit v-if="activeName=='audit'"></association-audit>
      </el-tab-pane>
      <el-tab-pane label="协议商品查询" name="search" v-if="$permissionValidate(497)">
        <association-search v-if="activeName=='search'"></association-search>
      </el-tab-pane>
      <el-tab-pane label="协议价策略管理" name="discount" v-if="$permissionValidate(1011)">
        <association-discount v-if="activeName=='discount'"></association-discount>
      </el-tab-pane>
    </el-tabs>

  </div>
</template> 
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import associationSearch from './components/associationSearch.vue'
import associationAudit from './components/associationAudit.vue'
import associationDiscount from './components/associationDiscount.vue'

@Component( {
  name: 'product-association',
  components: {
    associationSearch,
    associationAudit,
    associationDiscount
  }
} )
export default class Productassociation extends Vue {
  activeName = ''
  handleClick ( { name } ) {
    this.$router.push( `/product/association?activeName=${name}` )
  }
  created () {
    let { activeName } = this.$route.query
    this.activeName = activeName || (this.$permissionValidate(1005)&& 'audit' || this.$permissionValidate(497)&&'search' || this.$permissionValidate(1011)&&'discount')
  }
}
</script>
<style lang="stylus">

</style>
