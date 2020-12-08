<template>
  <div class="purchasing-plan-details">
    <lc-title text="采购计划详情">
      <slot>
        <el-button type="info" size="small">{{formatPurchasePlanStatus(purchasePlanStatu)}}</el-button>
      </slot>
    </lc-title>
    <purchasingPlanPanel
      v-if="isNotEmptyObj(purchasingPlanPanelData)"
      :title="`${purchasingPlanPanelData.planNo} ${formatePlanTime(purchasingPlanPanelData.startDate.time)} ~ ${formatePlanTime(purchasingPlanPanelData.endDate.time)}`"
    >
      <el-button
        slot="headerSlot"
        type="text"
        class="pull-right"
        @click="dealPurchasingPlan(purchasingPlanPanelData)"
        v-loading.fullscreen.lock="fullscreenLoading"
        v-if="$permissionValidateWithEnv(1160, 1155)"
      >{{formatPurchasePlanOperate(purchasePlanStatu)}}</el-button>
      <!-- start 未开始panelContent -->
      <template v-if="purchasePlanStatu == 1">
        <div
          class="panel-content"
        >备货SKU数：{{purchasingPlanPanelData.choiceSkuNum + '/' + purchasingPlanPanelData.shelfSkuSumNum}}</div>
      </template>
      <!-- end 未开始panelContent -->
      <!-- start 进行中panelContent -->
      <template v-else-if="purchasePlanStatu == 2">
        <div class="panel-content ongoing-panel-content">
          <proportion-img
            class="proportion-img-box"
            :config="purchasingPlanPanelData.purchasingDetailsData"
            style="width: 452px"
          ></proportion-img>
          <div
            class="ongoing-panel-details"
          >离计划截止还剩：{{compuCutOffTime(purchasingPlanPanelData.endDate.time)}} 交付延期SKU数：{{purchasingPlanPanelData.delaySkuNum}} 交付不足：{{purchasingPlanPanelData.shortageSkuNum}}</div>
        </div>
      </template>
      <!-- end 进行中panelContent -->
      <!-- start 待盘点panelContent -->
      <!-- purchasePlanStatu == 3 || purchasePlanStatu == 4 -->
      <template v-else>
        <div
          class="panel-content"
        >备货SKU数：{{purchasingPlanPanelData.choiceSkuNum + '/' + purchasingPlanPanelData.shelfSkuSumNum}} 交付不足SKU数：{{purchasingPlanPanelData.shortageSkuNum}} 交付延期SKU数：{{purchasingPlanPanelData.delaySkuNum}} 交付过量SKU数：{{purchasingPlanPanelData.excessSkuNum}}</div>
      </template>
      <!-- end 待盘点panelContent -->
    </purchasingPlanPanel>
    <purchasingPlanDetailsUnstartedTable
      v-if="purchasePlanStatu == 1"
      @updatePanelData="updatePanelData"
    ></purchasingPlanDetailsUnstartedTable>
    <purchasingPlanDetailsOngoingTable
      v-else-if="purchasePlanStatu == 2"
      @updatePanelData="updatePanelData"
    ></purchasingPlanDetailsOngoingTable>
    <purchasingPlanDetailsPendingInverntoryTable v-else></purchasingPlanDetailsPendingInverntoryTable>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import purchasingPlanPanel from './components/purchasingPlanPanel.vue'
import proportionImg from './components/proportionImg.vue'
import purchasingPlanDetailsUnstartedTable from './components/purchasingPlanDetailsUnstartedTable.vue'
import purchasingPlanDetailsOngoingTable from './components/purchasingPlanDetailsOngoingTable.vue'
import purchasingPlanDetailsPendingInverntoryTable from './components/purchasingPlanDetailsPendingInverntoryTable.vue'
import API from '../../API'
import { matchArrItem, isNotEmptyObj } from '../../utils'
import { purchasePlanStatus } from './const'

@Component( {
  name: 'purchasing-plan-details',
  components: {
    lcTitle,
    purchasingPlanPanel,
    proportionImg,
    purchasingPlanDetailsUnstartedTable,
    purchasingPlanDetailsOngoingTable,
    purchasingPlanDetailsPendingInverntoryTable
  }
} )
export default class purchasingPlanDetails extends Vue {
  @Inject() formatMyDate
  isNotEmptyObj = isNotEmptyObj
  purchasePlanStatu: number | string = 1
  riskLevel: number = 1
  fullscreenLoading = false

