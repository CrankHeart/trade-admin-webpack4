<template>
  <div id="business-detail">
    <lc-title text="商家详情">
      <el-button
        :type="detail.isDoBusiness ?'primary':''"
        size="small"
      >{{formatIsBusiness(detail.isDoBusiness)}}</el-button>
      <el-button
        class="pull-right"
        type="primary"
        @click="businessDetailDialogShow = true"
        v-if="$permissionValidate(520)"
      >编辑</el-button>
    </lc-title>
    <el-row class="basic-info-box" :gutter="20" v-if="$permissionValidate(520)">
      <el-col :span="14">
        <el-card :header="'基本信息'">
          <ul class="basic-info">
            <li>
              <i>名 称:</i>
              {{detail.storeName || '空'}}
            </li>
            <li>
              <span>
                <i>企业名称:</i>
                {{detail.companyName || '空'}}
              </span>
              <i>企业类型:</i>
              {{formatCompanyType(detail.companyType) || '空'}}
            </li>
            <li>
              <span>
                <i>联 系 人:</i>
                {{detail.contact || '空'}}
              </span>
              <i>电 话:</i>
              {{detail.storeMobile || '空'}}
            </li>
            <li>
              <i>商家标识:</i>
              {{detail.storeIdentifier || '空'}}
            </li>
            <!-- <li>
              <span><i>是否寄售:</i> {{ +detail.consignment === 1 ? '是' : '否' || '空'}}</span>
              <i>是否托管:</i> {{ +detail.trusteeship === 1 ? '是' : '否' || '空'}}
            </li>
            <li><i>货 主:</i> {{detail.consignor || '空'}}</li>-->
            <li>
              <i>地 址:</i>
              {{detail.address || '空'}}
            </li>
            <li>
              <i>备 注:</i>
              {{detail.remark || '空'}}
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card :header="'结算信息'">
          <ul class="basic-info">
            <li>
              <i>开 户 行:</i>
              {{detail.bankOfDeposit || '空'}}
            </li>
            <li>
              <i>银行账号:</i>
              {{detail.bankAccount || '空'}}
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName">
      <el-tab-pane name="businessProduct" label="店铺商品" v-if="$permissionValidate(521)">
        <business-product-module v-if="activeName=='businessProduct'"></business-product-module>
      </el-tab-pane>
      <el-tab-pane name="businessCustomer" label="店铺客户" v-if="$permissionValidate(522)">
        <business-customer-module
          v-if="activeName=='businessCustomer'"
          :detail="detail"
          :consignment="consignment"
        ></business-customer-module>
      </el-tab-pane>
      <el-tab-pane name="businessConfiguration" label="商家配置" v-if="$permissionValidate(1040)">
        <business-configuration-module
          v-if="activeName=='businessConfiguration'"
          :detail="detail"
          @change-consign="changeConsignment"
        ></business-configuration-module>
      </el-tab-pane>
      <el-tab-pane name="businessInvoice" label="发票配置" v-if="$permissionValidate(1133)">
        <business-invoice v-if="activeName=='businessInvoice'" :detail="detail"></business-invoice>
      </el-tab-pane>
    </el-tabs>

    <business-detail-dialog
      v-if="businessDetailDialogShow"
      v-model="businessDetailDialogShow"
      :business-detail="detail"
      :id="detail.id"
      @change-dialog="businessDialog"
    ></business-detail-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop, Inject, Watch } from "vue-property-decorator"
import lcTitle from "../../components/title.vue"
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/index'
import { goodStatuses } from '../product/const/'
import { isDoBusinesses, companyTypes } from './const/'
import { matchArrItem } from '../../utils/'
import businessDetailDialog from './components/businessDetailDialog.vue'
import businessProductModule from './components/businessProductModule.vue'
import businessCustomerModule from './components/businessCustomerModule.vue'
import businessConfigurationModule from './components/businessConfigurationModule.vue'
import businessInvoice from './components/businessInvoice.vue'
import API from '../../API'

@Component( {
  name: "business-detail",
  components: {
    lcTitle,
    businessDetailDialog,
    lcCondition,
    lcTable,
    businessProductModule,
    businessCustomerModule,
    businessConfigurationModule,
    businessInvoice
  }
} )
export default class businessDetail extends Vue {
  detail: any = {}
  businessDetailDialogShow: any = false

  activeName: any = 'businessProduct'

  get id () {
    return this.$route.params.id
  }
  get consignment () {
    return this.detail.consignment
  }

  formatIsBusiness ( id ) {
    return matchArrItem( id, isDoBusinesses, 'id' ).name
  }
  formatCompanyType ( id ) {
    return matchArrItem( id, companyTypes, 'id' ).name
  }
  changeConsignment ( v ) {
    this.detail.consignment = v
  }

  businessDialog ( v ) {
    if ( v ) {
      this.detail = v.detail
      this.detail.provinceId = v.area[ 0 ]
      this.detail.cityId = v.area[ 1 ]
      this.detail.countryId = v.area[ 2 ]
    }
    this.businessDetailDialogShow = false
  }

  activated () {
    this.$http( API.getStoreInfoDetail, { id: this.id } ).then( ( { data } ) => {
      this.detail = data.data
    } )
  }
  deactivated () {
    this.activeName = 'businessProduct'
  }
}
</script>
<style lang="stylus" scoped>
.basic-info-box
  margin-bottom 20px
.basic-info
  li
    height 24px
    line-height 24px
    overflow hidden
    white-space nowrap
    text-overflow ellipsis
    width 100%
    span
      display inline-block
      width 60%
    i
      font-style normal
      display inline-block
      width 70px
      text-align right
      margin-right 10px
</style>
<style lang="stylus">
#business-detail
  .el-card__body
    min-height 180px
</style>
