<template>
  <div class="order-distribute-customer">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <div class="order-btn-margin">
      <el-button
        v-if="$permissionValidate(1103)"
        @click="showBatchEdit"
        type="primary"
        :disabled="selectedData.length == 0"
      >批量修改</el-button>
      <el-button
        v-if="$permissionValidate(1104)"
        @click="batchDetele"
        type="primary"
        :disabled="selectedData.length == 0"
      >批量删除</el-button>
      <el-button
        v-if="$permissionValidate(1105)"
        class="pull-right"
        type="primary"
        @click="createRule"
      >新增规则</el-button>
    </div>
    <lc-table
      ref="orderDistributeCustomer"
      :config="config"
      :data="skuDatas"
      :selection="true"
      :page="page"
      @cur-change="curChange"
      @data-selection-change="dataSelectionChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control' ">
          <span v-if="scope.row.isEdit && $permissionValidate(1103) ">
            <el-button type="text" @click="confirm( scope.row )">确定</el-button>
            <el-button type="text" @click="cancel( scope.row )">取消</el-button>
          </span>
          <span v-if="!scope.row.isEdit">
            <el-button type="text" v-if="$permissionValidate(1103)" @click="edit( scope.row )">编辑</el-button>
            <el-button
              type="text"
              v-if="$permissionValidate(1104)"
              @click="deleteRule( scope.$index )"
            >删除</el-button>
          </span>
        </template>
        <template v-else-if="scope.con.prop === 'wmsType'">
          <span v-if="scope.row.isEdit">
            <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择">
              <el-option
                v-for="item in wmsTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </span>
          <span v-else>{{ formatWMSType( scope.row[scope.con.prop] ) }}</span>
        </template>
        <template v-else>{{ scope.row[scope.con.prop] }}</template>
      </template>
    </lc-table>

    <el-dialog v-model="isShowDialog" size="large">
      <order-distribute-customer-rule @success="refresh"></order-distribute-customer-rule>
    </el-dialog>

    <el-dialog v-model="isShowWMSDialog" title="修改WMS类型" size="tiny">
      <span>WMS类型：</span>
      <el-select v-model="batchEditWmsType" placeholder="请选择">
        <el-option v-for="item in wmsTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <span slot="footer">
        <el-button @click="isShowWMSDialog = false">取消</el-button>
        <el-button type="primary" @click="batchEdit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import API from '../../../API'
import lcTable from '../../../components/table'
import lcCondition from '../../../components/condition.vue'
import { wmsTypes } from '../const/orderDistribute'
import orderDistributeCustomerRule from './orderDistributeCustomerRule.vue'

@Component( {
  name: 'order-distribute-customer',
  components: {
    lcTable,
    lcCondition,
    orderDistributeCustomerRule
  }
} )
export default class OrderDistributeCustomer extends Vue {
  @Action( 'brand/getAllBrands' ) getAllBrands
  @State( state => state.brand.brandList ) brandList

  skuDatas: any[] = []
  wmsTypes = wmsTypes
  allBrandList = []
  isShowDialog: boolean = false
  page = {
    total: 0,
    cur: 1,
    num: 10
  }
  isShowWMSDialog: boolean = false
  batchEditWmsType = null
  selectedData: any[] = []

