<template>
  <div class="delivery-search-list">
    <div class="el-table el-table--fit el-table--striped el-table--border">
      <table cellpadding='0' cellspacing='0' width="100%">
        <thead>
          <th v-for="(con, index) in config" :key="index" :style="{width:con.width}">
            <div class="cell">{{con.label}}</div>
          </th>
        </thead>
        <tbody>
        <tr class="el-table__empty-block" v-if='data.length==0'>
          <td :colspan="config.length">
            <div class="cell">暂无数据</div>
          </td>
        </tr>
        <template v-for="(item,itemIndex) in list">
          <tr class="order-info" :key="item.orderSn+itemIndex">
            <td :colspan="config.length">
              <div class="cell">
                <el-checkbox v-model="item.isChecked" @change="checkBoxChanged(item)">
                  <i>订单号：</i>
                </el-checkbox>
                  {{item.orderSn}}
                <i>下单时间：</i>
                  {{formatDate(item.orderDate)}}
                <i>经销商：</i>
                  {{formatStoreName(item.storeId)}}
                <i>客户名称:</i> {{item['officeName']}}
              </div>
            </td>
          </tr>
          <template  v-if="item.financialReceivables.length>0" >
              <tr v-for="(goods, index) in item.financialReceivables" :key="goods.receiptNo+index" class="center">
                <template v-for="con in config">
                  <td  v-if="con.prop=='receiptNo'" :key="con.prop+goods.receiptNo">
                    <div class="cell" style="text-align:left">
                      <el-checkbox v-model="goods['isChecked']" >
                      </el-checkbox>
                       {{goods[con.prop]}}
                    </div>
                  </td>
                  <td  v-else-if="con.prop=='deliveryDate'" :key="con.prop">
                    <div class="cell">
                      {{formatDate(goods[con.prop])}}
                    </div>
                  </td>

                  <td  v-else-if="con.prop=='checkStatus'" :key="con.prop">
                    <div class="cell">
                      {{formatCheckStatus(goods[con.prop])}}
                    </div>
                  </td>
                   <td  v-else-if="con.prop=='settlementStatus'" :key="con.prop">
                    <div class="cell">
                      {{formatStatementStatus(goods[con.prop])}}
                    </div>
                  </td>
                  <td  v-else-if="con.prop=='receiptType'" :key="con.prop">
                    <div class="cell">
                      {{formatReceiptTypes(goods[con.prop])}}
                    </div>
                  </td>
                  <td  v-else-if="con.prop!='control'" :key="con.prop">
                    <div class="cell">
                      {{goods[con.prop]}}
                    </div>
                  </td>
                  <td v-else-if="index==0"   :rowspan="item.financialReceivables.length" :key="con.prop">
                    <div class="cell">
                       <el-button
                        type="primary"
                        size="mini"
                        @click="toOrderDetails(item.orderSn)"
                      >订单详情</el-button>
                    </div>
                  </td>
                </template>
              </tr>
          </template>
           <template v-else>
            <tr>
            <td colspan="6">
              <div class="cell" style="text-align:center">
                  暂无数据
                </div>
            </td>
            <td>
               <div class="cell" style="text-align:center">
                       <el-button
                        type="primary"
                        size="mini"
                        @click="toOrderDetails(item.orderSn)"
                      >订单详情</el-button>
               </div>
            </td>
          </tr>
          </template>
        </template>
        </tbody>
      </table>
    </div>
    <el-pagination :current-page="pageInfo.cur" :page-size="pageInfo.num" layout="total, prev, pager, next, sizes"
    :total="pageInfo.total" class="center"
     @current-change="curChange" :page-sizes= "pageInfo.sizes"
     @size-change="sizeChange"></el-pagination>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Watch, Inject } from "vue-property-decorator"
import { receiptTypes } from '@/pages/server/const/serverConstant'
import { checkStatusList, deliverySettlementStatus } from '@/pages/order/const/orderSearchCondition'
import { statementStatus, checkStatus } from '../const/serverConstant'
import API from "../../../API"
import lcTitle from "../../../components/title.vue"
import lcTable from "../../../components/table/index"
import lcTableConfig from "../../../components/table/control.vue"
import { State, Action, Getter, Mutation } from "vuex-class"

