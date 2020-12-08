<template>
  <div class="product-config">
    <!-- <el-tabs v-model="curTabIndex" v-if="tabs.length">
      <el-tab-pane v-for="(item,index) in tabs" :name="`${index}`" :key="index">
        <el-input v-model="item.tabName" slot="label" :disabled="disabled" />
      </el-tab-pane>
    </el-tabs>-->
    <el-table :data="dataList" border stripe fit v-if="dataList">
      <el-table-column prop="lcSkuCode" label="lcSkuCode" width="180"></el-table-column>
      <el-table-column prop="specification" label="规格"></el-table-column>

      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="themeEventPrice" label="活动价"></el-table-column>
      <el-table-column prop="jumpLink" label="跳转">
        <template slot-scope="scope">
          <el-input v-model="scope.row.jumpLink" size="small" :disabled="disabled"></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
@Component( {
  name: 'product-config'
} )
export default class ProductConfig extends Vue {
  @Prop( { type: [ Array, Object ] } )
  value
  @Prop()
  disabled: boolean
  @Prop()
  floorProducts: any[]
  @Prop()
  floorContainers: any[]
  @Prop()
  type: number
  get isProduct () {
    return this.value.floorType === 'product'
  }
  get dataList () {
    let type = this.type === 3 ? 'floorContainers' : 'floorProducts'
    return this[ type ]
  }
}
</script>
