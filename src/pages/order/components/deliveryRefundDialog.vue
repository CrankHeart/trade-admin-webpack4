<template>
  <el-dialog title="退货退款申请单" :visible="true" :before-close="cancel" class="refund-dialog">
    <!-- {{deliveryListItem}} -->
    <el-form ref="refund-form" :model="formInline" :rules="rules" label-width="80px">
      <template v-for="item in itemList">
        <el-form-item
          v-if="item.prop=='refundAmount'"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
          <el-input v-model="formInline.refundAmount"></el-input>
        </el-form-item>
        <el-form-item
          v-else-if="item.prop=='goodsNum'"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
          <el-input-number v-model="formInline['goodsNum']" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item v-else :label="item.label" :prop="item.prop" :key="item.prop">
          <el-input v-model="formInline[item.prop]" :placeholder="item.placeholder"></el-input>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button @click="cancel" size="large">取 消</el-button>
        <el-button type="primary" :disabled="buttonDisabled" size="large" @click="confirm">确 定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject, Prop, Watch } from "vue-property-decorator"
import API from "../../../API"
import { debounce } from '../../../utils/index'

@Component( {
  name: "delivery-refund-dialog"
} )
export default class DetailDeliverRefund extends Vue {

  @Prop()
  memberId: string
  @Prop( { default: () => { } } )
  refundDetailData: object
  @Prop()
  storeId: number
  @Prop()
  deliveryListItem

  buttonDisabled: boolean = false

  get itemList () {
    let itemList = [
      { prop: 'refundAmount', label: '退款金额' },
      { prop: 'contact', label: '联系人', placeholder: '请填写联系人名称' },
      { prop: 'mobile', label: '联系电话', placeholder: '请填写联系人电话' },
      { prop: 'applyReason', label: `退款原因`, placeholder: `请输入退款理由` },
    ]
    if ( !this.deliveryListItem.isAllRefund ) {
      let item = { prop: 'goodsNum', label: `退款数量`, blur: 'numberChange', placeholder: `请输入退款商品数量` }
      itemList.unshift( item )
    }
    return itemList
  }

  formInline = {
    goodsNum: 0,
    applyReason: '',
    contact: '',
    mobile: '',
    refundAmount: 0
  }

  @Watch( 'formInline.goodsNum', { immediate: true } )
  goodsNumWatcher = debounce( function ( v, o ) {
    if ( v !== o && v ) {
      let { skuId, lcSkuCode, skuType } = this.deliveryListItem.goodsInfo[ 0 ]
      this.$http( API.getRefundAmount, {
        orderSn: this.orderSn,
        lcCode: lcSkuCode,
        skuType,
        skuId, number: v
      } ).then( ( { data } ) => {
        this.formInline.refundAmount = data.refundAmount
      } )
    }
  }, 500, true ).bind( this )
  // 需要传 区别全部和非全部的 参数,  在数量中直接被刨除
  validateGoodsNum ( rule, value, callback ) {
    let { goodsNum } = this.formInline
    let item = this.deliveryListItem.goodsInfo[ 0 ]
    let canRefundableNum = +item.totalNum - +item.refundNum - +item.outboundNum - +item.distributingNum
    if ( +goodsNum > canRefundableNum ) {
      this.formInline.goodsNum = canRefundableNum
      callback( new Error( '已超过可退款总数量' ) )
    } else if ( !this.formInline.goodsNum ) {
      callback( new Error( '请输入退货数量' ) )
    } else if ( +this.formInline.goodsNum < 0 || +this.formInline.goodsNum == 0 ) {
      callback( new Error( '数量值需要大于0' ) )
    } else if ( !Number.isInteger( +this.formInline.goodsNum ) ) {
      callback( new Error( '请输入正整数' ) )
    } else {
      callback()
    }

  }
  rules = {
    goodsNum: [
      { required: true, trigger: 'blur', type: 'number' },
      { validator: this.validateGoodsNum, trigger: 'blur,change' }
    ],
    contact: [
      { required: true, message: '请输入联系人', trigger: 'blur' }
    ],
    mobile: [
      { required: true, message: '请输入联系人联系方式', trigger: 'blur' }
    ],
    applyReason: [
      { required: true, message: '请输入退货/退款理由', trigger: 'blur' }
    ]
  }

  @Prop()
  orderSn: string
  @Prop()
  deliverySn: string

  get ajaxOption () {
    let { goodsNum, contact, mobile, applyReason } = this.formInline
    let goodsInfo = []
    this.deliveryListItem.goodsInfo && this.deliveryListItem.goodsInfo.forEach( v => {
      let canRefundableNum
      if ( this.deliveryListItem.isAllRefund ) {
        canRefundableNum = +v.totalNum - +v.refundNum - +v.outboundNum - +v.distributingNum
        if ( canRefundableNum === 0 ) {
          return
        }
      }
      goodsInfo.push( {
        goodsNum: this.deliveryListItem.isAllRefund ? ( canRefundableNum ) : goodsNum,
        goodsName: v.skuName,
        goodsSpecification: v.specification,
        goodsSkuId: v.skuId,
        goodsLcCode: v.lcSkuCode,
        priceString: v.priceString,
        orderItemId: v.id,
        skuType: v.skuType || 0
      } )
      canRefundableNum = null
    } )
    return ( {
      refundAmount: this.formInline.refundAmount,
      orderSn: this.orderSn,
      applyUserId: this.memberId,
      serviceType: 3,
      deliverySn: this.deliverySn,
      storeId: this.storeId,
      contact,
      mobile,
      applyReason,
      goodsInfo
    } )
  }

  confirm () {
    this.buttonDisabled = true
    let myForm: any = this.$refs[ 'refund-form' ]
    let isPassed = true
    myForm.fields.forEach( ( field, index ) => {
      field.validate( '', errors => {
        if ( errors ) {
          isPassed = false
        }
      } );
    } )
    if ( isPassed ) {
      let { goodsNum } = this.formInline
      this.$http( API.applyAfterSales, this.ajaxOption ).then( ( { data } ) => {
        this.buttonDisabled = false
        this.$message( {
          message: '申请成功',
          type: 'success'
        } )
        this.$emit( 'change-refund-state', true )
      }, ( { data } ) => {
        this.buttonDisabled = false
        this.$message( {
          message: data.msg,
          type: 'warning'
        } )
        this.$emit( 'change-refund-state' )
      } )
    }
  }
  cancel () {
    this.$emit( 'change-refund-state' )
  }
  created () {
    let { suppContactName, suppContactTel } = ( this.refundDetailData as any )
    this.formInline.contact = suppContactName
    this.formInline.mobile = suppContactTel
    if ( this.deliveryListItem.isAllRefund ) {
      this.$http( API.getRefundAllAmount, { orderSn: this.orderSn } ).then( ( { data } ) => {
        this.formInline.refundAmount = data.refundAllAmount
      } )
    } else {
      let item = this.deliveryListItem.goodsInfo[ 0 ]
      // * 实际可退款数量 = 订单数-已发运-已退款-锁定待出库
      this.formInline.goodsNum = +item.totalNum - +item.refundNum - +item.outboundNum - +item.distributingNum
    }
  }
}
</script>
<style lang="stylus">
.refund-dialog
  .el-dialog
    min-width 700px
</style>

