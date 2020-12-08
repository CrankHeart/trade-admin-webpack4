<template>
  <div class="association-audit">
    <lc-title text="协议申请单审核"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="tableConfig"
      :data="tableData"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop=='control'">
          <div class="pull-right">
            <el-button
              type="warning"
              size="small"
              @click="controller(1,row)"
              v-if="row.auditStatus==1&&$permissionValidate(1009)"
            >审核</el-button>
            <el-button
              type="primary"
              size="small"
              @click="controller(2,row)"
              v-if="$permissionValidate(1008)"
            >查看</el-button>
            <el-button size="small" @click="controller(3,row)" v-if="$permissionValidate(1010)">导出</el-button>
          </div>
        </template>
        <template
          v-else-if="con.prop=='applyType' || con.prop=='auditStatus'"
        >{{converData(con.prop,row[con.prop])}}</template>
        <template
          v-else-if="con.prop=='applyTime' || con.prop=='auditTime'"
        >{{formatTime(row[con.prop])}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import lcTitle from '../../../components/title.vue'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table/'
import { associationAuditStatuses, associationApplyTypes } from '../const'
import { matchArrItem } from '../../../utils'
import API from '../../../API'

@Component( {
  name: 'association-audit',
  components: {
    lcTitle,
    lcCondition,
    lcTable
  }
} )
export default class AssociationAudit extends Vue {
  requestType = 1
  condition: any[] = [
    { value: undefined, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
    { value: undefined, key: 'auditStatus', label: '审批状态', type: 'select', options: associationAuditStatuses.slice( 1 ) },
    { value: undefined, key: 'applyType', label: '类型', type: 'select', options: associationApplyTypes },
    { value: undefined, key: 'applyUser', label: '申请人', type: 'text' },
    { value: undefined, key: 'applyTime', label: '申请时间', type: 'daterange' },
    { value: undefined, key: 'applySn', label: '申请单号', type: 'text' },
    { value: undefined, key: 'orderSn', label: '订单号', type: 'text' },
    // { value: undefined, key: 'lcSkuCode', label: 'sku编码', type: 'text' },
  ]
  @Inject()
  formatMyDate
  formatTime ( time ) {
    return time && this.formatMyDate( new Date( time ) ) || '--'
  }
  converData ( prop, value ) {
    let arr = []
    switch ( prop ) {
      case 'auditStatus':
        arr = associationAuditStatuses
        break
      case 'applyType':
        arr = associationApplyTypes
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
  computeSearchOption () {
    let o: any = {}
    this.condition.forEach( ( { value, key, type } ) => {
      o[ key ] = value
      if ( type == 'tenantSearch' ) {
        if ( value ) {
          o.tenantId = value.id
          o.tenantName = value.name
        }
        delete o.tenant
      } else if ( key == 'applyTime' ) {
        let [ applyStartTime, applyEndTime ] = ( value || [] ) as any
        if ( applyStartTime ) {
          o.applyStartTime = this.formatMyDate( applyStartTime )
          o.applyEndTime = this.formatMyDate( applyEndTime, undefined, true )
        }
        delete o.applyTime
      }
    } )
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    o.requestType = this.requestType
    return o
  }
  search () {
    this.$permissionValidateWithNotify( 1005 )
    let o = this.computeSearchOption()
    this.$http( API.getDiscountApplyList, o ).then( ( { data } ) => {
      let myData = data.data || {}
      this.tableData = myData.list
      this.page.total = myData.total
    }, () => {
      this.tableData = []
      this.page.total = 0
    } )
  }
  page = {
    cur: 1,
    total: 0,
    num: 10,
    sizes: [ 10, 20, 50, 100 ]
  }
  tableConfig: any[] = [
    { prop: 'tenantId', label: '集团ID', width: '200' },
    { prop: 'tenantName', label: '集团名称', width: '200' },
    { prop: 'applySn', label: '申请单号', width: '220' },
    { prop: 'applyType', label: '申请单类型', width: '170' },
    { prop: 'orderSn', label: '订单号', width: '200' },
    { prop: 'skuNum', label: 'SKU数量', width: '130' },
    { prop: 'applyUser', label: '申请人' },
    { prop: 'applyTime', label: '申请时间', width: '180' },
    { prop: 'auditStatus', label: '审批状态' },
    { prop: 'auditUser', label: '审批人', width: '130' },
    { prop: 'auditTime', label: '审批时间', width: '180' },
    { prop: 'control', label: '操作', fixed: 'right', width: '200' }
  ]
  tableData: any[] = []
  curChange ( cur = 1 ) {
    this.page.cur = cur
    this.search()
  }
  sizeChange ( size ) {
    this.page.num = size
    this.curChange()
  }
  controller ( type, { applySn } ) {
    // type 1 审核 2 查看 3 导出
    switch ( type ) {
      case 1:
        this.$router.push( `/association/audit/${applySn}` )
        break
      case 2:
        this.$router.push( `/association/detail/${applySn}` )
        break
      case 3:
        let { memberId } = this.$store.state.login
        this.$submit( API.exportApplyDetail, { applySn, memberId } )
        break
    }
  }
  created () {
    this.search()
  }
  activated () {
    this.search()
  }
}
</script>