import { matchArrItem } from '../../../utils'
// import searchLogistic from "./searchLogistic.vue"
@Component( {
  name: "delivery-list",
  components: {
    lcTitle,
    lcTable,
    lcTableConfig,
    // searchLogistic
  }
} )
export default class OrderSearchList extends Vue {

  @Prop( { default: () => [] } )
  data: any[]

  @Prop() selectAll: boolean
  @Prop( { default: () => { } } ) pageInfo
  @State( state => state.stores.storeList ) storeList
  @Action( 'stores/getAllStoresWithCache' ) getAllStoresWithCache

  getKeyByItem ( item ) {
    let timestamp = new Date().getTime()
    return item.orderSn;
  }

  get config () {
    const configs = [
      { prop: 'receiptNo', label: '单据编号', width: '260px' },
      { prop: 'receiptType', label: '单据类型', width: '150px' },
      { prop: 'deliveryDate', label: '单据时间', width: '180px' },
      { prop: 'receivableAmount', label: '对账金额', width: '150px' },
      { prop: 'checkStatus', label: '对账状态', width: '150px' },
      { prop: 'settlementStatus', label: '结算状态', width: '150px' },
      { prop: 'control', label: '操作', width: '150px' }
    ]
    return configs;
  }

  @Watch( 'selectAll' )
  selectAllWatch ( data ) {
    if ( data == true ) {
      this.list.forEach( item => {
        item.isChecked = true
        if ( item.financialReceivables && item.financialReceivables.length > 0 ) {
          item.financialReceivables.forEach( delivery => {
            delivery.isChecked = true
          } )
        }
      } )
    } else {
      this.list.forEach( item => {
        item.isChecked = false
        if ( item.financialReceivables && item.financialReceivables.length > 0 ) {
          item.financialReceivables.forEach( delivery => {
            delivery.isChecked = false
          } )
        }
      } )
    }
  }

  list = []

  @Watch( 'data' )
  dataWatch ( data ) {
    this.loadData()
  }

  @Watch( 'list', { deep: true } )
  listWatch ( data ) {
    let selected = this.getSelected()
    this.$emit( 'selectChange', selected )
  }

  checkBoxChanged ( item ) {
    if ( item.financialReceivables && item.financialReceivables.length > 0 ) {
      item.financialReceivables = item.financialReceivables.map( delivery => {
        return {
          ...delivery,
          isChecked: item.isChecked
        }
      } )
    }
  }

  created () {
    this.getAllStoresWithCache()
    this.loadData()
  }

  toOrderDetails ( sn ) {
    this.$router.push( `/order/detail/${sn}` )
  }

  loadData () {
    this.list = this.data.map( item => {
      if ( item.financialReceivables && item.financialReceivables.length > 0 ) {
        item.financialReceivables = item.financialReceivables.map( delivery => {
          return {
            ...delivery,
            isChecked: false
          }
        } )
      }
      return {
        ...item,
        isChecked: false
      }
    } )
  }


  getSelected () {
    let rets = []
    this.list.forEach( item => {
      if ( item.financialReceivables && item.financialReceivables.length > 0 ) {
        item.financialReceivables.forEach( delivery => {
          if ( delivery.isChecked == true ) {
            rets.push( { orderSn: delivery.orderSn, receiptNo: delivery.receiptNo } )
          }
        } )
      }
    } )
    return rets;
  }

  @Inject() formatMyDate

  formatReceiptTypes ( id ) {
    return matchArrItem( id, receiptTypes, 'id' ).name
  }
  formatCheckStatus ( id ) {
    return matchArrItem( id, checkStatus, 'id' ).name
  }

  formatStatementStatus ( id ) {
    return matchArrItem( id, deliverySettlementStatus, 'id' ).name
  }


  formatStoreName ( id ) {
    let storeInfo = this.storeList.find( store => store.storeId == id )
    return storeInfo && storeInfo.storeName || ''
  }

  formatDate ( date: any = {} ) {
    if ( date && date.time ) {
      return this.formatMyDate( date.time )
    }
    return ''
  }

  curChange ( cur ) {
    this.$emit( 'curChange', cur )
  }
  sizeChange ( v ) {
    this.$emit( 'sizeChange', v )
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
i
  font-weight: bold
  font-style: normal
.order-info
  .cell
    i
      margin-left 25px
</style>

