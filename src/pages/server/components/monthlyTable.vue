<template>
  <div>
    <lc-table :config="config" :data="officeOrderList" :hasPage="false">
      <template slot-scope="scope">
        <template v-if="scope.row.control == 'delete'">
          <template v-if="scope.con.prop == 'bakRelatedAmount'">
            <!-- <el-tooltip v-if="scope.row.writtenOffAmount <= 0" :content="`该单据当前可核销金额${maxAmount(scope.row)}`" placement="top">
              <i class="el-icon-information"></i>
            </el-tooltip>-->
            <el-tooltip
              v-if="!inputDisabled(scope.row)"
              :content="`该单据当前可核销金额${maxAmount(scope.row)}`"
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
          <template v-else-if="scope.con.prop == 'orderSn'">
            <div v-for="(item,i) in scope.row.orderList" :key="i">
              {{item.orderSn}}
              <el-tooltip
                effect="dark"
                placement="top-start"
                v-if="item.serviceSns&&item.serviceSns.length"
              >
                <div slot="content">
                  服务单:
                  <br />
                  <span v-for="(serviceSn,i) in item.serviceSns" :key="i">
                    {{serviceSn}}
                    <br />
                  </span>
                </div>
                <i class="el-icon-warning"></i>
              </el-tooltip>
            </div>
          </template>
          <template v-else-if="scope.con.prop == 'amount'">
            <span v-for="(item,i) in scope.row.orderList" :key="i">
              {{item.amount}}
              <br />
            </span>
          </template>
          <template v-else-if="scope.con.prop == 'accountCheckAmount'">
            <span v-price-info="scope.row.amount"></span>
          </template>
          <template v-else-if="scope.con.prop == 'unappliedAmount'">
            <span v-price-info="scope.row.amount - scope.row.totalWrittenOff"></span>
          </template>
          <template v-else-if="scope.con.prop == 'control'">
            <el-button type="text" @click="openDialog(scope.row)">查看明细</el-button>
            <el-button
              type="text"
              size="small"
              @click="$emit('delete-payment-voucher-list',scope.row)"
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
import { formatPrice } from '@/utils/index'
import ordinaryTable from './ordinaryTable.vue'
import outboundCheck from './outboundCheck.vue'
import accountCheck from './accountCheck.vue'
// import statementDetail from '../statementDetail.vue'
@Component( {
  name: 'monthlyTable',
  components: {
    // statementDetail,
    outboundCheck,
    accountCheck
  }
} )
export default class MonthlyTable extends ordinaryTable {
  config: Array<any> = [
    { prop: 'rowId', label: '序号', width: '80px' },
    { prop: 'accountCheckSn', label: '对账单号', width: '210px' },
    // { prop: 'orderSn', label: '订单号', width: '230px' },
    // { prop: 'amount', label: '订单金额', width: '120px' },
    { prop: 'accountCheckAmount', label: '对账单金额', width: '110px' },
    { prop: 'unappliedAmount', label: '未核销金额' },
    { prop: 'bakRelatedAmount', label: '本次核销金额', width: '220px' },
    { prop: 'control', label: '操作', width: '180px' }
  ]
  isShowDetailsDialog = false
  curDimension = 0
  curAccountCheckSn = ''

  get judgeOutboundOrOrderComp () {
    return this.curDimension === 1 ? outboundCheck : accountCheck
  }


  openDialog ( row ) {
    // this.curDimension = row.dimension
    // this.curAccountCheckSn = row.accountCheckSn
    // this.isShowDetailsDialog = true
    // 这里打开弹窗返回时无法保存当前tab以及搜索条件,所以使用打开新页面方式进行跳转
    let { href } = window.location
    let webPrefix = href.substr( 0, href.lastIndexOf( "#" ) )
    let openUrl = `${webPrefix}#/server/statementDetail/${row.accountCheckSn}`
    window.open( openUrl, 'statementDetail' + row.accountCheckSn || '' );
    // this.$router.replace( `/server/statementDetail/${row.accountCheckSn}` )
  }

  inputDisabled ( row ) {
    // ( voucherStatus > 6 || voucherStatus == 5) || scope.row.writtenOffAmount > 0 || isCheck
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
}
</script>
