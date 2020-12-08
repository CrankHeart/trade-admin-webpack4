<template>
  <div id="create-supplier-list">
    <lc-title :text="(id ?'编辑供应商':'新建供应商'+titleList[step-1])"></lc-title>
    <h4 class="supplierSubTitle" v-if="id">{{titleList[step+2]}}</h4>
    <!-- 信息 -->
    <supplier-info v-if="step==3 || step==1" @change-step="changeStep" :step="step" :supplierId2="supplierId" ref="supplier-info"></supplier-info>
    <!-- 第二步 -->
    <supplier-goods-list @go-step="goStep" :supplierId="supplierId" v-if="step==2"></supplier-goods-list>
    <!-- 第三步 -->
    <supplier-selected-goods-list ref="supplier-selected-goods-list" @go-step="goStep" :supplierId="supplierId" v-if="step==3"></supplier-selected-goods-list>
    <!-- 整体保存 -->
    <el-button type="primary" v-if="id && step!= 2 || step == 3" @click="saveTotalInfo" class="saveTotalInfo pull-right">保存修改信息并提交</el-button>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/index'
import SupplierInfo from './components/supplierInfo.vue'
import supplierGoodsSelect from './components/supplierGoodsSelect.vue'
import { supplierAddConfig, supplierResConfig } from './const/index'
import supplierGoodsList from './components/supplierGoodsList.vue'
import supplierSelectedGoodsList from './components/supplierSelectedGoodsList.vue'


@Component( {
  name: 'create-supplier',
  components: {
    lcTitle,
    lcTable,
    SupplierInfo,
    supplierGoodsSelect,
    supplierGoodsList,
    supplierSelectedGoodsList
  }
} )
export default class SupplierCreate extends Vue {
  // 编辑状态有ID，新建状态无ID
  get id () {
    return this.$route.params.id
  }
  supplierId: any = ''
  step: number = 1
  titleList = [
    '--填写基本信息',
    '--添加商品',
    '--修改基本信息,查看已添加的商品',
    '编辑供应商的基本信息,修改已添加商品的信息',
    '向供应商中添加新的商品',
    '修改供应商中已添加商品的信息'
  ]
  supplierAddConfig = supplierAddConfig
  supplierResConfig = supplierResConfig
  activated () {
    this.supplierId = this.id
  }
  deactivated () {
    let supplierId = this.supplierId
    let step = 1
    this.changeStep( { supplierId, step } )
  }

  created () {
    this.supplierId = this.id
  }

  changeStep ( { supplierId, step } ) {
    this.step = step
    this.supplierId = +supplierId
  }
  goStep ( step ) {
    this.step = step
  }
  saveTotalInfo () {
    let arr = []
    let supplierInfo: any = this.$refs[ 'supplier-info' ]
    let supplierSelectedGoodsList: any = this.$refs[ 'supplier-selected-goods-list' ]
    // supplierInfo.hasChange()
    // supplierSelectedGoodsList.haschange()
    arr.push( supplierInfo.hasChange() )
    if ( this.id === undefined ) {
      arr.push( supplierSelectedGoodsList.hasChange() )
    }
    Promise.all( arr )
      .then( res => {
        this.$router.push( `/procurement/supplierDetail/${this.supplierId}` )
      } )
      .catch( err => {
        this.$notify( {
          type: 'error',
          message: '保存失败'
        } )
      } )
  }
}
</script>
<style lang="stylus" scoped>
  .supplierSubTitle
    margin-bottom 20px
  .saveTotalInfo
    margin-right 20px
</style>
