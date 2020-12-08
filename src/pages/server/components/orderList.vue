<template>
  <div class="delivery-search-list">
    <div class="el-table el-table--fit el-table--striped el-table--border">
      <table cellpadding="0" cellspacing="0" width="100%">
        <thead>
          <th v-for="(con, index) in config" :key="index" :style="{width:con.width}">
            <div class="cell">{{con.label}}</div>
          </th>
        </thead>
        <tr class="el-table__empty-block" v-if="data.length==0">
          <td :colspan="config.length">
            <div class="cell">暂无数据</div>
          </td>
        </tr>
        <tbody v-for="item in data" :key="item.id">
          <tr class="order-info">
            <td :colspan="config.length">
              <div class="cell">
                <el-checkbox v-model="item.isChecked">
                  <i>订单号：</i>
                  {{item.sn}}
                </el-checkbox>
                <i>下单时间：</i>
                {{item.time}}
                <i>经销商：</i>
                {{item.supplierName}}
              </div>
            </td>
          </tr>
          <tr v-for="(goods, index) in item.itemList" :key="index" class="center">
            <template v-for="con in config">
              <td v-if="con.prop=='lcode'" :key="con.prop">
                <div class="cell">
                  <el-checkbox v-model="goods['isChecked']">{{goods[con.prop]}}</el-checkbox>
                </div>
              </td>
              <td v-else-if="con.prop!='control'" :key="con.prop">
                <div class="cell">{{goods[con.prop]}}</div>
              </td>
              <td v-else-if="index==0" :rowspan="item.itemList.length" :key="con.prop">
                <div class="cell">订单详情</div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <el-pagination
      :current-page="page.cur"
      :page-size="page.num"
      layout="total, prev, pager, next, sizes"
      :total="page.total"
      class="center"
      @current-change="curChange"
      :page-sizes="page.sizes"
      @size-change="sizeChange"
    ></el-pagination>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import API from "../../../API"
import lcTitle from "../../../components/title.vue"
import lcTable from "../../../components/table/index"
import lcTableConfig from "../../../components/table/control.vue"
import { State, Action, Getter, Mutation } from "vuex-class"
import { matchArrItem } from '../../../utils'
// import searchLogistic from "./searchLogistic.vue"
@Component( {
  name: "order-list",
  components: {
    lcTitle,
    lcTable,
    lcTableConfig,
    // searchLogistic
  }
} )
export default class OrderSearchList extends Vue {

  get config () {
    const configs = [
      { prop: 'lcode', label: '单据编号', width: '200px' },
      { prop: 'type', label: '单据类型', width: '150px' },
      { prop: 'status', label: '单据状态', width: '150px' },
      { prop: 'time', label: '单据时间', width: '150px' },
      { prop: 'money', label: '对账金额', width: '150px' },
      { prop: 'status2', label: '对账状态', width: '150px' },
      { prop: 'control', label: '操作', width: '250px' }
    ]
    return configs;
  }

  data = []

  created () {
  }

  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 30, 40, 50 ]
  }
  curChange ( cur ) {
    this.page.cur = cur
  }
  sizeChange ( v ) {
    this.page.num = v
    this.page.cur = 1
  }

  cancelPromptVisible: boolean = false
  // logisticVisible: boolean = false
  @Prop() params: any
  orderExport () {
    if ( this.data.length <= 0 ) {
      return
    }
    this.$submit( API.orderExport, this.params )
  }
  orderExportDisperse () {
    let arr = this.data.filter( v => v.isChecked ).map( v => v.sn )
    if ( !arr.length ) {
      this.$notify( {
        title: "导出错误",
        type: "error",
        message: "请确认你所选择的导出文件！"
      } )
      return
    }

    let str = arr.join( ";" )
    this.$submit( API.orderExportDispersed, {
      snList: str
    } )
  }
  // updateSettlementStatusConfirm ( item ) {
  //   this.$confirm( '此操作将会使订单状态更新为已结算, 是否继续?', '结算提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   } ).then( () => {
  //     this.updateSettlementStatus( item )
  //   } ).catch( () => {

  //   } )
  // }

  visibleChange ( b, type ) {
    this.cancelPromptVisible = b
  }
  // updateSettlementStatus ( item ) {
  //   let wantedOrderStatus = null
  //   if ( item.settlementStatus === 0 ) {
  //     wantedOrderStatus = 1
  //   }
  //   this.$http( API.updateSettlementStatus, {
  //     sn: item.sn,
  //     broadcast: true
  //   } ).then( res => {
  //     item.settlementStatus = wantedOrderStatus
  //   } )
  // }
  modifyLabelDialogVisible: boolean = false
  itemLabel: any = ''
  item: any = ''
  modifyLabel ( v ) {
    this.itemLabel = v.label
    this.item = v
    this.modifyLabelDialogVisible = true
  }
  confirmModifyLabel () {
    this.$http( API.updateOrderBasicInfo, { sn: this.item.sn, label: this.itemLabel } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '修改成功'
      } )
      this.modifyLabelDialogVisible = false
      this.item.label = this.itemLabel
    } )
  }

}
</script>
<style lang="stylus" scoped>
td:not([colspan])
  .el-button
    display block
    width 100%
    margin 5px 0
td[colspan]
  padding 8px
  background #e3e3e3
td[colspan], td[rowspan]
  i
    font-weight bold
    font-style normal
.el-table
  overflow-x auto
.el-table
  table
    min-width 100%
.first-order, .first-order:hover
  background none
  color #ff4949
  border-color #ff4949
</style>

