<template>
  <div class="statement-detail">
    <lc-title text="对账单详情">
      <span class="statement-status">{{detailStatementStatus}}</span>
    </lc-title>
    <el-row>
      <el-col :span="12">
        <el-card>
          <div class="statement-msg-item">
            <span>对账单号：</span>
            <span>{{detail.accountCheckSn}}</span>
          </div>
          <div class="statement-msg-item">
            <span>发起核对时间：</span>
            <span>{{ formatInitiateDate( detail.initiateDate ) }}</span>
          </div>
          <div class="statement-msg-item">
            <span>客户名称：</span>
            <span>{{detail.officeName}}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-steps :space="150" :active="active" align-center center>
          <el-step
            v-for="(item,index) in steps"
            :title="item.title"
            :description="item.desc"
            :key="index"
          ></el-step>
        </el-steps>
      </el-col>
    </el-row>
    <el-row>
      <el-tabs v-model="activeName">
        <el-tab-pane label="对账信息" name="accountCheck">
          <!-- 新增按出库单维度 -->
          <outbound-check
            v-if="accountDeliveryVOList.length"
            :list="accountDeliveryVOList"
            :canapplyInvoice="!hasInvoiceTab"
            :detail="detail"
            @reload="getStatementDetail"
          />
          <!-- 原订单维度 -->
          <account-check
            v-else
            :list="acountOrderVOList"
            :detail="detail"
            @reload="getStatementDetail"
          ></account-check>
        </el-tab-pane>
        <el-tab-pane label="发票信息" name="accountInvoice" v-if="hasInvoiceTab">
          <!-- <account-invoice :office-id="detail.officeId" :tenant-id="detail.tenantId" :account-check-sn="detail.accountCheckSn"></account-invoice> -->
          <component
            :is="activeName"
            :office-id="detail.officeId"
            :detail="detail"
            :tenant-id="detail.tenantId"
            :account-check-sn="detail.accountCheckSn"
          ></component>
        </el-tab-pane>
        <el-tab-pane label="支付信息" name="accountPayment" v-if="$permissionValidate( 1093 )">
          <account-payment @paid="changeStatementStatus" :amount="detail.paymentAmount"></account-payment>
        </el-tab-pane>
      </el-tabs>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import accountCheck from './components/accountCheck.vue'
import outboundCheck from './components/outboundCheck.vue'
import accountInvoice from './components/accountInvoice.vue'
import accountPayment from './components/accountPayment.vue'
import { statementStatus } from './const/serverConstant'

@Component({
  name: 'statement-detail',
  components: {
    lcTitle,
    accountCheck,
    outboundCheck,
    accountInvoice,
    accountPayment
  }
})
export default class StatementDetail extends Vue {
  @Inject() formatMyDate
  accountCheckSn: string = ''
  detail: any = {}
  acountOrderVOList: any[] = []
  accountDeliveryVOList: any[] = []

  activeName: string = 'accountCheck'
  dimension = '1'
  active: number = 0
  stepTitles: any[] = [
    { title: '已发起', value: 'initiateDate' },
    { title: '已核对', value: 'confirmDate' },
    { title: '已结算', value: 'settlementDate' },
  ]

  get steps() {
    let arr = []
    let currStep
    let data = this.detail

    this.stepTitles.forEach((step, index) => {
      let obj: any = {}
      obj.title = step.title
      if (data[step.value] && data[step.value].time) {
        obj.desc = this.formatMyDate(data[step.value].time)
        currStep = index + 1
      }
      arr.push(obj)
    })
    this.active = currStep
    return arr
  }
  get hasInvoiceTab() {
    // 已核对，已结算，部分核算
    return [1, 2, 3].indexOf(this.detail.statementStatus) > -1
  }

  get detailStatementStatus() {
    let str = ''
    statementStatus.some(item => {
      let value = item.id === this.detail.statementStatus
      if (value) {
        str = item.name
      }
      return value
    })
    return str
  }
  created() {

  }
  activated() {
    let { id = '' } = this.$route.params
    this.accountCheckSn = id
    this.getStatementDetail()
  }

  deactivated() {
    this.activeName = 'accountCheck'
    this.accountDeliveryVOList = []
    this.acountOrderVOList = []
  }
  getStatementDetail() {
    if (!this.accountCheckSn) {
      this.$notify({
        type: 'error',
        message: '对账单id不可为空'
      })
      return
    }
    this.$permissionValidateWithNotify(472)
    this.$http(API.statementDetail, {
      accountCheckSn: this.accountCheckSn
    }).then(({ data }) => {
      data = data.data || {}
      this.detail = data
      this.dimension = data.dimension
      //* dimension: 1：出库单维度 2：订单维度
      if (data.dimension === 1) {
        this.accountDeliveryVOList = data.accountDeliveryVOList
      } else {
        this.acountOrderVOList = data.acountOrderVOList
      }
      this.activateTab()
    })
  }

  formatInitiateDate(initiateDate) {
    if (initiateDate && initiateDate.time) {
      return this.formatMyDate(initiateDate.time)
    } else {
      return ''
    }
  }
  changeStatementStatus() {
    this.detail.statementStatus = 3 // 已结算
  }

  activateTab() {
    let { invoice } = this.$route.query
    if (this.hasInvoiceTab && invoice) {
      this.activeName = 'accountInvoice'
    }
  }

}

</script>

<style lang="stylus" scoped>
.statement-status
  margin-left 20px
  background #999
  color #fff
  padding 3px 25px
  font-size 14px
.statement-msg-item
  margin-bottom 10px
</style>

