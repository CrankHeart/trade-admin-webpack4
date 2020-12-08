<template>
  <div class="portrait-detail-quote">
    <lc-condition :condition="condition" @submit="getData" label-width="120px">
      <template slot="btn">
        <el-button @click="viewCustomerApply" v-if="showCustomerApply">
          批量处理
          <el-tooltip content="批量处理客户申请采购协议价" placement="top">
            <i class="el-icon-information"></i>
          </el-tooltip>
        </el-button>
        <el-button type="primary" @click="dialogVisible=true">新建报价</el-button>
      </template>
    </lc-condition>

    <lc-table
      :config="tableConfig"
      :data="tableData"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="{row,con}">
        <template
          v-if="con.prop=='auditStatus'||con.prop=='applyType'"
        >{{converData(con.prop,row[con.prop])}}</template>
        <template
          v-else-if="con.prop=='applyTime' || con.prop=='auditTime'"
        >{{row[con.prop] && formatMyDate(new Date(row[con.prop])) || '--'}}</template>
        <template v-else-if="con.prop=='control'">
          <el-button
            type="primary"
            size="small"
            @click="viewDetail(row)"
            v-if="$permissionValidate(1025)"
          >查看</el-button>
          <template v-if="$permissionValidate(1022)">
            <el-button type="text" size="small" v-if="row.isExported == 2">
              <a download=".xls" target="_blank" :href="row.exportedFileUrl">下载</a>
            </el-button>
            <el-button type="text" size="small" @click="exportExcel(row)" v-else>导出</el-button>
          </template>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <add-new-quote
      v-if="dialogVisible"
      :tenant="tenant"
      v-model="dialogVisible"
      @refresh="getData"
      :permission="[$permissionValidate(1023),$permissionValidate(1024)]"
    ></add-new-quote>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import lcCondition from '../../../components/condition.vue'
import addNewQuote from './addNewQuote.vue'
import lcTable from '../../../components/table'
import { associationAuditStatuses, associationApplyTypes } from '../const'
import API from '../../../API'

import { matchArrItem } from '../../../utils'

@Component( {
  name: 'portrait-detail-quote',
  components: {
    lcCondition,
    lcTable,
    addNewQuote
  }
} )
export default class PortraitDetailQuote extends Vue {
  @Prop()
  tenant: any
  @Inject()
  formatMyDate
  dialogVisible = false
  condition: any[] = [
    { value: undefined, key: 'applySn', label: '协议申请单号', type: 'text' },
    { value: undefined, key: 'applyTime', label: '申请时间', type: 'daterange' },
    { value: undefined, key: 'auditStatus', label: '状态', type: 'select', options: associationAuditStatuses },
    { value: undefined, key: 'applyType', label: '申请类型', type: 'select', options: associationApplyTypes },
  ]
  get showCustomerApply () {
    return this.condition[ 3 ].value == 6
  }
  tableConfig: any[] = [
    { prop: 'applySn', label: '协议申请单号', width: '300' },
    { prop: 'applyUser', label: '报价人' },
    { prop: 'auditStatus', label: '申请单状态', width: '150' },
    { prop: 'auditUser', label: '审批人' },
    { prop: 'applyType', label: '申请类型', width: '150' },
    { prop: 'skuNum', label: 'sku数量', width: '120' },
    { prop: 'applyTime', label: '申请日期', width: '180' },
    { prop: 'auditTime', label: '审核日期', width: '180' },
    { prop: 'remark', label: '备注', width: '180' },
    { prop: 'control', label: '操作', fixed: 'right', width: '150' },
  ]
  viewCustomerApply () {
    let { tenantId, tenantName, officeId } = this.tenant
    this.$router.push( `/vip/quoteDetailCustomerApply/?quoteType=6&tenantName=${tenantName}&tenantId=${tenantId}&officeId=${officeId}` )
  }
  viewDetail ( item ) {
    let { tenantId, tenantName, officeId } = this.tenant
    if ( item.applyType == 1 || item.applyType == 5 ) {
      this.$router.push( `/vip/quoteDetail/${item.bigCustomerQuoteId}?status=${item.auditStatus}&tenantName=${tenantName}&tenantId=${tenantId}&officeId=${officeId}&applyType=${item.applyType}` )
    } else if ( item.applyType == 6 ) {
      this.$router.push( `/vip/quoteDetailCustomerApply/?bigCustomerQuoteIds=${item.bigCustomerQuoteId}&status=${item.auditStatus}&tenantName=${tenantName}&tenantId=${tenantId}&officeId=${officeId}` )
    } else {
      this.$router.push( `/association/detail/${item.applySn}` )
    }
  }

  exportExcel ( item ) {
    if ( item.applyType == 1 ) {
      this.$submit( API.exportExcelFile, { id: item.bigCustomerQuoteId } )
    } else {
      let { memberId } = this.$store.state.login
      this.$submit( API.exportApplyDetail, { applySn: item.applySn, memberId } )
    }
  }

  tableData: any[] = []
  page = {
    cur: 1,
    total: 0,
    num: 10,
    sizes: [ 10, 20, 50, 100 ]
  }

  curChange ( cur = 1 ) {
    this.page.cur = cur
    this.getData()
  }
  sizeChange ( size ) {
    this.page.num = size
    this.curChange()
  }

  computeOption () {
    let option: any = {}
    let { cur, num } = this.page
    let { tenant_id, office_id } = this.$route.query
    option.start = ( cur - 1 ) * num
    option.num = num
    option.tenantId = tenant_id
    option.officeId = office_id

    this.condition.forEach( val => {
      let { value, key } = val
      if ( value !== undefined ) {
        option[ key ] = value
      }
    } )
    let [ applyStartTime, applyEndTime ] = option.applyTime || [ undefined, undefined ]

    if ( applyStartTime ) {
      option.applyStartTime = this.formatMyDate( applyStartTime )
      option.applyEndTime = this.formatMyDate( applyEndTime, undefined, true )
    }
    return option
  }
  getData () {
    this.$permissionValidateWithNotify( 1020 )
    let option = this.computeOption()

    this.$http( API.getProductQuoteList, option ).then( ( { data } ) => {
      let myData = data.data || {}
      this.tableData = myData.list
      this.page.total = myData.total
    }, () => {
      this.tableData = []
      this.page.total = 0
    } )
  }

  converData ( prop, value, key = 'id', resultProp = 'name' ) {
    let arr = []
    switch ( prop ) {
      case 'auditStatus':
        arr = associationAuditStatuses
        break
      case 'applyType':
        arr = associationApplyTypes
        break
    }
    return matchArrItem( value, arr, [ key ] )[ resultProp ]
  }
  activated () {
    this.getData()
  }
  created () {
    this.getData()
  }
}
</script>
