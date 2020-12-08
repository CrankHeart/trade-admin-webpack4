<template>
  <div>
    <lc-title text="供应商详情">
      <span
        class="supplier-enable"
        :class="{'active-bg': supplierEnable.id === 0, 'inactive-bg': supplierEnable.id !== 0 }"
      >{{supplierEnable.name}}</span>
      <span class="supplier-enable progress-bg">{{progressName}}</span>
      <el-button
        class="pull-right"
        type="primary"
        v-if="$permissionValidate(636)"
        @click="editSupplier"
      >编辑</el-button>
      <template v-if="detail.processStatus==1">
        <el-button
          class="pull-right"
          type="primary"
          v-if="$permissionValidateWithEnv(1169,1165)"
          @click="confirmSupplier"
        >提交首营审核</el-button>
      </template>
    </lc-title>
    <el-card class="box-card" body-style="flex:1;display:flex">
      <div class="card-item">
        <div class="detail-title">基本信息</div>
        <div class="detail-items">
          <div class="detail-item">
            <label>名称：</label>
            <span>{{detail.supplierName}}</span>
          </div>
          <div class="detail-item">
            <label>类别:</label>
            <span>{{detail.category}}</span>
            <label></label>
            <span style="color:#20a0ff; cursor:pointer" @click="showCategoryInfo">查看生产范围</span>
          </div>
          <div class="detail-item">
            <label>负责人：</label>
            <span>{{detail.personInCharge}}</span>
            <label>手机号：</label>
            <span>{{detail.companyMobile}}</span>
          </div>
          <div class="detail-item">
            <label>联系人：</label>
            <span>{{detail.contactName}}</span>
            <label>座机号：</label>
            <span>{{detail.contactTel}}</span>
          </div>
          <div class="detail-item">
            <label>法人:</label>
            <span>{{detail.legalPerson}}</span>
            <label>质量负责人</label>
            <span>{{detail.quPerson}}</span>
          </div>
          <div class="detail-item">
            <label>地址：</label>
            <span>{{detail.companyAddress + detail.companyDetail}}</span>
          </div>
          <div class="detail-item">
            <label>邮编:</label>
            <span>{{detail.zipCode}}</span>
          </div>

          <div class="detail-item">
            <label>备注:</label>
            <span>{{detail.remark}}</span>
          </div>
        </div>
      </div>
      <div class="card-item">
        <div class="detail-title">结算信息</div>
        <div class="detail-items">
          <div class="detail-item">
            <label>开户行：</label>
            <span>{{detail.bankName}}</span>
          </div>
          <div class="detail-item">
            <label>银行账号：</label>
            <span>{{detail.settlementAccounts}}</span>
          </div>
          <div class="detail-item">
            <label>结算方式：</label>
            <span>{{settlementMethod}}</span>
          </div>
          <div class="detail-item">
            <label>发票类型：</label>
            <span>{{invoiceType}}</span>
          </div>
        </div>
      </div>
      <div class="card-item">
        <div class="detail-title">标签</div>
        <div class="detail-items">
          <div class="detail-item">
            <label>运费：</label>
            <span>{{detail.freeShipping}}</span>
          </div>
          <div class="detail-item">
            <label>开票习惯：</label>
            <span>{{detail.invoiceHabit}}</span>
          </div>
          <div class="detail-item">
            <label>起订量：</label>
            <span>{{detail.minimumQuantity}}</span>
          </div>
          <div class="detail-item">
            <label>优惠政策：</label>
            <span>{{detail.preferentialPolicy}}</span>
          </div>
        </div>
      </div>
    </el-card>
    <div class="supplier-pans">
      <el-tabs v-model="activePane">
        <el-tab-pane
          v-for=" item in  supplierPanes"
          :key="item.label"
          :label="item.label"
          :name="item.component"
        >
          <keep-alive>
            <component
              v-if="activePane===item.component"
              :is="item.component"
              :supplier-id="supplierId"
            ></component>
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="生产范围" :visible.sync="categoryDialogVisible" size="tiny">
      <span>{{detail.categoryDesc||'暂无内容'}}</span>
    </el-dialog>

    <el-dialog
      title="审核"
      :visible.sync="showConfirmDialogVisible"
      size="large"
      @close="closeDialog"
      @open="showConfirmDialogOpen"
    >
      <supplier-confirm
        :supplier-id="supplierId"
        @submit="confirmSubmit"
        ref="showConfirmDialogInner"
      ></supplier-confirm>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import supplierConfirm from '@/pages/procurement/supplierConfirm.vue'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import { supplierEnables, settlementMethods, invoiceTypes, supplierProcessStatus } from './const/index'
