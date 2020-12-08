<template>
  <div class="business-customer-module">
    <el-row>
      <el-col :span="12">
        <el-select v-model="detail.customerOwnership" placeholder="请选择">
          <el-option
            v-for="item in customerOwnerships"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="saveCustomerOwnership">保存</el-button>
        <el-tooltip content="若选择所有客户则您选择的白名单会被清零,请选择客户归属,并点击保存按钮" placement="top">
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-col>
      <template v-if="customerOwnershipShow">
        <el-col :span="8">
          <lc-tenant-search :user="officeTenantName" @broadcast="broadCastOffice"></lc-tenant-search>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchCompany" v-if="$permissionValidate(523)">新增</el-button>
        </el-col>
      </template>
    </el-row>
    <lc-table
      :config="config"
      v-if="customerOwnershipShow"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control'">
          <el-button
            type="text"
            @click="deleteCustomerOwnerShip(scope.row.id)"
            v-if="$permissionValidate(524)"
          >删除</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from "vue-property-decorator"
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table/index'
import lcTenantSearch from '../../../components/tenantSearch'
import { customerOwnerships } from '../const'
import API from '../../../API'
@Component( {
  name: "business-customer-module",
  components: {
    lcCondition,
    lcTable,
    lcTenantSearch
  }
} )
export default class businessCustomerModule extends Vue {

  config = [
    { prop: 'tenantName', label: '企业名称', width: '180px' },
    { prop: 'saasCode', label: 'saasId', width: '145px' },
    { prop: 'officeNum', label: '下设诊所数' },
    { prop: 'agreePriceSkuNum', label: '协议商品数' },
    { prop: 'control', label: '操作', width: '150px', fixed: 'right' }
  ]

  @Prop()
  detail: any
  @Prop()
  consignment: number
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    // sizes: [ 10, 20, 50 ]
  }

  customerOwnerships = customerOwnerships

  customerOwnershipShow: any = false

  officeTenantName: any = {}

  get id () {
    return this.$route.params.id
  }

  broadCastOffice ( item ) {
    this.officeTenantName = item
  }

  data: any = []

  curChange ( cur ) {
    this.page.cur = cur
    this.dataAdapter()
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
    this.dataAdapter()
  }
  dataAdapter () {
    let start = ( this.page.cur - 1 ) * ( this.page.num )
    let num = this.page.num
    this.$http( API.getStoreCustomerList, { storeId: this.id, start, num } ).then( ( { data } ) => {
      this.data = data.data.list
      this.page.total = data.data.total
    } )
  }
  searchCompany () {
    // let o = {
    //   tenantId: 'e8a5b2d4-4ff9-4bad-b0fe-dbfca2d95deb',
    //   tenantName: '领建测试'
    // }
    // let { tenantId, tenantName } = o
    let { id, name } = this.officeTenantName
    let option = { tenantId: id, tenantName: name, storeId: this.id }
    this.$http( API.addCustomerOwnerShip, option ).then( ( { data } ) => {
      this.data.unshift( { ...data.data } )
      this.page.total++
    }, ( { data } ) => {
      this.$message( {
        message: data.msg,
        type: 'warning'
      } )
    } )
  }


  deleteCustomerOwnerShip ( id ) {
    this.$http( API.deleteCustomerOwnerShip, { id } ).then( res => {
      this.data = this.data.filter( v => v.id !== id )
      this.$message( {
        message: '删除成功',
        type: 'success'
      } )
    }, ( { data } ) => {
      this.$message( {
        message: data.msg,
        type: 'warning'
      } )
    } )
  }

  saveCustomerOwnership () {
    let id = this.id
    let customerOwnership = this.detail.customerOwnership
    const consignment = this.consignment
    this.$http( API.updateStoreInfo, { id, customerOwnership, consignment } ).then( res => {
      if ( !customerOwnership ) {
        this.data = []
      }
    } )
    this.customerOwnershipShow = this.detail.customerOwnership
  }

  created () {
    if ( this.detail.customerOwnership ) {
      this.customerOwnershipShow = true
      this.dataAdapter()
    }
  }

}
</script>
