<template>
  <div class="order-detail-deliver">
    <h3>
      出货信息
      <el-button
        v-if="$permissionValidate(551) && isShowCreateBtn"
        class="pull-right"
        type="primary"
        size="small"
        @click="addShipping"
      >新建发货单</el-button>
    </h3>
    <br />
    <div class="order-detail-deliver__item" v-for="delivery in deliveryList" :key="delivery.id">
      <template v-if="delivery.wantSlipsState !== 2">
        <p>
          <template>{{formatDeliverState(delivery)}}</template>
          <span v-if="delivery.createDate">{{formatMyDate(delivery.createDate)}}</span>
          <el-button
            type="primary"
            size="small"
            v-if="$permissionValidate(671) && showPrintBtn(delivery)"
            @click="printf(delivery.deliverySn)"
            class="pull-right"
          >打印出货单</el-button>
          <el-button
            v-if="delivery.deliveryState === 0 && $permissionValidate(549)"
            class="pull-right all-refund-btn"
            type="primary"
            size="small"
            @click="allApplyRefund"
          >全部申请退款</el-button>
          <span class="pull-right">
            交期:
            <!-- deliveryType == 1 : 缺货单 -->
            <span
              :class="{'delivery-time-link': delivery.deliveryType === 1 }"
              @click="showDeliveryTypeDialog( delivery )"
            >{{ delivery.deliveryTime || '无'}}</span>
          </span>
        </p>
        <!-- <lc-table-config :base-config="formatTableBaseConfig( delivery )" @set-config="setOrderDetailDeliverConfig"></lc-table-config> -->
        <lc-table
          :config="formatTableBaseConfig( delivery )"
          :data="delivery.item.filter(v => v.number > 0)"
          :has-page="false"
        >
          <template slot-scope="scope">
            <!-- <template v-if="['trackingNumber','specification','companyName','name','lcCode','number','code','unit'].indexOf(scope.con.prop)>-1">
              {{scope.row[scope.con.prop]}}
            </template>-->
            <template v-if="scope.con.prop=='realShortNumber'">
              <template v-if="delivery.deliverySn=='refund'">
                {{scope.row.realShortNumber}}
                <router-link
                  v-if="$permissionValidate(406)"
                  :to="`/server/refunding?orderSn=${delivery.orderSn}`"
                  class="refund-introduce"
                >已退款</router-link>
              </template>
              <template
                v-else-if="( delivery.deliveryState!=3 && delivery.deliveryType == 1) || delivery.deliverySn == 'virtual' || delivery.deliverySn == 'unShipped' "
              >
                {{scope.row.realShortNumber}}
                <span
                  class="refund-introduce"
                  @click="refundOrProgressChange(scope.row,delivery.orderSn,delivery.deliverySn)"
                  v-if="scope.row.applyAfterSales == 0 && $permissionValidate(549)"
                >
                  <!--  && scope.row.purchaseProperty==0  2018.9.14 赠品可以申请-->
                  申请退款
                </span>
                <router-link
                  v-if="scope.row.applyAfterSales !== 0 && $permissionValidate(406)"
                  :to="`/server/refunding?orderSn=${delivery.orderSn}`"
                  class="refund-introduce"
                >已申请</router-link>
              </template>
              <template v-else>0</template>
            </template>
            <!-- <template v-else-if="['expirationDate'].indexOf(scope.con.prop)>-1">
              @change="changeLogistic"
              <el-date-picker clearable v-model="scope.row[scope.con.prop]" type="date" placeholder="选择日期" :editable="false" size="mini">
              </el-date-picker>
            </template>
            <template v-else-if="scope.con.prop=='remark'">
              @change="changeLogistic"
              <el-input v-model="scope.row[scope.con.prop]" type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" size="mini"></el-input>
            </template>-->
            <template v-else-if="scope.con.prop=='skuType'">{{formatSkuType(scope.row['skuType'])}}</template>
            <template v-else-if="scope.con.prop == 'wareHouse'">{{delivery.wareHouse}}</template>
            <template v-else-if="scope.con.prop == 'riskLevel'">
              <span
                class="success-risk"
                :class="{'danger-risk': scope.row[scope.con.prop] <= 2  }"
              >{{ formatRiskLevel( scope.row[scope.con.prop] ) }}</span>
            </template>
            <template v-else>
              {{scope.row[scope.con.prop]}}
              <!--  @change="changeLogistic" -->
              <!-- <el-input v-model="scope.row[scope.con.prop]" size="mini"></el-input> -->
            </template>
          </template>
        </lc-table>
      </template>
    </div>
    <refund-dialog
      v-if="!!deliveryListItem"
      @change-refund-state="changeRefundState"
      :delivery-list-item="deliveryListItem"
      :refund-detail-data="contactData"
      :orderSn="orderSn"
      :deliverySn="deliverySn"
      :member-id="memberId"
      :store-id="memberOrder.storeId"
    ></refund-dialog>

    <delivery-list
      v-if="deliveryListVisible"
      v-model="deliveryListVisible"
      :memberOrderItem="deliveryInfoList.filter( v => v.number > 0 )"
      @change-delivery-state="changeDeliveryState"
      :orderSn="orderSn"
    ></delivery-list>
    <el-dialog title="更改缺货单交期" v-model="visibleDeliveryTypeDialog" size="samll">
      <span>修改交期</span>
      <el-date-picker
        v-model="currDeliveryTime"
        type="date"
        placeholder="选择日期"
        @change="changeDeliveryTime"
      ></el-date-picker>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject, Prop } from "vue-property-decorator"
