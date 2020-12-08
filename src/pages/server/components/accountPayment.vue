<template>
  <div class="account-payment">
    <template v-if="hasPaymentMsg">
    <template v-if="offlineInfo.length > 0" >
        <div class="account-item" v-for="item in offlineInfo" :key="item.id">
        <div class="account-item-title">
          <span>{{ formatTime(item.actualPayDate)}}</span>
          <span>{{ formatVoucherType( item.voucherType )}}</span>
          <span  > ￥ {{ formatOffAmount( item) }}</span>
        </div>
        <el-card>
          <p v-for=" key in formatItems ( item )" :key="key.prop">
            <span>{{ key.label }}：</span>
            <span v-if="key.prop === 'paymentType'">{{formatPaymentType(item.paymentType)}}</span>
            <span v-else>{{item[key.prop]}}</span>
          </p>
        </el-card>
      </div>
    </template>
    <template v-if="Object.keys(onlineInfo).length > 0">
      <div class="account-item" >
        <div class="account-item-title">
          <span>{{ formatTime(onlineInfo.paymentDate)}}</span>
          <span>线上支付</span>
          <span> ￥ {{ Number( onlineInfo.amountPaid ).toFixed(2) }}</span>
        </div>
        <el-card>
          <p>
            <span>支付方式：</span>
            <span>{{formatPaymentMethod(onlineInfo.paymentMethod)}}</span>
          </p>
          <p>
            <span>商家流水号：</span>
            <span>{{onlineInfo.paymentTradeNo}}</span>
          </p>
        </el-card>
      </div>
    </template>
      <div class="account-footer" v-if="Number( unWrittenOffAmount) != 0" >
        <p>还剩余 ￥{{ Number( unWrittenOffAmount).toFixed( 2 )}} 未支付</p>
        <p >
          <el-button v-if="$permissionValidate(1094)" :disabled="!isSmoothAmount" type="primary" @click="smoothDifference">抹平差额</el-button>
          <el-button v-if="$permissionValidate(1095)" :disabled="isSmoothAmount" type="primary" @click="showInnerPayment">内部支付</el-button>
        </p>
      </div>
      <div class="account-footer" v-else >
        <p>已全部支付</p>
      </div>
      <el-dialog size="small" title="内部支付原因" v-model="showInnerPaymentDialog" >
        <el-form :model="innerPayReasonObj" label-width="150px" ref="innerPay">
          <el-form-item label="内部支付原因" prop="innerPayReason" :rules="[ { required: true, message: '支付原因为空'} ]">
            <el-input v-model="innerPayReasonObj.innerPayReason"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading="confirmBtnDisabled" @click="innerPayment">确定</el-button>
        </span>
      </el-dialog>
    </template>
    <div v-else class="no-account-payment">
      暂无支付信息
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import { voucherTypes, paymentTypes, onLinePaymentTypes } from '@/pages/server/const/paymentVoucherConst.ts'
import { matchArrItem } from '../../../utils'
import API from '../../../API'

@Component( {
  name: 'account-payment',
  components: {
  }
} )
export default class AccountInvoice extends Vue {
  @Prop( { default: 0 } ) amount: number
  // @Prop( { default: '' } ) type: string
  @Inject() formatMyDate
  id: string = ''

  innerPayReasonObj = {
    innerPayReason: ''
  }
  confirmBtnDisabled: boolean = false
  offlineInfo: any[] = []
  onlineInfo: any = {}
  unWrittenOffAmount: number = 0

  showInnerPaymentDialog: boolean = false

  get isSmoothAmount () {
    if ( this.amount === 0 ) {
      return false
    }
    let diff = this.unWrittenOffAmount / this.amount
    return diff <= 0.001
  }
  get hasPaymentMsg () {
    return this.offlineInfo.length > 0 || Object.keys( this.onlineInfo ).length > 0
  }

  // get isInnerPayment(){
  //   return !this.isSmoothAmount && this.unWrittenOffAmount > 0
  // }

  activated () {
    this.id = this.$route.params.id
    this.getPaymentInfo()
  }

