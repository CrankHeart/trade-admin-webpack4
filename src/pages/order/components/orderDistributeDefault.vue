<template>
  <div class="order-distribute">
    <p class="distribute-tip">未设置在自定义配货规则中的商品，都会默认通过商家规则进行配货</p>
    <div class="distribute-tip">
      <el-button
        v-if="$permissionValidate(1102)"
        @click="showBatchEdit"
        type="primary"
        :disabled="selectedData.length == 0"
      >批量修改</el-button>
    </div>
    <lc-table
      :config="config"
      :data="ruleData"
      :selection="true"
      :page="page"
      @cur-change="changePage"
      @data-selection-change="dataSelectionChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control' ">
          <span v-if="scope.row.isEdit && $permissionValidate(1102) ">
            <el-button type="text" @click="confirm( scope.row )">确定</el-button>
            <el-button type="text" @click="cancel( scope.row )">取消</el-button>
          </span>
          <span v-if="!scope.row.isEdit && $permissionValidate(1102) ">
            <el-button type="text" @click="edit( scope.row )">编辑</el-button>
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
import API from '../../../API'
import lcTable from '../../../components/table'
import { wmsTypes } from '../const/orderDistribute'

@Component( {
  name: 'order-distribute-default',
  components: {
    lcTable
  }
} )
export default class OrderDistributeDefault extends Vue {
  config = [
    { label: '商家', prop: 'storeName', },
    { label: 'WMS类型', prop: 'wmsType' },
    { label: '操作', prop: 'control', }
  ]
  wmsTypes = wmsTypes
  ruleData = []
  page = {
    total: 0,
    cur: 1,
    num: 10
  }
  isShowWMSDialog: boolean = false
  batchEditWmsType = null
  selectedData: any[] = []

  activated () {
    this.getStoreDistributeRules()
  }

  getStoreDistributeRules () {
    let { num, cur } = this.page
    let param = {
      num,
      start: num * ( cur - 1 )
    }
    this.$permissionValidateWithNotify( 1100 )
    this.$http( API.getStoreDistributeRules, param ).then( ( { data } ) => {
      this.ruleData = data.list || []
      this.page.total = data.count
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '数据获取失败'
      } )
    } )
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

  changePage ( cur ) {
    this.page.cur = cur
    this.getStoreDistributeRules()
  }

  confirm ( item ) {
    let { id, wmsType } = item
    this.updateStoreDistributeRule( {
      wmsType,
      idList: [ id ]
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

  updateStoreDistributeRule ( param ) {
    this.$permissionValidateWithNotify( 1102 )
    return this.$http( API.updateStoreDistributeRule, param ).then( res => {
      this.$notify( {
        type: 'success',
        message: res.data.msg || '更新成功'
      } )
      this.getStoreDistributeRules()
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '更新失败'
      } )
    } )
  }
  dataSelectionChange ( arr ) {
    this.selectedData = arr
  }
  showBatchEdit () {
    this.batchEditWmsType = wmsTypes[ 0 ].id
    this.isShowWMSDialog = true
  }
  batchEdit () {
    if ( this.selectedData.length == 0 ) {
      this.$notify( {
        type: 'warning',
        message: '请选择需要修改的数据'
      } )
      return
    }
    let idList = this.selectedData.map( v => v.id )
    this.updateStoreDistributeRule( {
      idList,
      wmsType: this.batchEditWmsType
    } ).then( res => {
      this.isShowWMSDialog = false
    } ).catch( err => {
      this.isShowWMSDialog = false
    } )
  }
}
</script>
<style lang="stylus" scoped>
.distribute-tip
  margin-bottom 10px
</style>
