<template>
  <div class="supplier-selected-goods-list">
    <keep-alive>
    <supplier-goods-table ref="supplier-goods-table" :supplier-id="supplierId"></supplier-goods-table>
    </keep-alive>
    <template>
      <el-button type="primary" @click="delGoodsInSupplier()">删除本页已添加商品</el-button>
      <el-button type="primary" @click="goStep()">添加商品</el-button>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch, Prop } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import lcTable from '../../../components/table/index'
import { supplierResConfig } from '../const/index'
import API from '../../../API'
import { Loading } from 'element-ui'
import supplierGoodsTable from './supplierGoodsTable.vue'

@Component( {
  name: 'supplier-selected-goods-list',
  components: {
    lcTable,
    supplierGoodsTable
  }
} )
export default class supplierSelectedGoodsList extends Vue {

  @Prop() supplierId: number
  get id () {
    return this.$route.params.id
  }
  mounted () {
    // let supplierTable: any = this.$refs['supplier-goods-table']
    // supplierTable.getSupplierSkuList()
  }
  delGoodsInSupplier () {
    let supplierTable: any = this.$refs['supplier-goods-table']
    supplierTable.delAllSupplierGoods()
  }

  hasChange () {
    let supplierTable: any = this.$refs[ 'supplier-goods-table' ]
    return supplierTable.hasChange()
  }
  goStep () {
    this.$emit( 'go-step', 2 )
  }
}
</script>
