<template>
  <div class="purchasing-plan-type-list">
    <lc-title text="未来计划" class="plan-title">
      <slot>
        <el-button
          v-if="$permissionValidateWithEnv(1147, 1144)"
          class="pull-right"
          type="primary"
          size="small"
          @click="createPurchasingPlan"
        >新建计划</el-button>
      </slot>
    </lc-title>
    <hr />
    <!-- begin xxx -->

    <!-- 文件上传弹框 -->
    <!-- <FileImport
      v-if="showFileImport"
      :showFileImport.sync="showFileImport"
      v-bind="uploadOptions"
      @refresh="uploadFileSuccess"
    ></FileImport>-->

    <!-- end xxx -->

    <purchasingPlanPanel
      v-if="isNotEmptyObj(unStartedPlan)"
      :title="`${unStartedPlan.planNo} ${formatePlanTime(unStartedPlan.startDate.time)} ~ ${formatePlanTime(unStartedPlan.endDate.time)}`"
    >
      <span
        slot="headerSlot"
        class="pull-right pramary pointer"
        @click="toPlanDetails(unStartedPlan.id, unStartedPlan.status)"
      >详情</span>
      <div
        class="panel-content"
      >备货SKU数：{{unStartedPlan.choiceSkuNum + '/' + unStartedPlan.shelfSkuSumNum}}</div>
    </purchasingPlanPanel>
    <lc-title text="进行中计划" class="plan-title" />
    <hr />
    <purchasingPlanPanel
      v-if="isNotEmptyObj(ongoingPlan)"
      :title="`${ongoingPlan.planNo} ${formatePlanTime(ongoingPlan.startDate.time)} ~ ${formatePlanTime(ongoingPlan.endDate.time)}`"
    >
      <span
        slot="headerSlot"
        class="pull-right pramary pointer"
        @click="toPlanDetails(ongoingPlan.id, ongoingPlan.status)"
      >详情</span>
      <div class="panel-content doing-panel-content">
        <proportion-img
          class="proportion-img-box"
          :config="getProportionImgConfig"
          style="width: 452px"
        ></proportion-img>
        <div
          class="doing-panel-details"
        >离计划截止还剩：{{compuCutOffTime(ongoingPlan.endDate.time)}} 交付延期SKU数：{{ongoingPlan.delaySkuNum}}</div>
      </div>
    </purchasingPlanPanel>
    <lc-title text="待盘点计划" class="plan-title" />
    <hr />
    <purchasingPlanTypeListTable
      :config="toBeCountedConfig"
      :data="toBeCountedTableData"
      status="3"
      @toPlanDetails="toPlanDetails"
    />
    <lc-title text="历史计划" class="plan-title" style="margin-top: 10px" />
    <hr />
    <div class="history-plane">
      <lc-condition :condition="condition" @submit="search" @reset-callBack="resetHistoryTableList"></lc-condition>
      <purchasingPlanTypeListTable
        :config="historyPlanConfig"
        :data="historyTableData"
        status="4"
        @toPlanDetails="toPlanDetails"
      />
      <el-pagination
        @current-change="curChange"
        class="center"
        :page-size="page.num"
        :current-page.sync="page.cur"
        layout="total, prev, pager, next, sizes"
        :total="page.total"
        @size-change="sizeChange"
        :page-sizes="page.sizes"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/index'
import lcCondition from '../../components/condition.vue'
import purchasingPlanPanel from './components/purchasingPlanPanel.vue'
import proportionImg from './components/proportionImg.vue'
import purchasingPlanTypeListTable from './components/purchasingPlanTypeListTable.vue'
import API from '../../API'
import { isNotEmptyObj } from '../../utils'
import { toBeCountedConfig, historyPlanConfig } from './const'
import tablePage from "./public/tablePage"


// 文件上传组件
import FileImport from "./fileImport";