  condition = [
    { value: '', key: 'lcSkuCode', label: 'SKU编码', type: 'text' },
    { value: '', key: 'name', label: '商品名称', type: 'text' },
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: this.allBrandList },
    { value: '', key: 'wmsType', label: 'WMS类型', type: 'radio', options: this.wmsTypes }
  ]

  config: any[] = [
    { label: 'LC编码', prop: 'lcSkuCode' },
    { label: '名称', prop: 'name' },
    { label: '规格', prop: 'specification' },
    { label: '商家', prop: 'storeName' },
    { label: '品牌', prop: 'brandName' },
    // { label: '自有编码', prop: '' },
    { label: '单位', prop: 'unit' },
    { label: 'WMS类型', prop: 'wmsType' },
    { label: '操作', prop: 'control' }
  ]

  @Watch( 'brandList', { immediate: true } )
  watchBrandList ( newVal, oldVal ) {
    // this.allBrandList = newVal
    this.allBrandList.length = 0
    newVal.forEach( item => {
      this.allBrandList.push( item )
    } )

  }

  activated () {
    this.getAllBrands()
    this.search()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  refresh () {
    this.page.cur = 1
    this.search()
  }

  search () {
    this.$permissionValidateWithNotify( 1101 )
    let param = this.formatParam()
    this.$http( API.getSkuDistributeRules, param ).then( res => {
      let data = res.data || {}
      this.skuDatas = data.list
      this.page.total = data.count
    } )
  }


  formatParam () {
    let { num, cur } = this.page
    let param: any = {
      start: ( cur - 1 ) * num,
      num
    }
    this.condition.forEach( item => {
      let { key, value } = item
      if ( value && value != '' ) {
        param[ key ] = value
      }
    } )
    // this.changeRoute( param )
    return param
  }

  formatWMSType ( type ) {
    let name = ''
    wmsTypes.some( v => {
      let isTrue = v.id === type
      isTrue ? name = v.name : ''
      return isTrue
    } )
    return name
  }

  changeRoute ( query ) {
    this.$router.push( {
      path: this.$route.path,
      query
    } )
  }

  createRule () {
    this.isShowDialog = true
  }

  confirm ( item ) {
    let { id, wmsType } = item
    this.updateSkuDistributeRule( {
      wmsType,
      idList: [ id ]
    } ).then( res => {
      Vue.set( item, 'isEdit', false )
    } )
  }

  deleteRule ( index ) {
    let item = this.skuDatas[ index ] || {}
    this.deleteSkuDistributeRule( {
      idList: [ item.id ]
    } )
  }

  updateSkuDistributeRule ( param ) {
    this.$permissionValidateWithNotify( 1103 )
    return this.$http( API.updateSkuDistributeRule, param ).then( res => {
      let msg = res.data.msg || ''
      this.$notify( {
        type: 'success',
        message: res.data.msg || '更新成功'
      } )

    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '更新失败'
      } )
    } )
  }

  deleteSkuDistributeRule ( param ) {
    this.$permissionValidateWithNotify( 1104 )
    this.$confirm( '是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( res => {
      this.$http( API.deleteSkuDistributeRule, param ).then( res => {
        this.search()
        this.$notify( {
          type: 'success',
          message: res.data.msg || '删除成功'
        } ).catch( err => {
          this.$notify( {
            type: 'error',
            message: err.data.msg || '删除失败'
          } )
        } )
      } )
    } )
  }

  cancel ( item ) {
    Vue.set( item, 'wmsType', item.wmsTypeBak )
    Vue.set( item, 'isEdit', false )
  }

  edit ( item ) {
    Vue.set( item, 'isEdit', true )
    item.wmsTypeBak = item.wmsType
    // item.isEdit = true
  }

  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }

  showBatchEdit () {
    this.batchEditWmsType = wmsTypes[ 0 ].id
    this.isShowWMSDialog = true
  }

  batchEdit () {
    if ( !this.validateBatchSelect() ) {
      return
    }
    let idList = this.selectedData.map( v => v.id )
    this.updateSkuDistributeRule( {
      idList,
      wmsType: this.batchEditWmsType
    } ).then( res => {
      this.isShowWMSDialog = false
      this.search()
    } )
  }

  batchDetele () {
    let idList = this.selectedData.map( v => v.id )
    this.deleteSkuDistributeRule( {
      idList
    } )
  }

  validateBatchSelect () {
    let isValid = true
    if ( this.selectedData.length == 0 ) {
      this.$notify( {
        type: 'warning',
        message: '请选择需要修改的数据'
      } )
      isValid = false
    }
    return isValid
  }

}
</script>
<style lang="stylus" scoped>
.order-btn-margin
  margin-bottom 10px
</style>
