<template>
  <div class="search-payment">
    <!-- 搜索客户 -->
    <el-form label-width="120px" class="el-row flex-wrap">
      <el-col :sm="12">
        <el-form-item label="请选择客户">
          <lc-customer-search @broadcast="broadcastItem($event, 'customerSearch')"></lc-customer-search>
        </el-form-item>
      </el-col>
      <el-col :sm="12">
        &nbsp;&nbsp;
        <el-button type="primary" @click="searchOper">搜索</el-button>
      </el-col>
    </el-form>
    <!-- 显示指定客户信息 -->
    <div class="search-body" v-if="customerInfo.customerName">
      <!-- 当前客户 -->
      <el-form label-width="120px" class="el-row flex-wrap">
        <el-col :sm="12">
          <el-form-item label="当前客户">{{ customerInfo.customerName }}</el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="SaaSCode">{{ customerInfo.saasCode }}</el-form-item>
        </el-col>
      </el-form>
      <!-- 退款原因 -->
      <el-card class="box-card">
        <el-form :model="refundForm" ref="refundForm" label-width="100px" class="demo-ruleForm">
          <el-form-item
            label="退款原因"
            prop="reason"
            :rules="{
              required: true, message: '退款原因不能为空'
            }"
          >
            <el-input type="textarea" v-model="refundForm.reason"></el-input>
          </el-form-item>
        </el-form>
      </el-card>
      <!-- 按 tab 选择加载组件 -->
      <div style="margin-top:15px">
        <el-tabs v-model="tab" @tab-click="tabClick">
          <el-tab-pane v-for="tab in tabs" :key="tab.prop" :label="'选择' + tab.label" :name="tab.prop">
            <component
              :is="tab.prop"
              :customerInfo="customerInfo"
              :ref="tab.prop"
              @selectedLists="selectedListsFunc"
            ></component>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 按钮功能区 -->
      <div style="text-align:center;margin-top:15px">
        <el-button type="primary" @click="submit('refundForm')">提交申请</el-button>
        <el-button type="default" @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCustomerSearch from '@/components/customerSearch.vue'
import refundService from '@/pages/receivable/components/refundService.vue'
import refundAccount from '@/pages/receivable/components/refundAccount.vue'
import refundVoucher from '@/pages/receivable/components/refundVoucher.vue'
import API from '@/API'

export default {
  name: 'submit-refund-apply',
  components: {
    lcCustomerSearch,
    refundService,
    refundAccount,
    refundVoucher
  },
  inject: [ 'formatMyDate' ],
  data() {
    return {
      // 三种退款类型数据
      tabData: {
        'refundService': { label: '服务单', dim: 3, listName: 'voucherServiceOrders' },
        'refundAccount': { label: '对账单', dim: 2, listName: 'voucherStatements' },
        'refundVoucher': { label: '付款凭证', dim: 4, listName: 'transactionFlowList' }
      },
      tab: 'refundService',
      selectedData: [],
      customerInfoSearch: {},
      customerInfo: {
        customerId: '',
        customerName: '',
        name: '上海碧波路诊所'
      },
      refundForm: {
        reason: ''
      }
    }
  },
  computed: {
    tab$Vm() {
      return this.$refs[ this.tab ] && this.$refs[ this.tab ][ 0 ]
    },
    // tab 菜单数据
    tabs () {
      const keys = Object.keys(this.tabData)
      return keys.map(v => {
        const { label } = this.tabData[v]
        return { prop: v, label }
      })
    },
    // 当前的 tab 数据配置
    curTabData () {
      return this.tabData[this.tab]
    }
  },
  methods: {
    tabClick() {
      this.selectedData = this.tab$Vm.selectedLists
    },
    getPaymentVoucherSn() {
      this.$http( API.getPaymentVoucherSn, { 'financialType': 2 } ).then( ( { data } ) => {
        this.voucherSn = data.data
      } )
    },
    broadcastItem( item, type ) {
      this.customerInfoSearch = item
    },
    formatDate( date = {} ) {
      return date.time ? this.formatMyDate( date.time ) : ''
    },
    searchOper() {
      if ( !this.customerInfoSearch.customerId ) {
        this.$notify( {
          type: 'warning',
          message: '请先选择客户'
        } )
        return
      }
      this.customerInfo = this.customerInfoSearch
    },
    cancel() {
      this.$router.replace( '/receivable/customerSettlement' )
    },
    selectedListsFunc( val ) {
      this.selectedData = val
    },
    params() {
      let officeOrderItem = ( this.selectedData && this.selectedData[ 0 ] ) || {}
      const { tenantId, officeId, officeName } = officeOrderItem
      const list = []

      switch (this.tab) {
        case 'refundService':
          list.push(...this.selectedData.map(item => {
            return { serviceSn: item.serviceSn }
          }))
          break
        case 'refundAccount':
          list.push(...this.selectedData.map(item => {
            return { accountCheckSn: item.accountCheckSn }
          }))
          break
        case 'refundVoucher':
          list.push(...this.selectedData.map(item => {
            return {
              paymentSn: item.voucherSn,
              refundAmount: item.refundAmount
            }
          }))
          break
        default:
      }

      return {
        customerId: this.customerInfo.customerId,
        // tenantId,
        // officeId,
        officeName,
        voucherSn: this.voucherSn,
        dimension: this.curTabData.dim,
        financialType: 2,
        remark: this.refundForm.reason,
        [ this.curTabData.listName ]: list
      }
    },
    /**
     * 提交申请
     */
    submit( formName ) {
      this.$refs[ formName ].validate( valid => {
        if ( valid ) {
          if ( !this.selectedData.length ) {
            this.$notify( {
              type: 'error',
              message: `未选中${this.curTabData.label}`
            } )
            return
          }
          if (
            this.tab === 'refundAccount' &&
            !( this.tab$Vm.currentWrittenOffTotalAmount < 0 )
          ) {
            this.$notify( {
              type: 'error',
              message: '可核销总金额合计值不为负'
            } )
            return
          }
          this.$http( API.submitReviewPaymentVoucher, this.params() )
            .then( ( { data } ) => {
              this.$notify( {
                type: 'success',
                message: data.msg || '提交审批成功'
              } )
              this.$router.replace( '/receivable/customerSettlement' )
            } )
            .catch( err => {
              this.$notify( {
                type: 'error',
                message: err.data.msg || '提交审批失败'
              } )
            } )
        } else {
          const { reason } = this.refundForm
          if ( !reason.trim() ) {
            this.$notify( {
              type: 'error',
              message: '退款原因不能为空'
            } )
          } else {
            this.$notify( {
              type: 'error',
              message: '表单提交失败'
            } )
          }
          return false
        }
      } )
    }
  },
  created() {
    this.getPaymentVoucherSn()
  },
  deactivated() {
    this.$destroy()
  }
}
</script>
