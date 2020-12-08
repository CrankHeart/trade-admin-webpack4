<template>
  <div id="supplier-list">
    <lc-title text="供应商管理">
      <el-button
        type="primary"
        class="pull-right"
        v-if="$permissionValidate(633)"
        @click="control('add')"
      >新增供应商</el-button>
    </lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="100px"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop==='supplierEnable' "
        >{{formatStatus(scope.row.supplierEnable)}}</template>
        <template
          v-else-if="scope.con.prop==='settlementMethod' "
        >{{formatSettlement(scope.row.settlementMethod)}}</template>
        <template v-else-if="scope.con.prop==='control' ">
          <div class="control">
            <!-- <el-button type="info" @click="control('edit',scope.row)" size="small">编辑</el-button> -->
            <el-button
              type="info"
              v-if="$permissionValidate(634)"
              @click="control('view',scope.row)"
              size="small"
            >查看</el-button>
            <el-button
              type="danger"
              v-if="$permissionValidate(635)"
              @click="control('delete',scope.row)"
              size="small"
            >删除</el-button>
            <template v-if="scope.row.processStatus<=1">
              <el-button
                type="info"
                v-if="$permissionValidateWithEnv(1169,1165)"
                @click="control('confirm',scope.row)"
                size="small"
              >提交审核</el-button>
            </template>
            <template v-else-if="scope.row.processStatus==2">
              <el-button
                type="info"
                v-if="$permissionValidateWithEnv(1170,1166)"
                @click="control('confirm',scope.row)"
                size="small"
              >业务部门审核</el-button>
            </template>
            <template v-else-if="scope.row.processStatus==3">
              <el-button
                type="info"
                v-if="$permissionValidateWithEnv(1171,1167)"
                @click="control('confirm',scope.row)"
                size="small"
              >质管部门审核</el-button>
            </template>
            <template v-else-if="scope.row.processStatus==4">
              <el-button
                type="info"
                v-if="$permissionValidateWithEnv(1172,1168)"
                @click="control('confirm',scope.row)"
                size="small"
              >总经理审核</el-button>
            </template>
          </div>
        </template>
        <template
          v-else-if="scope.con.prop==='processStatus' "
        >{{getProgressName(scope.row.processStatus)}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog
      title="审核"
      :visible.sync="showConfirmDialogVisible"
      size="large"
      @close="closeDialog"
      @open="showConfirmDialogOpen"
    >
      <supplier-confirm
        v-if="showConfirmDialogVisible"
        :supplier-id="supplierId"
        @submit="confirmSubmit"
        ref="showConfirmDialogInner"
      ></supplier-confirm>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import supplierConfirm from '@/pages/procurement/supplierConfirm.vue'
import { supplierProcessStatus } from './const/index'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import { supplierEnables, settlementMethods } from './const/index'
import { State, Action } from "vuex-class"

@Component( {
  name: 'supplier-list',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    supplierConfirm
  }
} )
export default class SupplierList extends Vue {
  @Action( 'brand/getAllBrands' ) getAllBrands
  // @State( state => state.supplier.supplierList ) supplierList
  @State( state => state.brand.brandList ) brandList
  showConfirmDialogVisible = false
  condition = [
    { value: '', key: 'supplierName', label: '供应商名称', type: 'text' },
    { value: '', key: 'contactName', label: '联系人姓名', type: 'text' },
    { value: '', key: 'brandId', label: '品牌', type: 'select', options: [] },
    { value: '', key: 'supplierEnable', label: '是否启用', type: 'radio', options: supplierEnables },
    { value: '', key: 'processStatus', label: '审核状态', type: 'radio', options: supplierProcessStatus }
  ]

  config = [
    { prop: 'supplierName', label: '供应商名称' },
    { prop: 'supplierEnable', label: '是否启用' },
    { prop: 'contactName', label: '联系人' },
    { prop: 'companyMobile', label: '手机' },
    { prop: 'settlementMethod', label: '结算方式' },
    { prop: 'supplierBrandCount', label: '采购品牌数' },
    { prop: 'supplierSkuCount', label: '采购SKU数' },
    { prop: 'processStatus', width: '180px', label: '审核状态' },
    { prop: 'control', label: '操作', width: "250px" },
  ]
  myData: any[] = []

  page = {
    cur: 1,
    total: 0,
    num: 10
  }

  supplierId = null

  loadData () {
    this.search()
  }

  getProgressName ( type ) {
    // 1：待提交，2：待业务部门审核，3：待质量部门审核，4：待总经理审核，5：审核通过'
    const proNames = supplierProcessStatus;
    let proInfo = proNames.find( item => item.id == type );
    return proInfo.name || '待提交';
  }

  activated () {
    this.getAllBrands().then( res => {
      ( this.condition[ 2 ] as any ).options = res.map( ( { id, name } ) => ( {
        id,
        name
      } ) )
    } )
    this.loadData()
  }

  formatStatus ( status ) {
    let state = supplierEnables.filter( v => v.id === status )[ 0 ]
    return state && state.name
  }

  formatSettlement ( type ) {
    let state = settlementMethods.filter( v => v.id === type )[ 0 ]
    return state && state.name
  }

  formatOption () {
    let o: any = {}
    this.condition.forEach( v => {
      if ( v.value !== '' ) {
        o[ v.key ] = v.value
      }
    } )

    o.num = this.page.num
    o.start = ( this.page.cur - 1 ) * o.num

    return o
  }

  search () {
    // this.$permissionValidateWithNotify(632)
    this.$http( API.getSupplierInfos, this.formatOption() ).then( ( { data } ) => {
      let d = data.data || {}
      this.myData = d.list
      this.page.total = d.total
    } )
  }
  curChange ( v ) {
    this.page.cur = v
    this.search()
  }
  control ( type: 'add' | 'view' | 'delete' | 'confirm', item ) {
    if ( type == 'add' ) {
      this.$router.push( '/procurement/createSupplier' )
    } else if ( type == 'view' ) {
      this.$router.push( `/procurement/supplierDetail/${item.id}` )
    } else if ( type == 'confirm' ) {
      this.supplierId = item.id
      this.showConfirmDialogVisible = true
      // this.$router.push( `/procurement/supplierConfirm/${item.id}` )
    } else {
      this.delPurchase( item )
    }
  }
  delPurchase ( item ) {
    this.$confirm( '是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.delSupplierInfo, { id: item.id } ).then( res => {
        this.$message( {
          message: '删除成功',
          type: 'success'
        } )
        let i = this.myData.indexOf( item )
        this.myData.splice( i, 1 )
        this.page.total--
      } )
    } )
  }
  confirmSupplier () {
    this.showConfirmDialogVisible = true
  }

  showConfirmDialogOpen () {
    // this.$refs.showConfirmDialogInner&&this.$refs.showConfirmDialogInner.loadData()
  }
  closeDialog () {
    this.supplierId = null
  }
  confirmSubmit ( res ) {
    this.showConfirmDialogVisible = false
    this.loadData()
  }
}

</script>

<style lang="stylus" scoped>
.title-wrap
  text-align right
</style>
