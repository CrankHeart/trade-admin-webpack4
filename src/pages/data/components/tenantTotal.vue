<template>
  <div class="tenant-total">
    <lc-table :has-page="false" :config="config" :data="data">
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop == 'userType'"
        >{{userTypeObj[scope.row[scope.con.prop]].name}}</template>
        <template v-else-if="scope.con.prop == 'gmv'">{{thoundandSeparator(+scope.row.gmv)}}</template>
        <template
          v-else-if="scope.con.prop == 'salesDepartments'"
        >{{formatSalesDepartments(+scope.row.salesDepartments)}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import lcTable from '../../../components/table/'
import { Component, Prop } from 'vue-property-decorator'
import { userTypeObj } from '../../order/const/orderSearchCondition'
import { thoundandSeparator, matchArrItem } from '../../../utils'
import { salesDepartmentsTypes } from '../../../const/index'
@Component( {
  name: 'tenant-total',
  components: {
    lcTable
  }
} )
export default class TenantTotal extends Vue {
  limitPromission = [ 724 ]
  @Prop()
  data: any[]
  config = [
    { prop: 'index', label: '序号' },
    { prop: 'region', label: '区域' },
    { prop: 'province', label: '省份' },
    { prop: 'city', label: '城市' },
    { prop: 'salesCity', label: '销售城市' },
    { prop: 'userType', label: '用户类型' },
    { prop: 'tenantName', label: '企业名称' },
    { prop: 'officeName', label: '客户名称' },
    { prop: 'salesPerson', label: '销售负责人' },
    { prop: 'gmv', label: '销售金额' },
    { prop: 'salesDepartments', label: '销售部门' }
  ]
  userTypeObj = userTypeObj
  thoundandSeparator = thoundandSeparator
  formatSalesDepartments ( item ) {
    return matchArrItem( item, salesDepartmentsTypes, 'id' ).name
  }
}
</script>
<style lang="stylus">
.tenant-total
  .table-with-page
    td:last-child
      text-align right
</style>

