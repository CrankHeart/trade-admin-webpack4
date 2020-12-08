<template>
  <el-row class="business-configuration-module" :gutter="10">
    <el-col :span="24" v-if="$permissionValidate(1041)">
      <el-button
        class="pull-right"
        type="primary"
        v-if="isEditStatus"
        @click="isEditStatus = false"
      >编辑</el-button>
      <template v-else>
        <el-button class="pull-right" type="primary" @click="saveConfiguration">保存</el-button>
        <el-button class="pull-right" type="primary" @click="cancelEditStatus">取消</el-button>
      </template>
    </el-col>
    <el-col :span="6" v-for="configuration in configurationList" :key="configuration.id">
      <el-card :header="configuration.label" class="box-card">
        <template v-if="configuration.postage">
          <div class="postage-config" v-for="option in configuration.option" :key="option.id">
            <h4>{{option.title}}</h4>
            <el-input
              type="textarea"
              :rows="5"
              v-model.trim="formInline[option.prop]"
              :disabled="isEditStatus"
            ></el-input>
          </div>
        </template>
        <el-form v-else>
          <el-form-item
            :label="configurationItem.name"
            v-for="configurationItem in configuration.option"
            :key="configurationItem.id"
          >
            {{configurationItem.value}}
            <el-input
              v-if="configurationItem.type=='input'"
              v-model.trim="formInline[configurationItem.prop]"
              :disabled="isEditStatus"
            ></el-input>
            <el-input
              v-else-if="configurationItem.type=='number'"
              v-model.trim="formInline[configurationItem.prop]"
              :disabled="isEditStatus"
              type="number"
              :min="configurationItem.min || 1"
            ></el-input>
            <el-switch
              v-else-if="configurationItem.type=='switch'"
              v-model="formInline[configurationItem.prop]"
              :disabled="isEditStatus"
            ></el-switch>
            <el-radio-group
              v-else-if="configurationItem.type=='radio' && configurationItem.prop == 'settlementType'"
              v-model="formInline[configurationItem.prop]"
              :disabled="isEditStatus"
            >
              <el-radio
                v-for="option in configurationItem.options"
                :disabled="option.label==1&&isDisabled"
                :key="option.name"
                :label="option.label"
              >{{option.name}}</el-radio>
            </el-radio-group>
            <el-radio-group
              v-else-if="configurationItem.type=='radio'"
              v-model="formInline[configurationItem.prop]"
              :disabled="isEditStatus"
            >
              <el-radio
                v-for="option in configurationItem.options"
                :key="option.name"
                :label="option.label"
              >{{option.name}}</el-radio>
            </el-radio-group>
            <span v-else></span>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from "vue-property-decorator"
import API from '../../../API'
@Component( {
  name: "business-configuration-module",
  components: {
  }
} )
export default class businessConfigurationModule extends Vue {
  isEditStatus: boolean = true
  @Prop( { default: {} } )
  detail

  @Watch( 'detail', { immediate: true } )
  detailWatcher ( v ) {
    this.initData()
  }

  @Watch( 'formInline', { deep: true } )
  formInlineWatcher ( v ) {
    if ( v.distributeWay == 2 || v.distributeWay == 0 ) {
      this.formInline.settlementType = 0
    }
  }

  get isDisabled () {
    // 如果是手工配货和商家托管配货,对账方式不支持按订单维度
    if ( this.formInline.distributeWay == 2 || this.formInline.distributeWay == 0 ) {
      return true
    }
    return false
  }

