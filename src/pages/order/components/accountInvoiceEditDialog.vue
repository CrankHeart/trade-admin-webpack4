<template>
  <el-dialog
    title="编辑发票"
    :visible.sync="visible"
    :before-close="cancel"
    class="account-invoice-edit-dialog"
    @open="openDialog"
  >
    <el-form
      ref="form"
      :model="formData"
      label-width="150px"
      :rules="this.formData.invoiceType === 1 ? rulesInvoiceType1: rulesInvoiceType0"
    >
      <el-form-item
        :class="item.prop"
        v-for="item in itemList"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
        :required="item.required ? item.required: false"
      >
        <el-radio-group v-if="item.type === 'radio'" v-model="formData[item.prop]">
          <el-radio
            v-for="( option, index ) in item.prop !== 'invoiceType' ? item.options : optionsCompute"
            :key="index"
            :label="option.id"
          >{{option.name}}</el-radio>
        </el-radio-group>
        <el-input v-else-if="item.type === 'text'" type="text" v-model.trim="formData[item.prop]"></el-input>
        <address-cascader
          v-else-if="item.type === 'address'"
          v-model="detailAddress"
          @address-change="addressChange"
          :companyArea="companyArea"
        ></address-cascader>
        <template v-else></template>
      </el-form-item>
      <div v-if="isPaperInvoice" class="express-margin">
        <el-form-item
          v-for="express in expressMsgs"
          :key="express.prop"
          :label="express.label"
          :prop="express.prop"
        >
          <address-cascader
            v-if="express.type === 'expressAddress'"
            v-model="formData[express.prop]"
            @address-change="expressChange"
            :companyArea="expressArea"
          ></address-cascader>
          <el-input
            v-else-if="express.type === 'text'"
            v-model.trim="formData[express.prop]"
            :placeholder="express.placeholder"
          ></el-input>
          <template v-else></template>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" @click="editInvoice">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop, Watch } from 'vue-property-decorator'
import { Loading } from 'element-ui'
import API from '../../../API'
import { invoiceKind, invoiceType } from '../../order/const/invoiceConst'
import addressCascader from '../../../components/addressCascader.vue'

@Component( {
  name: 'account-invoice-edit-dialog',
  components: {
    addressCascader
  }
} )
export default class AccountInvoiceEditDialog extends Vue {
  @Prop( { default: () => { } } ) invoiceItemMsg: any
  @Prop( { default: false } ) edit: boolean
  @Prop( { default: false } ) visible: boolean

  created () {
    let { companyProvinceId, companyCityId, companyCountryId } = this.invoiceItemMsg
    this.companyArea = [ +companyProvinceId, +companyCityId, +companyCountryId ]
  }

  openDialog () {
    let keys = Object.keys( this.invoiceItemMsg )
    if ( keys.length > 0 ) {
      Object.keys( this.formData ).forEach( v => {
        this.formData[ v ] = this.invoiceItemMsg[ v ]
      } )
      let {
        companyProvinceId,
        companyCityId,
        companyCountryId
      } = this.invoiceItemMsg
      this.companyArea = [ +companyProvinceId, +companyCityId, +companyCountryId ]
    }
  }

  companyAddressArea: string = ''
  companyArea: any = []
  expressAddress: string = ''
  expressArea: any = []

  formData: any = {
    invoiceKind: null,
    invoiceType: null,
    invoiceTitle: null,
    taxpayerId: null,
    companyAddress: null,
    companyDetailAddress: null,
    invoiceMobile: null,
    bankDeposit: null,
    bankAccount: null,
    consignee: null,
    consigneeTel: null,
    consigneeAddress: null
  }

  itemList: any[] = [
    {
      prop: 'invoiceKind',
      label: '开票方式',
      type: 'radio',
      options: invoiceKind
    },
    {
      prop: 'invoiceType',
      label: '发票类型',
      type: 'radio',
      options: invoiceType
    },
    { prop: 'taxpayerId', label: '企业税号', type: 'text', required: true },
    { prop: 'invoiceTitle', label: '发票抬头', type: 'text', required: true },
    {
      prop: 'address',
      label: '地址',
      type: 'address'
    },
    {
      prop: 'invoiceMobile',
      label: '手机号码',
      type: 'text'
    },
    {
      prop: 'bankDeposit',
      label: '开户银行',
      type: 'text'
    },
    {
      prop: 'bankAccount',
      label: '银行卡号',
      type: 'text'
    }
  ]

  expressMsgs: any[] = [
    { prop: 'consignee', label: '快递信息', type: 'text', placeholder: '联系人' },
    { prop: 'consigneeTel', label: '', type: 'text', placeholder: '联系方式' },
    { prop: 'consigneeAddress', label: '', type: 'expressAddress', placeholder: '联系地址' },
  ]

