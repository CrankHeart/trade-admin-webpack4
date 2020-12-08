<template>
  <div class="reconciliation-details">
    <div class="header">
      <span>
        <label>业务时间</label>
        <el-date-picker
          @change="changeDate"
          v-model="dateRange"
          type="datetimerange"
          :picker-options="dateOptions"
          :editable="false"
          format="yyyy-MM-dd hh:mm"
          placeholder="选择时间范围"
          align="left"
        ></el-date-picker>
      </span>
      <el-button
        class="export-btn"
        type="primary"
        @click="exportExcel"
        v-if="$permissionValidate(765)"
      >导出excel</el-button>
    </div>
    <div class="amount">
      <div>
        <span>应付金额：</span>
        <span>{{totalAmount}}</span>
      </div>
      <div>
        <span>实付金额：</span>
        <span>{{totalActual}}</span>
      </div>
      <div>
        <span>应付余额：</span>
        <span>{{totalBalance}}</span>
      </div>
    </div>
    <lc-table
      :data="tableData"
      :config="config"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'businessTime'"
        >{{ formatBusinessTime( scope.row[scope.con.prop] ) }}</template>
        <template
          v-else-if="scope.con.prop === 'deliveryStatus'"
        >{{ formatDeliveryStatus( scope.row ) }}</template>
        <template
          v-else-if="scope.con.prop === 'businessType'"
        >{{ formatBusinessType( scope.row ) }}</template>
        <template
          v-else-if="['amount', 'actualAmount', 'balance', 'cumulativeBalance' ].indexOf( scope.con.prop ) > -1 "
        >{{ scope.row[scope.con.prop].toFixed(2) }}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table'
import { accountSettlementMethods, businessTypes } from '../const'


@Component( {
  name: 'reconciliation-details',
  components: {
    lcTable
  }
} )
export default class brandManagement extends Vue {
  @Prop( {
    type: Number
  } )
  supplierId

  @Inject() formatMyDate

  tableData: any[] = []
  dateRange: string[] = []
  totalActual: string = ''
  totalAmount: string = ''
  totalBalance: string = ''

  dateOptions = {
    shortcuts: [ {
      text: '最近一周',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 7 );
        picker.$emit( 'pick', [ start, end ] );
      }
    }, {
      text: '最近一个月',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 30 );
        picker.$emit( 'pick', [ start, end ] );
      }
    }, {
      text: '最近三个月',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 90 );
        picker.$emit( 'pick', [ start, end ] );
      }
    } ]
  }

  config: any = [
    { prop: 'businessTime', label: '业务时间', width: '160px' },
    { prop: 'sn', label: '单据编号', width: '220px' },
    { prop: 'deliveryStatus', label: '状态' },
    { prop: 'businessType', label: '类型', width: '200px' },
    { prop: 'amount', label: '应付金额' },
    { prop: 'actualAmount', label: '实付金额' },
    { prop: 'balance', label: '本单应付余额' },
    { prop: 'cumulativeBalance', label: '累计应付余额' },
  ]

  page = {
    cur: 1,
    total: 0,
    num: 10
  }

  activated () {
    this.search()
    this.getTotalAcount()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  changeDate () {
    if ( this.dateRange.length === 2 ) {
      this.search()
      this.getTotalAcount()
    }
  }

  formatBusinessTime ( item ) {
    let time = item && item.time
    let timeStr = this.formatMyDate( time, 'yyyy-MM-dd hh:mm' )
    return timeStr
  }

  formatDeliveryStatus ( item ) {
    let { businessType, deliveryStatus } = item
    let type: any = businessTypes.filter( v => v.id === businessType )[ 0 ] || {}
    let status = type.deliveryStatus.filter( v => v.id === deliveryStatus )[ 0 ] || {}
    return status.name
  }

  formatBusinessType ( item ) {
    let { businessType, settlementMethod } = item
    let method: any = accountSettlementMethods.filter( v => v.id === settlementMethod )[ 0 ] || {}
    let type: any = businessTypes.filter( v => v.id === businessType )[ 0 ] || {}
    return `${method.name} ${type.name}`
  }

  formatParams () {
    let { cur, num } = this.page
    const start = ( cur - 1 ) * num
    const businessTimeStart = this.formatMyDate( this.dateRange[ 0 ] )
    const businessTimeEnd = this.formatMyDate( this.dateRange[ 1 ] )
    return {
      supplierId: this.supplierId,
      start,
      num,
      businessTimeStart,
      businessTimeEnd
    }
  }

  search ( name: string = '' ) {
    this.$permissionValidateWithNotify( 764 )
    this.$http( API.getAccountBySupplierId, this.formatParams()
    ).then( ( { data } ) => {
      data = data.data
      this.page.total = data.total
      this.tableData = data.list
    } )
  }

  formatExcelParam () {
    // supplierId,businessTimeStart,businessTimeEnd
    const businessTimeStart = this.formatMyDate( this.dateRange[ 0 ] )
    const businessTimeEnd = this.formatMyDate( this.dateRange[ 1 ] )
    return {
      supplierId: this.supplierId,
      businessTimeStart,
      businessTimeEnd
    }
  }

  exportExcel () {
    // exportSupplierAccount
    this.$submit( API.exportSupplierAccount, this.formatExcelParam() )
  }
  getTotalAcount () {
    this.$http( API.totalAccountBySupplierId, {
      supplierId: this.supplierId,
      businessTimeStart: this.formatMyDate( this.dateRange[ 0 ] ),
      businessTimeEnd: this.formatMyDate( this.dateRange[ 1 ] )
    } ).then( ( { data } ) => {
      data = data.data
      this.totalActual = data.totalActual.toFixed( 2 )
      this.totalAmount = data.totalAmount.toFixed( 2 )
      this.totalBalance = data.totalBalance.toFixed( 2 )
    } ).catch( err => {
      this.totalActual = '0.00'
      this.totalAmount = '0.00'
      this.totalBalance = '0.00'
    } )
  }


}

</script>



<style lang="stylus" scoped>
.reconciliation-details
  .header
    display flex
    align-items center
    justify-content space-between
    margin-bottom 20px
  .amount
    border 1px solid #333
    padding 10px 0
    margin-bottom 20px
    display flex
    justify-content space-around
    align-items center
    div
      span:last-child
        color red
        font-size 24px
</style>