  formInline: any = {
    consignment: false,
    groundDiscountAuditType: 0,
    paymentVoucherWriteoffType: 0, // 0:不自动核销 1：自动核销
    enablePoint: 0,
    enableVoucherCoupon: 0,
    distributeWay: 0,
    consignor: '',
    orderExpiredTime: 24,
    postageDescription: '',
    voucher: false,
    isMonthly: 0,
    settlementType: 0
  }
  commonConfiguration: any = [
    { id: 0, type: 'switch', prop: 'consignment', name: '是否寄售商家' },
    { id: 1, type: 'switch', prop: 'groundDiscountAuditType', name: '地推优惠自动审核' },
    { id: 2, type: 'switch', prop: 'paymentVoucherWriteoffType', name: '付款凭证自动核销' },
    { id: 3, type: 'number', prop: 'orderExpiredTime', name: '订单未付款自动取消时间(单位小时)', min: 1 },
    { id: 3, type: 'switch', prop: 'enablePoint', name: '是否支持积分抵扣' },
    { id: 4, type: 'switch', prop: 'enableVoucherCoupon', name: '是否支持代金券抵扣' }
  ]
  storageConfiguration: any = [
    {
      id: 0, type: 'radio', prop: 'distributeWay', name: '配货方式', options: [
        { label: 0, name: '手工配货' },
        { label: 1, name: '接口配货' },
        { label: 2, name: '商家托管配货' }
      ]
    },
    { id: 1, type: 'input', prop: 'consignor', name: '货主编码' }

  ]
  settleConfiguration: any = [
    { id: 0, type: 'switch', prop: 'voucher', name: '是否通过付款凭证确认结算' },
    {
      id: 1, type: 'radio', prop: 'settlementType', name: '对账方式', options: [
        { label: 0, name: '按订单', disabled: false },
        { label: 1, name: '按出库单', disabled: true }
      ]
    },
    { id: 2, type: 'switch', prop: 'isMonthly', name: '月结额度控制' }
  ]
  postageConfiguration: any = [
    { id: 0, title: '包邮政策说明', prop: 'postageDescription' }
  ]
  configurationList: any = [
    { id: 0, label: '通用配置', option: this.commonConfiguration },
    { id: 1, label: '派单配置', option: this.storageConfiguration },
    { id: 2, label: '结算配置', option: this.settleConfiguration },
    { id: 3, label: '运费规则配置', postage: true, option: this.postageConfiguration }
  ]
  initData () {
    const propStr = [ 'consignor', 'postageDescription', 'distributeWay', 'orderExpiredTime' ]
    Object.keys( this.formInline ).forEach( v => {
      if ( this.formInline.hasOwnProperty( v ) ) {
        if ( v == 'settlementType' ) {
          // 对账方式
          this.formInline[ v ] = this.detail[ v ]
        } else {
          this.formInline[ v ] = ~propStr.indexOf( v ) ? this.detail[ v ] : !!this.detail[ v ]
        }
      }
    } )
  }
  cancelEditStatus () {
    this.isEditStatus = true
    this.initData()
  }
  formatParam () {
    let { consignment, groundDiscountAuditType, paymentVoucherWriteoffType, enablePoint, enableVoucherCoupon, distributeWay, consignor, voucher, isMonthly, postageDescription = '', settlementType = 0, orderExpiredTime = 0 } = this.formInline
    return {
      consignment: +consignment,
      distributeWay: +distributeWay,
      groundDiscountAuditType: +groundDiscountAuditType,
      paymentVoucherWriteoffType: +paymentVoucherWriteoffType,
      enablePoint: +enablePoint,
      enableVoucherCoupon: +enableVoucherCoupon,
      orderExpiredTime: +orderExpiredTime,
      consignor,
      postageDescription,
      voucher: +voucher,
      isMonthly: isMonthly,
      id: this.detail.id,
      settlementType: settlementType
    }
  }
  checkParam ( param ) {
    let isOk = {
      msg: '',
      value: true
    }
    if ( parseInt( param.orderExpiredTime ) <= 0 ) {
      isOk.msg = '订单未付款自动取消时间不能小于等于0'
      isOk.value = false
    }
    return isOk
  }
  saveConfiguration () {
    const param = this.formatParam()
    let checkInfo = this.checkParam( param )
    if ( !checkInfo.value ) {
      this.$notify( {
        type: 'error',
        message: checkInfo.msg
      } )
      return
    }
    this.$http( API.updateStoreSwitch, param ).then( res => {
      this.isEditStatus = true
      this.$emit( 'change-consign', param.consignment )
      this.$notify( {
        type: 'success',
        message: '操作成功'
      } )
    }, rej => {
      this.$notify( {
        type: 'error',
        message: rej.data.msg
      } )
    } )
  }


}
</script>
<style lang="stylus" scoped>
.postage-config
  h4
    margin-bottom 10px
</style>
<style lang="stylus">
.box-card
  .el-input
    width 70%
</style>
