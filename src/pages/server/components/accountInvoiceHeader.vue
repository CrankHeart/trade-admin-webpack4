<template>
  <div class="account-invoice-header">
    <template v-if="hadInvoice && dataLoaded">
      <div class="title">
        <h3>开票信息</h3>
        <span>
          <span>开票申请时间：{{formatInvoiceTime( invoiceMsg.createDate )}}</span>
        </span>
      </div>
      <el-card class="card-margin">
        <el-row>
          <el-col
            :span="msg.prop === 'consignee' ? 24 : 12 "
            v-for="msg in invoiceMsgItems "
            :key="msg.prop"
          >
            <div v-if="msg.prop === 'consignee'" :class="{'row-line':!!invoiceMsg['consignee']}">
              <span v-if="!!invoiceMsg['consignee']">{{ msg.label }}：</span>
              <span
                v-if="!!invoiceMsg['consignee']"
              >{{ `${invoiceMsg['consignee']} ${invoiceMsg['consigneeTel']} ${invoiceMsg['consigneeAddress']} `}}</span>
            </div>
            <div v-else>
              <span>{{ msg.label }}：</span>
              <span v-if="msg.prop === 'invoiceKind'">{{formatInvoiceKind(invoiceMsg[ msg.prop ])}}</span>
              <span
                v-else-if="msg.prop === 'invoiceType'"
              >{{formatInvoiceType(invoiceMsg[ msg.prop ])}}</span>
              <span v-else>{{ invoiceMsg[ msg.prop ] }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </template>
    <template v-else-if="!hadInvoice && dataLoaded">
      <invoice-list
        :tenantInfo="tenantInfo"
        @invoice-changed="invoiceChanged"
        :canSelectParams="canSelectParams"
        :checkable="true"
        :is-opened="false"
        :last-invoice="{}"
        :editable="true"
      ></invoice-list>
      <el-button type="primary" v-if="$permissionValidate( 1086 )" @click="applyInvoice">申请开票</el-button>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import API from '../../../API'
import { invoiceKind, invoiceType } from '../../order/const/invoiceConst'
import permission from '../permissions/accountInvoiceHeaderPermissions'
import invoiceList from '@/pages/invoice/invoiceList.vue'
import { Loading } from 'element-ui'
@Component( {
  name: 'account-invoice-header',
  components: {
    invoiceList
  },
  mixins: [ permission ],
  filters: {
    dealAddress ( value ) {
      return value.match( /.+?(省|市|自治区|自治州|县|区)/g ).join( '' )
    }
  }
} )
export default class AccountInvoiceHeader extends Vue {
  @Prop( { default: () => { } } ) invoiceMsg: any
  @Prop( { default: () => { } } ) tenantInfo: any
  @Prop( { default: '' } ) type: string
  @Prop( { default: undefined } ) orderType: number
  @Prop( { default: undefined } ) orderStatus: number
  @Prop( { default: '' } ) accountCheckSn: string
  @Prop( { default: false } ) hadInvoice: boolean // 是否已经申请过发票,设置为true,
  @Prop( { default: false } ) isOpened: boolean   // 是否已经开过发票
  // @Model( 'input', {type: Boolean} ) isEditInvoice:boolean = false
  @Prop( {
    required: false, default: () => {
      return { dimension: null }
    }
  } ) canSelectParams: any
  @Inject() formatMyDate

  // 是否是随货发票
  isWithGoods = 0

  applyBtnDisable: boolean = false
  isEdit: boolean = false

  // 数据是否更新完毕
  dataLoaded: boolean = false

  @Watch( 'hadInvoice', { immediate: false } )
  watchHadInvoice ( val ) {
    this.dataLoaded = true
  }

  created () {
    // accountCheckSn 根据对账单号,检测是否是随货发票,如果是随货发票,不展示发票,并不可以编辑,如果不是随货发票,还是之前逻辑
    // data: withGoods 1：随货发票 2:普通发票
    // this.$http( API.checkWithGoodsForAccountOrder, {
    //   accountCheckSn: this.accountCheckSn
    // } ).then( ( { data } ) => {
    //     this.isWithGoods =   data.data && data.data.withGoods || 2
    // } ).catch( err => {
    //   // console.log(err)
    // } )
  }

  selectInvoice: any = {} // 当期选中的发票信息

  form: any = {
    invoiceItem: null
  }
  rules: any = {
    invoiceItem: [
      { required: true, validator: this.validatePass, trigger: 'change' }
    ]
  }

  invoiceMsgItems: any[] = [
    { prop: 'invoiceKind', label: '开票方式' },
    { prop: 'companyAddress', label: '地址' },
    { prop: 'invoiceType', label: '发票类型' },
    { prop: 'invoiceMobile', label: '电话' },
    { prop: 'invoiceTitle', label: '发票抬头' },
    { prop: 'bankDeposit', label: '开户行' },
    { prop: 'taxpayerId', label: '纳税人识别号' },
    { prop: 'bankAccount', label: '银行账号' },
    { prop: 'consignee', label: '发票快递地址' }
  ]
  remakeEInvoiceBtnDisabled: boolean = false
  reverseEInvoiceBtnDisabled: boolean = false
  remakePInvoiceBtnDisabled: boolean = false

  get showReCreateInvoiceBtn () {
    // return !( this.type === 'order' && this.orderType === 1 )
    return this.type === 'account' || ( this.type === 'order' && this.orderType === 0 && this.orderStatus >= 2 && this.orderStatus != 6 )
  }
  get isPaperInvoice () {
    return this.invoiceMsg && this.invoiceMsg.invoiceKind === 1
  }



  invoiceChanged ( invoice ) {
    this.selectInvoice = invoice
  }

  updateInvoiceApplyInfo () {
    if ( !this.selectInvoice.id ) {
      this.$notify( {
        type: 'error',
        message: '请先选择一个发票信息'
      } )
      return false
    }
    // this.$permissionValidateWithNotify( this.permissionEditInvoiceBtn )
    let param = this.formatParam()
    this.applyBtnDisable = true
    this.$http( API.updateInvoiceApplyInfo, param ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: data.msg
      } )
      // 更新之后,需要重新获取信息
      this.$emit( 'fresh-invoice-info', param )
      this.isEdit = false
      this.applyBtnDisable = false
    } ).catch( ( { data = {} } ) => {
      this.applyBtnDisable = false
      this.$notify( {
        type: 'error',
        message: (data as any).msg || '开票信息编辑失败'
      } )
    } )
  }

  applyInvoice () {
    // 检测是否选中一个发票信息
    if ( !this.selectInvoice.id ) {
      this.$notify( {
        type: 'error',
        message: '请先选择一个发票信息'
      } )
      return false
    }

    this.$permissionValidateWithNotify( 1086 )
    this.applyBtnDisable = true
    this.$http( API.makeAccountEInvoice, this.formatParam() ).then( ( res ) => {
      this.$notify( {
        type: 'success',
        message: '申请成功'
      } )
      this.applyBtnDisable = false
      let loadingInstance = Loading.service( {
        target: this.$refs[ 'createAccountInvoice' ],
        text: '申请开票中,开票有延迟,请至少十秒后再刷新页面'
      } )
      setTimeout( () => {
        this.$emit( 'fresh-invoice-info', this.formatParam() )
        loadingInstance.close()
      }, 5000 )

    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '申请失败，请重试'
      } )
      this.applyBtnDisable = false
    } )
  }

  // 对账单修改提交参数
  formatParam () {
    let { tenantId, officeId } = this.tenantInfo
    return {
      tenantId,
      officeId,
      'accountCheckSn': this.accountCheckSn,
      'applySn': this.accountCheckSn,
      'id': this.invoiceMsg.id,
      'userInvoiceDataId': this.selectInvoice.id
    }
  }

  // 对账单提交参数
  formatMakeParam () {
    let { tenantId, officeId } = this.tenantInfo
    return {
      tenantId,
      officeId,
      'accountCheckSn': this.accountCheckSn,
      'applySn': this.accountCheckSn,
      'id': this.invoiceMsg.id,
      'userInvoiceDataId': this.selectInvoice.id
    }
  }

  validatePass ( rule, value, callback ) {
    if ( value === '' ) {
      callback( new Error( '请选择开票信息' ) );
    }
  }

  editInvoice () {
    this.isEdit = true
    // 编辑编辑前,需要清除选择得单选框
    this.selectInvoice = {}
    this.$refs.acountInvoiceList && this.$refs.acountInvoiceList.loadData()
  }

  cancelInvoice () {
    this.isEdit = false
    // 取消编辑时,需要清除选择得单选框
    this.selectInvoice = {}
  }

  formatInvoiceTime ( timeObj ) {
    if ( timeObj && timeObj.time ) {
      return this.formatMyDate( timeObj.time, 'yyyy-MM-dd' )
    } else {
      return ''
    }
  }

  formatInvoiceKind ( kind ) {
    if ( kind !== undefined ) {
      let one: any = invoiceKind.filter( v => v.id === kind )[ 0 ] || {}
      return one && one.name
    } else {
      return ''
    }
  }

  formatInvoiceType ( type ) {
    if ( type !== undefined ) {
      let one: any = invoiceType.filter( v => v.id === type )[ 0 ] || {}
      return one && one.name
    } else {
      return ''
    }
  }

  // 电子发票红冲
  reverseEInvoice () {
    this.reverseEInvoiceBtnDisabled = true
    this.controlInvoice( API.reverseEInvoice )
  }
  // 电子发票重新开票
  remakeEInvoice () {
    this.remakeEInvoiceBtnDisabled = true
    this.confirmControlInvoice( API.remakeEInvoice )
  }
  // 纸质发票重新开票
  remakePInvoice () {
    this.remakePInvoiceBtnDisabled = true
    this.confirmControlInvoice( API.cancelOrderEInvoice )
  }
  confirmControlInvoice ( url ) {
    const message = `重新开票将有一定的时间延迟，请10s后重新刷新页面`

    this.$confirm( message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( res => {
      this.controlInvoice( url )
    } )
  }

  controlInvoice ( url, appendParams = {} ) {
    const param: any = Object.assign( {}, appendParams )
    const { applySn = '' } = this.invoiceMsg
    this.type === 'order' ? param.orderSn = applySn : this.type === 'account' ? param.accountCheckSn = applySn : ''
    return this.$http( url, param ).then( ( { data } ) => {
      // 重新拉订单发票信息
      this.$emit( 'fresh-invoice-info', param )
      this.$notify( {
        type: 'success',
        message: data.rtnMsg || data.msg || '操作成功'
      } )
      this.remakePInvoiceBtnDisabled = false
      this.remakeEInvoiceBtnDisabled = false
      this.reverseEInvoiceBtnDisabled = false

    } ).catch( err => {
      this.remakePInvoiceBtnDisabled = false
      this.remakeEInvoiceBtnDisabled = false
      this.reverseEInvoiceBtnDisabled = false
      this.$notify( {
        type: 'error',
        message: err.data.msg || '操作失败'
      } )
    } )
  }

}
</script>

<style lang="stylus" scoped>
.account-invoice-header
  .title
    display flex
    align-items center
    margin-bottom 10px
    span
      flex 1
      text-align right
  .card-margin
    position relative
    margin-bottom 20px
    .edit-invoice-btn
      position absolute
      right 10px
      top 12px
      font-size 14px
      color #20a0ff
      cursor pointer
    // >>> .el-radio >>> .el-radio__input .el-radio__inner
    // postion absolute
    // top 20px
    .edit-item-row
      padding-left 40px
      box-sizing border-box
  .row-line
    border-top 1px solid #ccc
    margin-top 10px
    padding-top 10px
  .invoice-info
    margin-bottom 15px
</style>
<style lang="stylus">
.invoice-form
  .el-radio-group
    display block
.card-margin
  .el-radio__inner
    postion absolute
    top 40px
</style>