import API from "../../../API"
import { State, Action, Getter, Mutation } from "vuex-class"

import lcTableConfig from "../../../components/table/control.vue"
import lcTable from '../../../components/table/'
import { deliveryStates, refundStates } from '../const/orderSearchCondition'
import deliveryList from './deliveryList.vue'
import refundDialog from '../../../components/refundDialog.vue'
import { matchArrItem } from '../../../utils/'
import { skuTypes } from '../../product/const/index'
import { riskLevels } from '../../procurement/const/index'

const linkedCareStoreId = [ 5, 280, 282, 284 ] // 领健相关的 storeId

@Component( {
  name: "orde-detail-deliver",
  components: {
    lcTable,
    lcTableConfig,
    refundDialog,
    deliveryList
  }
} )
export default class OrderDetailDeliver extends Vue {
  @Prop( { default: {} } )
  memberOrder: any

  @Prop() deliveryList: any[]

  visibleDeliveryTypeDialog: boolean = false
  currDelivery: any = {}
  currDeliveryTime: string = ''

  showPrintBtn ( delivery ) {
    const { orderStatus, storeId } = this.memberOrder
    const { deliveryState, deliveryType } = delivery
    return [ 1, 2 ].indexOf( deliveryState ) > -1 && deliveryType === 0 && linkedCareStoreId.indexOf( storeId ) > -1

    // const { orderStatus, storeId } = this.memberOrder
    // return ( orderStatus == 1 || orderStatus == 2 || orderStatus == 5 ) && linkedCareStoreId.indexOf( storeId ) > -1

  }

  get contactData () {
    const { addressDetail } = this.memberOrder
    const address = addressDetail.split( ';' ) || []
    return {
      suppContactName: address[ 0 ] || '',
      suppContactTel: address[ 1 ] || ''
    }
  }

  get isShowCreateBtn () {
    const { storeInfo, storeId } = this.memberOrder

    let isExist = this.deliveryList.some( v => ( v.deliverySn == 'unShipped' || v.deliverySn == 'virtual' ) )

    let isNoNumber = this.deliveryList.filter( v => {
      const { deliverySn = '' } = v
      return [ 'unShipped', 'virtual' ].includes( deliverySn )
    } ).every( v => {
      const { item = [] } = v
      return item.every( i => {
        return +i.number === 0
      } )
    } )
    return isExist && ( storeInfo.distributeWay === 0 || storeInfo.distributeWay === 2 ) && !isNoNumber
    // return isExist && linkedCareStoreId.indexOf( storeId ) < 0 && storeInfo.distributeWay === 0 && !isNoNumber

  }

  get memberId () {
    return this.memberOrder.member
  }
  get deliveryInfoList () {
    let deliveryInfoListItem = this.deliveryList.filter( v => v.deliverySn == 'virtual' || v.deliverySn == 'unShipped' )[ 0 ]
    return ( deliveryInfoListItem && deliveryInfoListItem.item ) || {}
  }
  refundStates = refundStates
  orderSn: any = ''
  deliverySn: number
  deliveryListVisible: any = false
  refundOrProgressChange ( item, orderSn, deliverySn ) {

    this.deliveryListItem = { goodsInfo: [ item ], agreePriceString: +item.priceString, isOneRefund: 1 }
    this.orderSn = orderSn
    this.deliverySn = deliverySn
  }
  changeRefundState ( v ) {
    this.deliveryListItem = null
    if ( v ) {
      this.$emit( 'change-detail' )
    }
  }
  addShipping () {
    this.deliveryListVisible = true
    this.orderSn = this.$route.params.sn
  }
  deliveryListItem: object = null

  // @Mutation( "order/setOrderDetailDeliverConfig" ) setOrderDetailDeliverConfig
  // @Getter( "order/orderDetailDeliverListConfig" ) baseConfig

