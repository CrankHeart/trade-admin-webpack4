<template>
  <el-dialog title="退货退款申请单" :visible="true" :before-close="cancel" class="refund-dialog">
    <el-form :rules="rules" :model="formInline" label-width="120px" ref="refund-form">
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
          v-else-if="item.prop=='skuType'&&formInline['serviceType']==1"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
          <el-radio-group v-model="formInline[item.prop]">
            <el-radio
              :label="option.id"
              v-for="option in item.options"
              :key="option.id"
            >{{option.name}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-else-if="item.prop=='serviceType'"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
          <el-radio-group v-model="formInline[item.prop]">
            <el-radio
              :label="option.id"
              v-for="option in item.options"
              :key="option.id"
            >{{option.name}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-else-if="item.prop=='address'"
          :label="item.label"
          :prop="item.prop"
          v-model="formInline[item.prop]"
          :key="item.prop"
        >
          <address-cascader
            v-model="formInline[item.prop]"
            @address-change="addressChange"
            :companyArea="companyArea"
          ></address-cascader>
        </el-form-item>

        <el-form-item
          v-else-if="item.prop=='goodsNum'"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
          <!-- <el-input v-model="formInline['goodsNum']" :placeholder="item.placeholder"></el-input> -->

          <el-input-number v-model="formInline['goodsNum']" :min="1"></el-input-number>
        </el-form-item>

        <el-form-item
          v-else-if="item.prop!=='skuType'"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
        >
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
import API from "../API"
import addressCascader from './addressCascader.vue'
import { serviceTypes, skuTypes } from '../pages/procurement/const/index'
import { debounce } from '../utils/index'

/**
 * 本次迭代任务:
 *新建采购退货单时，如果是选择的已入库物品退货，需要指定库存类型（正品/临期/次品），如果是正品/临期需要进行库存校验，
 保证不超过对应SKU（正品看普通SKU，临期看临期SKU）的可销售+预留库存。
 否则报错：当前退货数量过多，会造成实拣缺货，最多可退数量：XX。下推出库单时，也需要能够指定相应的库存状态进行出库（正品:ZP，临期:LQ，次品:CP）。
 */
@Component( {
  name: "refund-dialog",
  components: {
    addressCascader
  }
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

  serviceTypes: any = serviceTypes
  skuTypes: any = skuTypes
  get itemList () {
    let s = this.deliveryListItem.myRefundType ? '退货' : '退款'
    let itemList = [
      { prop: 'refundAmount', label: '退款金额' },
      { prop: 'applyReason', label: `${s}理由`, placeholder: `请输入${s}理由` },
      { prop: 'contact', label: '联系人', placeholder: '请填写联系人名称' },
      { prop: 'mobile', label: '电话', placeholder: '请填写联系人电话' }
    ]
    if ( !this.deliveryListItem.isAllRefund ) {
      let item = { prop: 'goodsNum', label: `${s}数量`, blur: 'numberChange', placeholder: `请输入${s}商品数量` }
      itemList.unshift( item )
    }
    // 通过deliveryListItem中的 myRefundType 来判断 是 退货还是 退款 默认是0, 0是退款,1是退货
    if ( this.deliveryListItem.myRefundType ) {
      let address = [
        { prop: 'address', label: '地址', placeholder: '请填写收货地址' },
        { prop: 'serviceType', label: '退货类型', options: this.serviceTypes },
        { prop: 'skuType', label: '退货库存类型', options: this.skuTypes }
      ]

      itemList.push( address[ 0 ] )
      itemList.unshift( address[ 2 ] )
      // itemList.unshift( address[ 1 ] )
    }
    console.log( 'itemList', itemList )
    return itemList
  }
  @Prop( { default: false } )
  isProcurement: boolean

  formInline = {
    goodsNum: 0,
    applyReason: '',
    contact: '',
    mobile: '',
    address: '',
    serviceType: void 0,
    refundAmount: 0,
    skuType: 0
  }

  @Watch( 'formInline.goodsNum', { immediate: true } )
  goodsNumWatcher = debounce( function ( v, o ) {
    console.log( v, o )
    if ( v !== o && v ) {
      if ( this.isProcurement ) {
        let { agreePriceString } = this.deliveryListItem
        this.formInline.refundAmount = ( +v * agreePriceString ).toFixed( 2 )
      } else {
        let { skuId, lcCode, lcSkuCode, skuType } = this.deliveryListItem.goodsInfo[ 0 ]
        this.$http( API.getRefundAmount, {
          orderSn: this.orderSn,
          lcCode: lcCode || lcSkuCode,
          skuType,
          skuId, number: v
        } ).then( ( { data } ) => {
          this.formInline.refundAmount = data.refundAmount
        } )
      }

    }
  }, 500, true ).bind( this )
  // 需要传 区别全部和非全部的 参数,  在数量中直接被刨除
  validateGoodsNum ( rule, value, callback ) {
    console.log( value )
    let { goodsNum, serviceType } = this.formInline
    if ( this.deliveryListItem.myRefundType ) {
      let { number, onWayNum, supplyNum, appliedNum } = this.deliveryListItem.goodsInfo[ 0 ]
      if ( serviceType === 1 && +goodsNum > ( +number ) + ( +supplyNum ) - onWayNum - appliedNum ) {
        this.formInline.goodsNum = ( +number ) + ( +supplyNum ) - onWayNum - appliedNum
        console.log( '已入库物品的退货数量不能大于已入库的数量' )
        callback( new Error( '已入库物品的退货数量不能大于已入库的数量' ) )
      } else if ( serviceType === 2 && ( +goodsNum ) > ( +onWayNum ) ) {
        console.log( '未入库物品的退货数量不能大于未入库的数量' )
        this.formInline.goodsNum = ( +onWayNum )
        callback( new Error( '未入库物品的退货数量不能大于未入库的数量' ) )
      }
    }
    if ( this.deliveryListItem.isOneRefund && +this.formInline.goodsNum > +this.deliveryListItem.goodsInfo[ 0 ].number ) {
      this.formInline.goodsNum = +this.deliveryListItem.goodsInfo[ 0 ].number
      callback( new Error( '申请退款商品数量不可超过下单数量' ) )
    } else if ( +this.formInline.goodsNum > +this.deliveryListItem.goodsInfo[ 0 ].num ) {
      callback( new Error( '已超过商品总数量' ) )
    } else if ( !this.formInline.goodsNum ) {
      callback( new Error( '请输入退货数量' ) )
    } else if ( +this.formInline.goodsNum < 0 || +this.formInline.goodsNum == 0 ) {
      callback( new Error( '数量值需要大于0' ) )
    } else if ( !Number.isInteger( +this.formInline.goodsNum ) ) {
      callback( new Error( '请输入正整数' ) )
    } else {
      console.log( 'else...', callback )
      callback()
    }

  }
  get rules () {
    let rules = {
      goodsNum: [
        { required: true, trigger: 'blur', type: 'number' },
        { validator: this.validateGoodsNum, trigger: 'blur,change' }
      ],
      refundAmount: [
        { required: true, message: '请输入退款金额', trigger: 'blur' }
      ],
      contact: [
        { required: true, message: '请输入联系人', trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '请输入联系人联系方式', trigger: 'blur' }
      ],
      applyReason: [
        { required: true, message: '请输入退货/退款理由', trigger: 'blur,change' }
      ],
      address: [
        { required: true, message: '请输入详细退货地址', trigger: 'blur' }
      ],
      skuType: [
        { required: true, message: '请选择退货库存类型' }
      ]
    }
    return rules
  }

  @Prop()
  orderSn: string
  @Prop()
  deliverySn: string

  get ajaxOption () {
    if ( this.deliveryListItem.myRefundType ) {
      let { lcSkuCode, id, procurementSn, storeId } = this.deliveryListItem.goodsInfo[ 0 ]
      let { applyReason, contact, mobile, serviceType, goodsNum } = this.formInline
      let amount = this.formInline.refundAmount
      let address = this.formInline.address + this.formInline.address
      let ajaxOption = { procurementSn, applyReason, contact, mobile, address, serviceType, planSkuId: id, lcSkuCode, storeId, number: goodsNum, amount }
      if ( serviceType == 1 ) {
        ajaxOption.skuType = this.formInline.skuType
      }
      return ajaxOption
    } else {
      let { goodsNum, contact, mobile, applyReason } = this.formInline
      let goodsInfo = []
      this.deliveryListItem.goodsInfo && this.deliveryListItem.goodsInfo.forEach( v => {
        goodsInfo.push( {
          goodsNum: this.deliveryListItem.isAllRefund ? v.number : goodsNum,
          goodsName: v.name || v.skuName,
          goodsSpecification: v.specification,
          goodsSkuId: v.skuId,
          goodsLcCode: v.lcCode || v.lcSkuCode,
          priceString: v.priceString,
          orderItemId: v.id,
          skuType: v.skuType || 0
        } )
      } )
      return ( {
        refundAmount: this.formInline.refundAmount,
        orderSn: this.orderSn || this.$route.params.sn,
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
  }

  confirm () {
    this.buttonDisabled = true
    let myForm: any = this.$refs[ 'refund-form' ]
    let isPassed = true
    myForm.fields.forEach( ( field, index ) => {
      field.validate( '', errors => {
        if ( errors ) {
          isPassed = false
          this.buttonDisabled = false
        }
      } );
    } )
    if ( isPassed ) {
      let bo = this.deliveryListItem.myRefundType
      let { serviceType, goodsNum } = this.formInline
      let APIpath = bo ? API.applyServiceOrder : API.applyAfterSales
      this.$http( APIpath, this.ajaxOption ).then( ( { data } ) => {
        this.buttonDisabled = false
        this.$message( {
          message: '申请成功',
          type: 'success'
        } )
        let emitData = Object.assign( {}, { applyAfterSales: 1, serviceSn: data.data }, bo ? { serviceType, goodsNum } : {} )
        this.$emit( 'change-refund-state', emitData )
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
    if ( this.deliveryListItem.myRefundType ) {
      let { suppDetailAddr, suppProvinceId, suppCityId, suppCountryId, suppAddress } = this.refundDetailData as any
      this.formInline.address = suppDetailAddr
      this.companyArea = [ suppProvinceId, suppCityId, suppCountryId ]
      this.formInline.address = suppAddress.replace( suppDetailAddr, '' )
      // let onWayNum = this.deliveryListItem.goodsInfo[ 0 ].onWayNum
      // console.log( 'onWayNum', onWayNum )
      // if ( onWayNum > 0 ) {
      //   this.formInline.serviceType = 2
      // } else {
      //   this.formInline.serviceType = 1
      // }
      // 上方注释掉，逻辑变更，只可能存在已入库退货，写死为1
      this.formInline.serviceType = 1
    }

    if ( this.deliveryListItem.isAllRefund ) {
      this.formInline.refundAmount = this.deliveryListItem.agreePriceString
    } else {
      let item = this.deliveryListItem.goodsInfo[ 0 ]
      this.formInline.goodsNum = item.skuNum || item.number
    }

  }

  companyArea: any = []

  addressChange ( v ) {
    this.formInline.address = v.companyAddress
    if ( this.deliveryListItem.myRefundType ) {
      this.companyArea = v.companyArea
    }
  }
}
</script>
<style lang="stylus">
.refund-dialog
  .el-dialog
    min-width 700px
</style>