  getPaymentInfo () {
    this.$permissionValidateWithNotify( 1093 )
    this.$http( API.paymentInfo, {
      accountCheckSn: this.id
    } ).then( ( { data } ) => {
      let d = data.data
      this.offlineInfo = d.offlineInfo || []
      this.onlineInfo = d.onlineInfo || {}
      this.unWrittenOffAmount = d.unWrittenOffAmount || 0
    } )
  }

  formatItems ( item ) {
    let keys = []
    switch ( item.voucherType ) {
      case 1:
        keys = [
          { label: '支付方式', prop: 'paymentType' },
          { label: `付款凭证编号`, prop: 'voucherSn' },
          { label: '商家流水号', prop: 'lcTradeSn' }
        ]
        break
      case 2:
        keys = [
          { label: '付款凭证编号', prop: 'voucherSn' }
        ]
        break
      case 3:
        keys = [
          { label: '付款凭证编号', prop: 'voucherSn' },
          { label: '内部支付原因', prop: 'innerPayReason' }
        ]
        break
      case 5:
        keys = [
          { label: '退款申请编号', prop: 'voucherSn' },
          { label: '商家流水号', prop: 'lcTradeSn' }
        ]
        break
    }
    return keys
  }

  formatOffAmount ( item ) {
    let { voucherStatements } = item
    let amount = ''
    voucherStatements.some( v => {
      let isValue = v.accountCheckSn === this.id
      if ( isValue ) {
        amount = v.writtenOffAmount
      }
      return isValue
    } )
    return amount
  }

  formatTime ( obj: any = {} ) {
    return this.formatMyDate( obj.time ) || ''
  }

  formatVoucherType ( type ) {
    let item = matchArrItem( type, voucherTypes, 'id' )
    return item.name || ''
  }
  formatPaymentType ( type ) {
    let item = matchArrItem( type, paymentTypes, 'id' )
    return item.name || ''
  }
  formatPaymentMethod ( method ) {
    let item = matchArrItem( method, onLinePaymentTypes, 'id' )
    return item.name || ''
  }

  smoothDifference () {
    // let type = this.type === 'order' ? '订单' : '对账单'

    let message = `确定抹平该对账单剩余未核销金额${Number( this.unWrittenOffAmount ).toFixed( 2 )}，将对账单设置为已结算吗？`
    this.$confirm( message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( res => {
      this.handelSpecialVoucher( this.formatParam() )
    } )
  }

  showInnerPayment () {
    this.showInnerPaymentDialog = true
  }

  innerPayment () {
    let isValid = false
    let form: any = this.$refs[ 'innerPay' ]
    form.validate( ( valid ) => {
      isValid = valid
      return isValid
    } )
    if ( !isValid ) {
      return
    }
    this.confirmBtnDisabled = true
    let param = this.formatParam()

    this.handelSpecialVoucher( {
      ...param,
      innerPayReason: this.innerPayReasonObj.innerPayReason
    } ).then( res => {
      this.confirmBtnDisabled = false
      this.showInnerPaymentDialog = false
    } ).catch( err => {
      this.confirmBtnDisabled = false
    } )
  }

  handelSpecialVoucher ( param ) {

    return this.$http( API.getPaymentVoucherSn, { financialType: 1 } ).then( ( { data } ) => {
      this.$http( API.handelSpecialVoucher, {
        ...param,
        voucherSn: data.data || '',
        broadcast: true
      } ).then( ( res ) => {
        this.getPaymentInfo()
        this.$emit( 'paid' )
      } )
    } )

  }

  formatParam () {
    let voucherType = this.isSmoothAmount ? 2 : 3
    let accountCheckSn = this.id
    return {
      voucherType,
      accountCheckSn
    }
  }

}
</script>

<style lang="stylus" scoped>
.account-item
  margin-bottom 20px
.account-item-title
  display flex
  align-items center
  margin-bottom 10px
  span:nth-child(2n)
    flex 1
    padding-left 10px
.account-footer
  p
    margin-bottom 10px
    text-align right
.no-account-payment
  margin-top 20px
  text-align center
</style>