  commonRules: any = {
    invoiceKind: [
      {
        required: true,
        message: '请选择开票方式',
        type: 'number',
        trigger: 'change'
      }
    ],
    invoiceType: [
      {
        required: true,
        message: '请选择发票类型',
        type: 'number',
        trigger: 'change'
      }
    ],
    taxpayerId: [
      { required: true, message: '请填写企业税号', trigger: 'blur' }
    ],
    invoiceTitle: [
      { required: true, message: '请填写发票抬头', trigger: 'blur' }
    ]
  }
  rulesInvoiceType0: any = {
    ...this.commonRules,
    invoiceMobile: [
      {
        validator: this.validateHandler( 'invoiceMobile' ),
        trigger: 'blur'
      }
    ],
    bankDeposit: [
      {
        validator: this.validateHandler( 'bankDeposit' ),
        trigger: 'blur'
      }
    ],
    bankAccount: [
      {
        validator: this.validateHandler( 'bankAccount' ),
        trigger: 'blur'
      }
    ],
    address: [
      {
        validator: this.validateAddress,
        trigger: 'blur'
      }
    ],
    consignee: [
      {
        validator: this.validateConsigneeHandler( 'consignee' ),
        trigger: 'blur'
      }
    ],
    consigneeTel: [
      {
        validator: this.validateConsigneeHandler( 'consigneeTel' ),
        trigger: 'blur'
      }
    ]
  }
  rulesInvoiceType1: any = {
    ...this.commonRules,
    invoiceMobile: [
      {
        required: true,
        validator: this.validateHandler( 'invoiceMobile' ),
        trigger: 'blur'
      }
    ],
    bankDeposit: [
      {
        required: true,
        validator: this.validateHandler( 'bankDeposit' ),
        trigger: 'blur'
      }
    ],
    bankAccount: [
      {
        required: true,
        validator: this.validateHandler( 'bankAccount' ),
        trigger: 'blur'
      }
    ],
    address: [
      {
        required: true,
        validator: this.validateAddress,
        trigger: 'blur'
      }
    ],
    consignee: [
      {
        required: true,
        validator: this.validateConsigneeHandler( 'consignee' ),
        trigger: 'blur'
      }
    ],
    consigneeTel: [
      {
        required: true,
        validator: this.validateConsigneeHandler( 'consigneeTel' ),
        trigger: 'blur'
      }
    ]
  }

  get detailAddress () {
    return this.formData.companyAddress && this.formData.companyAddress.replace( /.+?(省|市|自治区|自治州|县|区)/g, '' )
  }
  set detailAddress ( v ) {
    this.formData.companyDetailAddress = v
  }
  get optionsCompute () {
    if ( !this.isPaperInvoice ) {
      return invoiceType.filter( field => field.id === 0 )
    }
    return invoiceType
  }
  get isCommonInvoice () {
    return this.formData.invoiceType === 0
  }

  get invoiceId () {
    return this.invoiceItemMsg.userInvoiceDataId || ''
  }

  get isPaperInvoice () {
    return this.formData && this.formData.invoiceKind === 1
  }

  addressChange ( v ) {
    this.companyAddressArea = v.companyAddress
    this.companyArea = v.companyArea
  }

  expressChange ( v ) {
    this.expressAddress = v.companyAddress
    this.expressArea = v.companyArea
    let consigneeAddress = this.formData.consigneeAddress
    if ( consigneeAddress.indexOf( v.companyAddress ) === 0 ) {
      this.formData.consigneeAddress = consigneeAddress.slice( this.expressAddress.length )
    }
  }

  validateHandler ( type ) {
    const validateMsg = {
      invoiceMobile: '请填写电话',
      bankDeposit: '请填写开户银行',
      bankAccount: '请填写银行卡号'
    }
    const self = this
    return function ( rule, value, callback ) {
      if ( self.isCommonInvoice ) {
        callback()
      } else {
        if ( !value ) {
          callback( new Error( validateMsg[ type ] ) )
        } else {
          callback()
        }
      }
    }
  }

  validateAddress ( rule, value, callback ) {
    if ( this.isCommonInvoice || this.formData.invoiceType == undefined ) {
      callback()
      return
    }
    if ( !this.formData.companyDetailAddress ) {
      callback( new Error( '请选择区域地址' ) )
    } else if ( !this.formData.companyAddress ) {
      callback( new Error( '请输入详细地址' ) )
    } else {
      callback()
    }
  }

  validateConsigneeHandler ( type ) {
    const validateMsg = {
      consignee: '请填写联系人',
      consigneeTel: '请填写联系电话'
    }
    const self = this
    return function ( rule, value, callback ) {
      if ( !self.isPaperInvoice ) {
        callback()
      } else {
        if ( !value ) {
          callback( new Error( validateMsg[ type ] ) )
        } else {
          callback()
        }
      }
    }
  }

  submitForm () {
    let param: any = {
      ...this.formData,
      id: this.invoiceItemMsg.id,
      tenantId: this.invoiceItemMsg.tenantId,
      officeId: this.invoiceItemMsg.officeId,
      companyDetailAddress: this.formData.companyDetailAddress,
      companyAddress: this.companyAddressArea + this.formData.companyDetailAddress
    }
    this.$http( API.updateUserInvoiceData, param ).then( ( { data } ) => {
      this.$emit( 'update-invoice-msg-list' )
      this.$emit( 'update:visible', false )
    } ).catch( ( { error } ) => {
      this.$notify( {
        type: 'error',
        message: error.msg || '开票信息编辑失败'
      } )
    } )
  }
  editInvoice () {
    let isValid = false
    let form: any = this.$refs[ 'form' ]
    form.validate( ( valid ) => {
      isValid = valid
      return isValid
    } )
    if ( !isValid ) {
      return
    }
    this.submitForm()
  }
  cancel () {
    this.$emit( 'update:visible', false )
  }
}
</script>

<style lang='stylus' scoped>
.create-account-invoice
  .title
    display flex
    align-items center
    margin-bottom 20px
    span
      flex 1
      text-align right
  .apply-btn
    display inline-block
    margin-left 50%
    transform translateX(-50%)
  .express-margin
    border-top 1px solid #ccc
    padding-top 20px
  .consignee-item
    margin-bottom 22px
</style>
