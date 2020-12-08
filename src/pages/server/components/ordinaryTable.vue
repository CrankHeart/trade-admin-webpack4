<template>
  <div>
    <lc-table :config="config" :data="officeOrderList" :key="config.length" :hasPage="false">
      <template slot-scope="scope">
        <template v-if="scope.row.control == 'delete'">
          <template v-if="scope.con.prop == 'bakRelatedAmount'">
            <el-tooltip
              v-if="!inputDisabled(scope.row)"
              :content="`该订单剩余关联金额${maxAmount(scope.row)}`"
              placement="top"
            >
              <i class="el-icon-information"></i>
            </el-tooltip>
            <template v-if="scope.row.amount>=0">
              <el-input-number
                :debounce="800"
                :max="maxAmount(scope.row)"
                :min="0"
                size="small"
                v-model="scope.row.bakRelatedAmount"
                :disabled="inputDisabled(scope.row)"
              ></el-input-number>
            </template>
            <template v-else>
              <span>{{scope.row.bakRelatedAmount}}</span>
            </template>
          </template>
          <template v-else-if="['amount','unappliedAmount'].includes(scope.con.prop)">
            <span v-price-info="scope.row[scope.con.prop]"></span>
          </template>
          <template v-else-if="scope.con.prop == 'control'">
            <el-button
              type="text"
              size="small"
              @click="$emit('delete-payment-voucher-list', scope.row)"
              v-if="!inputDisabled(scope.row) && ( voucherStatus < 5 || voucherStatus == 6 )  && !isCheck"
            >删除</el-button>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
        <template v-else-if="scope.row.control == 'add'">
          <template v-if="scope.con.prop == 'control'">
            <el-button
              v-if="( voucherStatus < 5 || voucherStatus == 6 ) && formInline.amount > relatedAmount && !isCheck"
              type="text"
              size="small"
              @click="$emit( 'add-payment-voucher-list' )"
            >新增</el-button>
          </template>
        </template>
      </template>
    </lc-table>
    <div class="amount-info">
      本次核销总金额：
      <span>{{ countAmount }}</span>
      退款金额（申请中）：
      <span>{{ refundingAmount }}</span>
      已退款金额：
      <span>{{ refundedAmount }}</span>
      付款凭证剩余未核销金额：
      <span>{{ countUnAmount }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { formatPrice } from '@/utils'
import lcTable from '../../../components/table/index'
@Component( {
  name: 'ordinaryTable',
  components: {
    lcTable
  }
} )
export default class ordinaryTable extends Vue {
  @Prop()
  orderType: Number
  @Prop( { type: Array } )
  officeOrderList
  @Prop( { default: () => [ { bakRelatedAmount: 0 } ] } )
  formInline
  @Prop( { type: Boolean } ) // 是否是查看付款凭证
  isCheck
  @Prop( { type: Number } )
  voucherStatus
  @Prop( { type: Number, default: 0 } )
  reverseSign
  @Prop( { type: Number } )
  id
  relatedAmount: number = 0

  // 本次核销总金额：
  get countAmount () {
    // return formatPrice(this.formInline.amount)
    const feeArr = this.officeOrderList
      .map( item => item.bakRelatedAmount || 0 )
    return formatPrice( feeArr.reduce( ( acc, cur ) => cur + acc, 0 ) )
  }
  // 退款金额（申请中）
  get refundingAmount () {
    return formatPrice( this.formInline.refundingAmount )
  }
  // 已退款金额
  get refundedAmount () {
    return formatPrice( this.formInline.refundedAmount )
  }
  // 付款凭证剩余未核销金额：
  get countUnAmount () {
    const fee = [ this.formInline.amount, this.countAmount, this.refundingAmount, this.refundedAmount ]
      .map( Number )
      .reduce( ( acc, cur ) => acc - cur )
    return formatPrice( fee )
  }

  inputDisabled ( row ) {
    // reverse_sign=1且voucher_status=4 凭证明细里所有订单/对账单列表项可增删改
    // 且付款凭证不可作废
    if ( this.reverseSign == 1 && this.voucherStatus == 4 && !this.isCheck ) {
      return false
    } else if ( row.isEditAdd ) {
      // 如果是点击新增后增加的记录,可以编辑
      return false
    } else {
      // return this.voucherStatus >= 5  || row.writtenOffAmount > 0 || this.isCheck
      return this.voucherStatus >= 5 || this.isCheck
    }
  }


  config: Array<any> = [
    { prop: 'rowId', label: '序号', width: '150px' },
    { prop: 'orderSn', label: '订单号', width: '210px' },
    { prop: 'amount', label: '订单金额', width: '180px' },
    { prop: 'unappliedAmount', label: '未核销金额' },
    { prop: 'bakRelatedAmount', label: '本次核销金额', width: '220px' },
    { prop: 'control', label: '操作' }
  ]

  maxAmount ( item ) {
    // 如果账单金额小于0,最大值为0,最小是为订单金额
    if ( +item.amount < 0 ) {
      return item.amount
    } else {
      if ( this.voucherStatus > 5 && !item.isEditAdd ) {
        return +( item.amount ).toFixed( 2 )
      } else if ( this.id == undefined || item.isEditAdd ) {
        return +( +item.amount - item.totalRelatedAmount - item.totalWrittenOff ).toFixed( 2 )
      } else {
        return +( +item.amount - item.totalRelatedAmount - item.totalWrittenOff + ( +item.relatedAmount + +item.writtenOffAmount ) ).toFixed( 2 )
      }
    }
  }
}

</script>
<style lang="stylus" scoped>
.amount-info
  text-align right
  height 30px
  line-height 30px
  span
    color red
    padding-right 0.5em
    font-weight bold
</style>
