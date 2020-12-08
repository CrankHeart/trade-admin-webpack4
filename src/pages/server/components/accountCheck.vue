<template>
  <div class="account-check">
    <lc-table
      :config="config"
      :data="list"
      :has-page="false"
      :show-summary="true"
      :get-summaries="getTotalAmount"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'orderDate'">{{formatMyDate(row[con.prop]['time'])}}</template>
        <template v-else-if="con.prop === 'serviceOrderList'">
          <span v-if="row[con.prop].length === 1">{{ row[con.prop][0] }}</span>
          <el-collapse v-else-if="row[con.prop].length > 1">
            <el-collapse-item :title="row[con.prop][0]">
              <p v-for="item in row[con.prop].slice(1)" :key="item">{{ item }}</p>
            </el-collapse-item>
          </el-collapse>
          <span v-else></span>
        </template>
        <template
          v-else-if="con.prop === 'totalAmount'"
        >{{ Number( row['totalAmount'] ).toFixed(2) }}</template>
        <template v-else-if="con.prop === 'control'">
          <el-button
            v-if="$permissionValidate(1075)"
            type="primary"
            size="small"
            @click="viewOrderDetail( row )"
          >查看明细</el-button>
          <!-- <el-button
            size="small"
            v-if="!(detail.storeInfo&&detail.storeInfo.voucher)&&row.checkStatus===1"
            @click="updateSettlementStatusConfirm(row)"
          >结算</el-button>-->
          <!-- checkStatus已经废弃,statementStatus==2部分结算时才出现结算按钮 -->
          <el-button
            size="small"
            v-if="!(detail.storeInfo&&detail.storeInfo.voucher)&&detail.statementStatus===2 && row['settlementStatus']===0"
            @click="updateSettlementStatusConfirm(row)"
          >结算</el-button>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>

    <check-order-detail v-model="showDialog" :order-sn="orderSn"></check-order-detail>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table/'
import CheckOrderDetail from './checkOrderDetail.vue'

@Component( {
  name: 'account-check',
  components: {
    lcTable,
    CheckOrderDetail
  }
} )
export default class StatementDetail extends Vue {
  @Inject() formatMyDate
  @Prop( {
    type: Array,
    default: () => []
  } ) list
  @Prop()
  detail: any
  orderSn: String = ''
  showDialog: Boolean = false

  config = [
    { prop: 'orderDate', label: '下单时间' },
    { prop: 'orderSn', label: '订单号' },
    { prop: 'serviceOrderList', label: '服务单号' },
    { prop: 'totalAmount', label: '总金额' },
    { prop: 'control', label: '操作' }
  ]

  getTotalAmount ( param ) {
    const { columns, data } = param
    const sums = []

    if ( data.length === 0 ) {
      return sums
    }

    columns.forEach( ( column, index ) => {
      if ( index === 0 ) {
        sums[ index ] = '总价'
        return
      }
      if ( column.label === '总金额' ) {
        const values = data.map( item => Number( item[ 'totalAmount' ] ) )


        sums[ index ] = values.reduce( ( prev, curr ) => {
          const value = Number( curr )
          if ( !isNaN( value ) ) {
            return prev + curr;
          } else {
            return prev;
          }
        }, 0 )
        sums[ index ] = Number( sums[ index ] ).toFixed( 2 )
      } else {
        sums[ index ] = ''
      }
    } )

    return sums
  }

  viewOrderDetail ( row ) {
    this.orderSn = row.orderSn
    this.showDialog = true
  }
  updateSettlementStatusConfirm ( item ) {
    this.$confirm( '此操作将会使订单状态更新为已结算, 是否继续?', '结算提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.updateSettlementStatus( item )
    } ).catch( () => {

    } )
  }
  updateSettlementStatus ( item ) {
    this.$http( API.updateSettlementStatus, {
      orderSn: item.orderSn,
      broadcast: true
    } ).then( res => {
      item.checkStatus = 3
      this.$emit( 'reload' )
    } )
  }
}


</script>

<style lang="stylus" scoped></style>

<style lang="stylus">
.account-check
  .el-collapse
    border none
  .el-collapse-item__content
    padding 5px 0 5px 35px
    background #FAFAFA
  .el-collapse-item__header
    height 30px
    line-height 30px
    background #FAFAFA
</style>