@Component( {
  name: 'purchasing-plan-type-list',
  mixins: [tablePage],
  components: {
    lcTitle,
    lcTable,
    lcCondition,
    purchasingPlanPanel,
    proportionImg,
    purchasingPlanTypeListTable,
    FileImport
  }
} )
export default class purchasingPlanTypeList extends Vue {
  @Inject() formatMyDate
  isNotEmptyObj = isNotEmptyObj
  toBeCountedConfig = toBeCountedConfig
  historyPlanConfig = historyPlanConfig
  startEndTimeOptions = {
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
    }, {
      text: '最近一年',
      onClick ( picker ) {
        const end = new Date();
        const start = new Date();
        start.setTime( start.getTime() - 3600 * 1000 * 24 * 360 );
        picker.$emit( 'pick', [ start, end ] );
      }
    } ]
  }
  condition = [
    { value: '', key: 'startAndEndDate', label: '起止时间', type: 'daterange' },
  ]
  historyPlanStartEndTime: string = ''
  unStartedPlan: any = {}
  ongoingPlan: any = {}



  async activated () {
    this.unStartedPlan = await this.getPurchasingPlanListData( 1 )
    this.ongoingPlan = await this.getPurchasingPlanListData( 2 )
    this.toBeCountedTableData = await this.searchTableData( 3 )
    this.search()
  }
  toPlanDetails ( id, status ) {
    this.$router.push( { path: '/procurement/purchasingPlanDetails', query: { id, status } } )
  }
  compuCutOffTime ( endtime ) {
    let curTime = Date.now()
    let timeDiff = endtime - curTime
    let day = Math.floor( timeDiff / ( 24 * 3600 * 1000 ) )
    let hours = Math.floor( ( timeDiff % ( 24 * 3600 * 1000 ) ) / ( 3600 * 1000 ) ) // * 计算出天数后剩余的毫秒数/1000转化成秒再/60s/60min
    return `${day}天${hours}小时`
  }
  formatePlanTime ( time ) {
    return this.formatMyDate( time, 'yyyy/MM/dd' )
  }
  filterNotMined ( num ) {
    return num < 0 ? 0 : num
  }
  get getProportionImgConfig () {
    let { deliveredSkuNum = 0, deliveringSkuNum = 0, choiceSkuNum = 0, notMined = this.filterNotMined( +choiceSkuNum - +deliveredSkuNum - +deliveringSkuNum ) } = this.ongoingPlan
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
  async getPurchasingPlanListData ( status ) {
    let { data, data: { plan } } = await this.$http( API.getPlanByStatus, { status } )
    return !!plan ? plan : {}
  }
  formatOptions () {
    let param: any = {}
    let { num, cur } = this.page
    let start = num * ( cur - 1 )

    this.condition.forEach( v => {
      if ( v.value !== '' ) {
        param[ v.key ] = v.value
      }
    } )
    return {
      ...param,
      num,
      start,
    }
  }
  historyTableData: any = []
  toBeCountedTableData: any = []
  async searchTableData ( status ) {
    let fetchData
    if ( status == 3 ) {
      fetchData = await this.fetchPurchasePlanData( { ...this.formatOptions(), status } )
    } else {
      let { startAndEndDate = [] } = this.formatOptions()
      let starttime = startAndEndDate[ 0 ] && this.formatMyDate( startAndEndDate[ 0 ], 'yyyy-MM-dd' ) || null
      let endtime = startAndEndDate[ 1 ] && this.formatMyDate( startAndEndDate[ 1 ], 'yyyy-MM-dd' ) || null
      fetchData = await this.fetchPurchasePlanData( { ...this.formatOptions(), starttime, endtime, status } )
      this.page.total = fetchData.total
    }
    return fetchData.list
  }
  async fetchPurchasePlanData ( params ) {
    let { data } = await this.$http( API.searchPurchasePlan, params )
    return data.data
  }
  async resetHistoryTableList () {
    this.page.cur = 0
  }
  async search () {
    this.historyTableData = await this.searchTableData( 4 )
  }
  curChange ( v ) {
    this.page.cur = v
    this.search()
  }
  createPurchasingPlan () {
    this.$router.push( '/procurement/createPurchasingPlan' )
  }
}
</script>

<style lang="stylus" scoped>
.purchasing-plan-type-list {
  .plan-title {
    font-size: 20px;
    color: #333;
  }

  hr {
    width: 100%;
    height: 1px;
    border: none;
    background-color: #999;
  }

  .history-plane {
    .block {
      margin: 10px 0;

      .time-opeartion {
        overflow: hidden;
      }
    }
  }

  .doing-panel-content {
    position: relative;

    .proportion-img-box {
      line-height: normal !important;
      position: absolute;
      top: 50%;
      left: 9px;
      transform: translate(0, -50%);
    }

    .doing-panel-details {
      display: inline-block;
      padding-left: 475px;
    }
  }
}
</style>