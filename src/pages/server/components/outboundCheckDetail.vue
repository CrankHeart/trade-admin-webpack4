<!--出库单详情-->
<template>
  <div class="check-order-detail">
    <el-dialog v-model="showDialog" size="large" title="对账单对账明细">
      <el-row v-if="curRowData.receiptType === 1" class="top-info">
        <el-col :span="12">
          <span>{{curRowData.receiptType === 1 ? '出库单号：': '服务单号：'}}</span>
          {{checkDetailsListData.length ? checkDetailsListData[0].sn : ''}}
        </el-col>
        <el-col :span="12">
          <span>{{curRowData.receiptType === 1 ? '出库时间：': '申请时间：'}}</span>
          {{checkDetailsListData.length && !!checkDetailsListData[0].actionTime ? formatMyDate(checkDetailsListData[0].actionTime.time) : null}}
        </el-col>
      </el-row>

      <el-row v-if="curRowData.receiptType === 2" class="top-info">
        <el-col :span="12">
          <span>退库单号：</span>
          {{checkDetailsListData.length ? checkDetailsListData[0].sn : ''}}
        </el-col>
        <el-col :span="12">
          <span>入库时间：</span>
          {{checkDetailsListData.length && !!checkDetailsListData[0].actionTime ? formatMyDate(checkDetailsListData[0].actionTime.time) : null}}
        </el-col>
      </el-row>

      <div class="el-table el-table--fit el-table--striped el-table--border">
        <table cellpadding="0" cellspacing="0" width="100%">
          <thead>
            <th v-for="(con, index) in filterConfig" :key="index">
              <div class="cell">{{con.label}}</div>
            </th>
          </thead>
          <tbody>
            <tr class="el-table__empty-block" v-if="checkDetailsListData.length===0">
              <td :colspan="filterConfig.length">
                <div class="cell">暂无数据</div>
              </td>
            </tr>
            <template v-else>
              <tr v-for="(item, index) in checkDetailsListData" :key="index">
                <template v-for="con in filterConfig">
                  <td class="cell" :key="con.prop">
                    <template
                      v-if="con.prop==='amount'"
                    >{{(item.number|| item.skuNum)*item.price | toFixed2(con.prop)}}</template>
                    <template
                      v-else-if="con.prop==='discount'"
                    >{{item.subtotal-(item.number|| item.skuNum)*item.price | toFixed2(con.prop)}}</template>
                    <template v-else>{{item[con.prop] | toFixed2(con.prop)}}</template>
                  </td>
                </template>
              </tr>
              <tr v-if="curRowData.receiptType === 1">
                <td class="cell" colspan="5">运费</td>
                <td
                  class="cell"
                >{{(checkDetailsListData[0].freightAmount - checkDetailsListData[0].freightDiscount || 0) | toFixed2}}</td>
                <td class="cell">{{(checkDetailsListData[0].freightDiscount || 0) | toFixed2}}</td>
                <td class="cell">{{(checkDetailsListData[0].freightAmount || 0) | toFixed2}}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table/'

@Component({
  name: 'outbound-check-detail',
  components: {
    lcTable
  },
  filters: {
    calcuTotalNum: (key, list) => list.reduce((total, item) => (total + item[key]).toFixed(2), 0),
    toFixed2: (val, key) => {
      let toFixed2Arr: any[] = ['price', 'amount', 'discount', 'subtotal']
      return typeof val === 'number' && (toFixed2Arr.includes(key) || key == undefined) ? val.toFixed(2) : val
    }
  }
})
export default class OutboundCheckDetail extends Vue {
  @Inject() formatMyDate
  @Prop({ default: false }) value: boolean
  @Prop({ default: '' }) orderSn: string
  @Prop({ default: () => { } }) curRowData: any
  @Prop({ default: () => [] }) checkDetailsListData: any[]

  get showDialog() {
    return this.value
  }

  set showDialog(v) {
    this.$emit('input', v)
  }

  config: any[] = [
    { prop: 'name', label: '商品名称', width: '180' },
    { prop: 'specification', label: '规格', width: '180' },
    { prop: 'unit', label: '单位', width: '180' },
    { prop: 'number', label: '数量', width: '180' },
    { prop: 'price', label: '单价', width: '180' },
    { prop: 'amount', label: '金额', width: '180' },
    { prop: 'discount', label: '单项优惠', width: '180' },
    { prop: 'subtotal', label: '小计', width: '180' },
  ]
  // * 入库单不显示单价和单项优惠
  get filterConfig() {
    return this.curRowData.receiptType === 1 ? this.config : this.config.filter(item => item.prop !== 'discount')
  }

  accountCheckSn: String = ''

  activated() {
    this.accountCheckSn = this.$route.params.id
  }

}
</script>

<style lang="stylus" scoped>
.check-order-detail
  .server-row
    background #e3e3e3
    height 43px
    line-height 43px
  .top-info
    margin 0 0 15px
.table-height
  max-height 450px
  overflow auto
</style>
