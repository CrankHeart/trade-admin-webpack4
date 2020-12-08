<template>
  <el-dialog
    :title="formData.id?'编辑发票':'新增发票'"
    :visible.sync="visible"
    :before-close="cancel"
    class="account-invoice-edit-dialog"
    :modal-append-to-body="true"
    @open="openDialog"
  >
    <el-form ref="form" :model="formData" label-width="120px" :rules="formRules">
      <el-form-item
        :class="item.prop"
        v-for="item in itemList"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
      >
        <el-radio-group v-if="item.type === 'radio'" v-model="formData[item.prop]">
          <el-radio
            v-for="( option, index ) in item.options"
            :key="index"
            :label="option.id"
          >{{option.name}}</el-radio>
        </el-radio-group>
        <el-input v-else-if="item.type === 'text'" type="text" v-model.trim="formData[item.prop]"></el-input>
        <address-cascader
          v-else-if="item.type === 'address'"
          v-model="formData.companyDetailAddress"
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
          :required="express.required ? express.required: false"
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
import { Component, Prop, Watch } from 'vue-property-decorator'
import { invoiceKind, invoiceType, defaultInvoiceType, defaultInvoiceKind } from '../order/const/invoiceConst'
import addressCascader from '@/components/addressCascader.vue'
import { Action } from 'vuex-class'
@Component( {
  name: 'invoice-edit-dialog',
  components: {
    addressCascader
  }
} )
export default class InvoiceEditDialog extends Vue {
  @Prop( { default: () => { } } ) invoiceItemMsg: any
  @Prop( { default: false } ) edit: boolean
  @Prop( { default: false } ) dialogToBody: boolean
  @Prop( { default: false } ) visible: boolean
  @Action( 'invoice/getInvoiceList' ) getInvoiceList
  @Action( 'invoice/updateInvoice' ) updateInvoice
  @Action( 'address/getAreaList' ) getAreaList

  @Watch( 'formData.invoiceType' ) invoiceTypeChanged ( val ) {
    this.formRules = this.getRuleByType( this.formData )
  }

  @Watch( 'formData.invoiceKind' ) invoiceKindChanged ( val ) {
    this.formRules = this.getRuleByType( this.formData )
  }

  mounted () {
    // 解决element-ui dialog 多层嵌套,内部dialog不完整问题,塞到body上面,顶层弹窗
    if ( this.dialogToBody ) {
      document.body.appendChild( this.$el )
    }
  }

  openDialog () {
    let keys = Object.keys( this.invoiceItemMsg )
    if ( keys.length > 0 ) {
      keys.forEach( v => {
        this.formData[ v ] = this.invoiceItemMsg[ v ]
      } )

      let {
        companyProvinceId, companyCityId, companyCountryId,
        consigneeProvinceId, consigneeCityId, consigneeCountryId
      } = this.invoiceItemMsg

      this.formRules = this.getRuleByType( this.formData )
      this.companyArea = [ +companyProvinceId, +companyCityId, +companyCountryId ]
      this.expressArea = [ consigneeProvinceId, consigneeCityId, consigneeCountryId ]
    }
  }

  companyAddressArea: string = ''
  companyArea: any = []
  expressAddress: string = ''
  expressArea: any = []
  formRules: any = {}
  formData: any = {
    id: null,
    invoiceKind: defaultInvoiceKind,
    invoiceType: defaultInvoiceType,
    invoiceTitle: '',
    taxpayerId: '',
    companyAddress: '',
    companyDetailAddress: '',
    companyProvinceId: '', companyCityId: '', companyCountryId: '',
    consigneeProvinceId: '', consigneeCityId: '', consigneeCountryId: '',
    invoiceMobile: '',
    bankDeposit: '',
    bankAccount: '',
    consignee: '',
    consigneeTel: '',
    consigneeAddress: '',
    consigneeDetailAddress: ''
  }

  expressMsgs: any[] = [
    { prop: "consignee", label: "联系人", type: "text", placeholder: "发票快递联系人", required: true },
    { prop: "consigneeTel", label: "联系人电话", type: "text", placeholder: "发票快递联系方式", required: true },
    { prop: "consigneeDetailAddress", label: "详细地址", type: "expressAddress", placeholder: "发票快递联系地址", required: true }
  ]

  itemList: any[] = [
    { prop: "invoiceKind", label: "开票方式", type: "radio", options: invoiceKind },
    { prop: "invoiceType", label: "发票类型", type: "radio", options: invoiceType },
    { prop: "taxpayerId", label: "企业税号", type: "text", required: true },
    { prop: "invoiceTitle", label: "发票抬头", type: "text", required: true },
    { prop: "invoiceMobile", label: "联系方式", type: "text", required: true },
    { prop: "address", label: "地址", type: "address" },
    { prop: "bankDeposit", label: "开户银行", type: "text" },
    { prop: "bankAccount", label: "银行卡号", type: "text" }
  ]