import brandManagement from './components/brandManagement.vue'
import productManagement from './components/productManagement.vue'
import reconciliationDetails from './components/reconciliationDetails.vue'
import aptitudeManagement from './components/aptitudeManagement.vue'

@Component( {
  name: 'supplier-detail',
  components: {
    lcTitle,
    brandManagement,
    productManagement,
    reconciliationDetails,
    aptitudeManagement,
    supplierConfirm
  }
} )
export default class supplierDetail extends Vue {
  @Mutation( 'supplier/setSupplierDetail' ) setSupplierDetail

  detail: any = {}
  activePane: string = ''

  categoryDialogVisible = false
  showConfirmDialogVisible = false


  supplierPanes: Array<any> = [
    {
      label: '对账明细',
      component: 'reconciliationDetails'
    },
    {
      label: '品牌管理',
      component: 'brandManagement'
    },
    {
      label: '商品管理',
      component: 'productManagement'
    },
    {
      label: '资质管理',
      component: 'aptitudeManagement'
    }
  ]

  basicInfo: any[] = []

  get progressName () {
    if ( this.detail.id ) {
      // 1：待提交，2：待业务部门审核，3：待质量部门审核，4：待总经理审核，5：审核通过'
      const proNames = supplierProcessStatus;
      let proInfo = proNames.find( item => item.id == this.detail.processStatus );
      return proInfo.name || '待提交';
    }
    return '';
  }

  get supplierEnable (): any {
    let status = this.detail.supplierEnable
    let state: any = supplierEnables.filter( v => v.id === status )[ 0 ] || {}
    return state
  }

  get invoiceType (): string {
    let strs: string[] = []
    let { invoiceType, taxPoint } = this.detail
    let type: any = invoiceTypes.filter( v => v.id === invoiceType )[ 0 ] || {}
    strs.push( type.name )
    strs.push( taxPoint + '%税点' )
    return strs.join( ' ' )
  }

  get settlementMethod (): string {
    let strs: string[] = []
    let { settlementMethod, accountPeriod, settlementDay } = this.detail
    let method: any = settlementMethods.filter( v => v.id === settlementMethod )[ 0 ] || {}
    strs.push( method.name )
    if ( method.id === 1 ) {
      strs.push( accountPeriod + '月账期' )
      strs.push( '当月' + settlementDay + '日结账' )
    }

    return strs.join( ' ' )
  }

  get supplierId () {
    return +this.$route.params.id
  }

  created () {
    this.activePane = this.supplierPanes[ 0 ].component
  }

  activated () {
    this.loadData()
  }

  loadData () {
    let param = this.$route.params
    this.$http( API.getSupplierInfoDetail, param ).then( ( { data } ) => {
      this.detail = data.data
      this.setSupplierDetail( data.data )
    } )
  }

  showCategoryInfo () {
    this.categoryDialogVisible = true
  }


  editSupplier () {
    this.$router.push( `/procurement/editSupplier/${this.detail.id}` )
    // this.$router.push({ path: `/procurement/editSupplier/${this.detail.id}`, query: { plan: 'private' }})
  }

  formatSettlementMethods ( type ) {
    let method = this.detail.settlementMethod
    let state: any = settlementMethods.filter( v => v.id === method )[ 0 ] || {}
    return state && state.name
  }

  formatInvoiceTypes ( type ) {
    let str: string = ''
    let invoice = this.detail.invoiceType
    let state: any = invoiceTypes.filter( v => v.id === invoice )[ 0 ] || {}

    return state && state.name
  }

  showConfirmDialogOpen () {
    console.log( this.$refs.showConfirmDialogInner )
    this.$refs.showConfirmDialogInner && this.$refs.showConfirmDialogInner.loadData()
  }
  confirmSupplier () {
    this.showConfirmDialogVisible = true
  }

  closeDialog () {
    // this.supplierId = null
  }

  confirmSubmit ( res ) {
    this.showConfirmDialogVisible = false
    this.loadData()
  }


}

</script>


<style lang="stylus" scoped>
.supplier-enable
  color #ffffff
  padding 5px 15px
  font-size 12px
.active-bg
  background #67c23a
.progress-bg
  background #20a0ff
.inactive-bg
  background #cccccc
.detail-title
  font-size 16px
  padding 10px
.detail-items
  padding 10px 10px 0
.detail-item
  margin-bottom 10px
  label
    width 20%
  span
    margin-right 30px
.box-card
  display flex
  font-size 14px
  margin-bottom 10px
  .card-item
    flex 1
    border-right 1px solid #d1dbe5
    padding-left 10px
    &:first-child
      padding-left 0
    &:last-child
      border-right none
</style>