  page: any = {
    num: 10,
    cur: 1,
    total: 0
  }
  purchasePlanId
  created () {
    let { status, id } = this.$route.query
    this.purchasePlanStatu = status
    this.purchasePlanId = id
    this.getPurchasingInfo( id )
  }
  deactivated () {
    this.$destroy()
  }
  formatePlanTime ( time ) {
    return this.formatMyDate( time, 'yyyy/MM/dd' )
  }
  compuCutOffTime ( endtime ) {
    let curTime = Date.now()
    let timeDiff = endtime - curTime
    let day = Math.floor( timeDiff / ( 24 * 3600 * 1000 ) )
    let hours = Math.floor( ( timeDiff % ( 24 * 3600 * 1000 ) ) / ( 3600 * 1000 ) )
    return `${day}天${hours}小时`
  }
  purchasingPlanPanelData: any = {}
  filterNotMined ( num ) {
    return num < 0 ? 0 : num
  }
  getProportionImgConfig ( plan ) {
    let { deliveredSkuNum = 0, deliveringSkuNum = 0, choiceSkuNum = 0, notMined = this.filterNotMined( +choiceSkuNum - +deliveredSkuNum - +deliveringSkuNum ) } = plan
    return [ {
      content: `已交付：`,
      bgColor: '#008000',
      number: deliveredSkuNum,
      required: true
    }, {
      content: `交付中：`,
      bgColor: '#FF9900',
      number: deliveringSkuNum,
      required: true
    }, {
      content: `未采：`,
      bgColor: '#F40000',
      number: notMined,
      required: true
    } ]
  }
  updatePanelData () {
    this.getPurchasingInfo( this.purchasePlanId )
  }
  getPurchasingInfo ( id ) {
    this.$http( API.getPurchasePlanById, { id } ).then( ( { data, data: { plan } } ) => {
      // plan = !!plan ? plan : {}
      if ( this.purchasePlanStatu == 2 ) {
        this.purchasingPlanPanelData = {
          ...plan,
          purchasingDetailsData: this.getProportionImgConfig( plan )
        }
      } else {
        this.purchasingPlanPanelData = plan
      }
      if ( plan.status && this.$route.query.status != plan.status ) {
        this.$router.push( { path: '/procurement/purchasingPlanDetails', query: { id: this.purchasePlanId, status: plan.status.toString() } } )
      }
    } )
  }
  formatPurchasePlanStatus ( statu ) {
    return matchArrItem( +statu, purchasePlanStatus, 'id' ).name
  }
  formatPurchasePlanOperate ( statu ) {
    switch ( +statu ) {
      case 1:
        return '开始计划'
        break;
      case 2:
        return '结束计划'
        break;
      case 3:
        return '完成盘点'
        break;
      default:
        return ''
        break;
    }
  }
  @Watch( '$route' )
  changePlanDetailsStatus ( to, from ) {
    if ( from.path == '/procurement/purchasingPlanDetails' && to.path == '/procurement/purchasingPlanDetails' ) {
      this.$router.go( 0 )
    }
  }
  dealPurchasingPlan ( { id, status } ) {
    if ( status == 1 ) {
      this.fullscreenLoading = true
      setTimeout( () => {
        this.fullscreenLoading = false
        this.toNextStatus( { id, status } )
      }, 3000 )
    } else {
      this.toNextStatus( { id, status } )
    }
  }
  toNextStatus ( { id, status } ) {
    // TODO 传递和跳转皆为下一个状态，后台状态一变跳转可能会导致问题，需要优化
    this.$http( API.updatePlanStatus, { id, status: ( +status + 1 ) } ).then( ( { data } ) => {
      this.$router.push( { path: '/procurement/purchasingPlanDetails', query: { id, status: ( +status + 1 ).toString() } } )
    } ).catch( ( { data: err } ) => {
      this.$notify( {
        type: 'error',
        message: err.msg || '失败'
      } )
    } )
  }
}
</script>
<style lang='stylus' rel="stylesheet/stylus" scoped>
.flex
  display flex
  justify-content center
  align-items center
.purchasing-plan-details
  .ongoing-panel-content
    @extend .flex
    justify-content flex-start
  .ongoing-panel-details
    padding-left 20px
.ongoing-panel-purchases-number
  @extend .flex
  .purchases-number
    margin-right 10px
</style>