  commonRules: any = {
    invoiceKind: [ { required: true, message: "请选择开票方式", type: "number", trigger: "change" } ],
    invoiceType: [ { required: true, message: "请选择发票类型", type: "number", trigger: "change" } ],
    taxpayerId: [ { required: true, message: "请填写企业税号", trigger: "blur" } ],
    invoiceTitle: [ { required: true, message: "请填写发票抬头", trigger: "blur" } ]
  }

  // 根据发票类型,动态改变验证规则
  getRuleByType ( invoice ) {
    return {
      ...this.commonRules,
      invoiceMobile: [
        {
          required: this.checkMobile( invoice ),
          validator: this.validateHandler( "invoiceMobile" ),
          trigger: "blur"
        }
      ],
      bankDeposit: [
        {
          required: invoice.invoiceType == 1,
          validator: this.validateHandler( "bankDeposit" ),
          trigger: "blur"
        }
      ],
      bankAccount: [
        {
          required: invoice.invoiceType == 1,
          validator: this.validateHandler( "bankAccount" ),
          trigger: "blur"
        }
      ],
      address: [
        {
          required: invoice.invoiceType == 1,
          validator: this.validateAddress,
          trigger: "blur"
        }
      ],
      consignee: [
        {
          required: invoice.invoiceType == 1,
          validator: this.validateConsigneeHandler( "consignee" ),
          trigger: "blur"
        }
      ],
      consigneeTel: [
        {
          required: invoice.invoiceType == 1,
          validator: this.validateConsigneeHandler( "consigneeTel" ),
          trigger: "blur"
        }
      ]
    }
  }

  checkMobile ( invoice ) {
    // 如果是电子发票,联系方式必须填写,而且必须是手机号码
    // 0电子发票需要验证,1:纸质发票不需要
    if ( invoice.invoiceKind == 0 ) {
      return true
    } else if ( invoice.invoiceKind == 1 && invoice.invoiceType == 1 ) { // 如果是纸质发票,并且是增值税发票才需要验证
      return true
    } else {
      return false
    }
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
    return this.invoiceItemMsg.userInvoiceDataId || ""
  }

  get isPaperInvoice () {
    return this.formData && this.formData.invoiceKind === 1
  }

  addressChange ( v ) {
    this.formData.companyAddress = v.companyAddress
    this.companyAddressArea = v.companyAddress
    this.companyArea = v.companyArea
  }

  expressChange ( v ) {
    this.expressAddress = v.companyAddress
    this.expressArea = v.companyArea
  }

  validateHandler ( type ) {
    const validateMsg = {
      invoiceMobile: "请填写电话",
      bankDeposit: "请填写开户银行",
      bankAccount: "请填写银行卡号"
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
      callback( new Error( "请选择区域地址" ) )
    } else if ( !this.formData.companyAddress ) {
      callback( new Error( "请输入详细地址" ) )
    } else {
      callback()
    }
  }

  validateConsigneeHandler ( type ) {
    const validateMsg = {
      consignee: "请填写联系人",
      consigneeTel: "请填写联系电话"
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

  formatEditParam () {
    let param: any = {
      ...this.formData,
      id: this.invoiceItemMsg.id,
      tenantId: this.invoiceItemMsg.tenantId || '',
      officeId: this.invoiceItemMsg.officeId || '',
      companyDetailAddress: this.formData.companyDetailAddress,
      companyProvinceId: this.companyArea[ 0 ],
      companyCityId: this.companyArea[ 1 ],
      companyCountryId: this.companyArea[ 2 ],
      companyAddress: this.companyAddressArea + this.formData.companyDetailAddress
    }
    if ( !this.isPaperInvoice ) {
      delete param.consigneeAddress
      delete param.consignee
      delete param.consigneeTel
    } else {
      param.consigneeProvinceId = this.expressArea[ 0 ]
      param.consigneeCityId = this.expressArea[ 1 ]
      param.consigneeCountryId = this.expressArea[ 2 ]
      param.consigneeAddress = this.expressAddress + this.formData.consigneeDetailAddress
    }
    return param
  }


  submitForm () {
    let param = this.formatEditParam();
    this.updateInvoice( param ).then( ( { data } ) => {
      // 新增或更新之后,直接重新获取列表
      this.getInvoiceList( { tenantId: this.invoiceItemMsg.tenantId, officeId: this.invoiceItemMsg.officeId } )
      this.$emit( 'update-invoice-msg-list' )
      this.$emit( 'update:visible', false )
    } ).catch( err => {
      this.$message( {
        message: err.data.msg,
        type: 'warning'
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
