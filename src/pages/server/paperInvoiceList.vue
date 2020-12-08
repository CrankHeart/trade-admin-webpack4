<template>
  <div class="paper-invoice-list">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table :config="config" :data="list" :page="page" @cur-change="curChange">
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'applyType'"
        >{{ formatApplyType( scope.row[ scope.con.prop ])}}</template>
        <template
          v-else-if="scope.con.prop === 'createDate'"
        >{{ formatCreateDate( scope.row[ scope.con.prop ])}}</template>
        <template v-else-if="scope.con.prop === 'orderStatus'">{{ formatOrderStatus( scope.row )}}</template>
        <template v-else-if="scope.con.prop === 'control'">
          <el-button type="primary" size="mini" @click.stop="createInvoice( scope.row )">开票</el-button>
        </template>
        <template v-else>{{ scope.row[ scope.con.prop ] }}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import API from '../../API'
import { applyTypes } from './const/serverConstant'
import { orderAllStatus } from '../order/const/orderSearchCondition'
import { statementStatus } from './const/serverConstant'

@Component( {
  name: 'paper-invoice-list',
  components: {
    lcTable,
    lcCondition
  }
} )
export default class PaperInvoiceList extends Vue {
  @Inject() formatMyDate

  condition = [
    { value: '', key: 'applySn', label: '单据号', type: 'text' },
    { value: {}, key: 'tenant', label: '集团公司', type: 'tenantSearch' },
    { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
  ]

  config = [
    { prop: 'applyType', label: '单据类型' },
    { prop: 'applySn', label: '单据号' },
    { prop: 'orderStatus', label: '单据状态' },
    { prop: 'createDate', label: '申请时间' },
    { prop: 'control', label: '操作' },
  ]

  list: any[] = []

  page = {
    cur: 1,
    num: 10,
    total: 0
  }

  activated () {
    this.search()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  search () {
    this.$permissionValidateWithNotify( 1076 )
    this.$http( API.getInvoiceApplyList, this.fromatParam() ).then( ( { data } ) => {
      this.list = data.list
      this.page.total = data.count
    } )
  }

  fromatParam () {
    let { cur, num } = this.page
    let o: any = {}
    o.num = num
    o.start = ( cur - 1 ) * num

    this.condition.forEach( ( con: any ) => {
      let { key, value = '', type } = con
      if ( type === 'tenantSearch' ) {
        o.tenantId = value.tenantId
        o.tenantName = value.tenantName
      } else if ( type === 'customerSearch' ) {
        o.customerId = value.customerId
        o.customerName = value.customerName
      } else if ( value !== '' ) {
        o[ 'applySn' ] = value
      }
    } )
    return o
  }

  formatApplyType ( type ) {
    let item = ''
    applyTypes.some( v => {
      if ( v.id === type ) {
        item = v.name
        return true
      }
      return false
    } )
    return item
  }

  formatCreateDate ( time ) {
    if ( time && time.time ) {
      return this.formatMyDate( time.time, 'yyyy-MM-dd' )
    }
    return ''
  }
  formatOrderStatus ( item ) {
    // statementStatus
    let { applyType, orderStatus } = item
    if ( orderStatus === undefined ) {
      return ''
    }
    if ( applyType == 1 ) {
      return orderAllStatus[ +orderStatus ]
    } else if ( applyType === 2 ) {
      return statementStatus.filter( v => v.id === +orderStatus )[ 0 ].name
    }
  }

  createInvoice ( row ) {
    let { applySn, applyType } = row
    if ( applyType === 1 ) {
      this.$router.push( `/order/detail/${applySn}?invoice=1` )
    } else if ( applyType === 2 ) {
      this.$router.push( `/server/statementDetail/${applySn}?invoice=1` )
    }
  }
}
</script>