  @State( state => state.order.config13 ) baseConfig1
  // created() {
  //   console.log(1)
  //   this.deliveryList.forEach( val => {
  //     val.item.forEach( v => {
  //       let logis = ( val.logis || [] ).filter( m => m.skuDetail.indexOf( v.lcCode ) > -1 )[ 0 ] || {}
  //       v.companyName = logis.companyName
  //       v.trackingNumber = logis.logisticNo
  //     } )
  //   } )
  // }

  formatTableBaseConfig ( delivery ) {
    let tableConfig = this.baseConfig1
    let noColumns = []
    // 是否缺货单
    let isNoStock = delivery.deliveryType === 1
    // 是否出库，是否虚拟
    let outOfDelivry = delivery.deliveryState === 0 || delivery.deliverySn == 'virtual' || delivery.deliverySn == 'unShipped'
    if ( !isNoStock ) {
      noColumns = [ 'riskLevel' ]
      tableConfig = this.baseConfig1.filter( ( v, i ) => ( !noColumns.includes( v.prop ) ) )
    }
    if ( outOfDelivry ) {
      noColumns = [ 'companyName', 'trackingNumber', 'storage', 'lotNumber', 'expirationDate' ]
      return tableConfig.filter( ( v, i ) => ( !noColumns.includes( v.prop ) ) )
    } else {
      return tableConfig
    }
  }
  // changeLogistic() {
  //   this.$emit( "logistic-change", true )
  // }
  formatDeliverState ( { deliveryState, deliverySn } ) {
    if ( deliverySn === 'refund' ) {
      return '已退款'
    } else if ( deliverySn === 'virtual' ) {
      return '无出库单'
    } else if ( deliverySn === 'unShipped' ) {
      return '未出库'
    } else {
      return matchArrItem( deliveryState, deliveryStates, 'id' ).name
    }
  }

  formatSkuType ( skuType ) {
    return matchArrItem( skuType, skuTypes, 'id' ).name
  }

  formatRiskLevel ( level ) {
    return matchArrItem( level, riskLevels, 'id' ).name
  }

  get notOutOfWDeliveryItem () {
    return this.deliveryList.filter( v => v.deliveryState === 0 )
  }
  @Prop()
  refundAmount: number
  allApplyRefund () {
    let agreePriceString = this.refundAmount
    let deliveryItem: any = this.deliveryList.filter( v => v.deliveryState === 0 )
    this.deliveryListItem = { goodsInfo: deliveryItem && deliveryItem[ 0 ].item, isAllRefund: 1, agreePriceString }
    this.orderSn = deliveryItem && deliveryItem[ 0 ].orderSn
    this.deliverySn = deliveryItem && deliveryItem[ 0 ].deliverySn
  }
  changeDeliveryState ( { emitData, virtualNumList } ) {
    this.deliveryList.push( {
      item: emitData,
      deliveryState: 2,
      createDate: new Date()
    } )
    this.deliveryList.forEach( val => {
      let bo = virtualNumList.some( item => item.skuNum )
      if ( val.deliverySn === 'unShipped' || val.deliverySn === 'virtual' ) {
        if ( !bo ) {
          val.wantSlipsState = 2
        }
        val.item && val.item.forEach( value => {
          if ( bo ) {
            for ( let i = 0, l = virtualNumList.length; i < l; i += 1 ) {
              let virValue = virtualNumList[ i ]
              if ( value.skuId == virValue.skuId ) {
                value.number = virValue.skuNum
                value.skuNum = virValue.skuNum
                break
              }
            }
          } else {
            value.number = 0
            value.skuNum = 0
          }
        } )
      }

    } )
  }
  @Inject() formatMyDate

  printf ( id ) {
    this.$submit( API.printChuKuDan, {
      'deliverySn': id,
      'unitNum': 1
    } )
  }

  showDeliveryTypeDialog ( delivery ) {
    if ( delivery.deliveryType === 0 ) {
      return
    }
    this.currDelivery = delivery
    this.visibleDeliveryTypeDialog = true
  }

  changeDeliveryTime ( date ) {
    this.$http( API.updateDeliveryTime, {
      deliverySn: this.currDelivery.deliverySn,
      deliveryTime: date
    } ).then( res => {
      this.visibleDeliveryTypeDialog = false
      this.currDelivery.deliveryTime = date
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.msg || '修改错误'
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-date-editor.el-input
  width 140px
.order-detail-deliver__item
  > p
    border 2px solid #ccc
    line-height 35px
    padding 5px 20px 0
.refund-introduce
  text-decoration underline
  margin-left 5px
  cursor pointer
.all-refund-btn
  margin 0 -20px 0 10px
.delivery-time-link
  color #20a0ff
  cursor pointer
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>
<style lang="stylus">
.order-detail-deliver
  .el-table__body-wrapper
    z-index 1
  .el-dialog.el-dialog--samll
    width 20%
</style>
