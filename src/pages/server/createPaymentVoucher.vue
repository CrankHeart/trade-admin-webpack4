<template>
  <div class="create-payment-voucher">
    <!-- 表单 -->
    <el-form class="el-row" :model="formInline" label-width="100px" ref="business-detail-form">
      <el-col :span="12" :lg="12" :md="12" :sm="12" :xs="12" v-for="(item,i) in itemList" :key="i">
        <el-form-item :label="item.label">
          <el-date-picker
            v-if="item.type=='datetimerange'"
            v-model="formInline[item.prop]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="isCheck || item.disabled || ( voucherStatus !== 0 && voucherStatus !== 2 )"
          ></el-date-picker>
          <el-select
            v-else-if="item.type == 'select'"
            v-model="formInline[item.prop]"
            :disabled="isCheck || item.disabled || (voucherStatus !== 0 && voucherStatus !== 1 && voucherStatus !== 2) || ( item.prop == 'lcBank' && formInline.paymentType === '' )"
          >
            <el-option
              v-for="list in item.options"
              :key="list.name+list.id"
              :label="list.name"
              :value="list.id"
            ></el-option>
          </el-select>
          <el-input
            v-else-if="item.prop == 'officeName'"
            v-model="formInline['officeName']"
            :type="item.type"
            :disabled="isCheck || item.disabled || ( voucherStatus !== 0 && voucherStatus !== 2 ) || !!officeName"
            :placeholder="item.placeholder"
          ></el-input>
          <template v-else-if="item.prop == 'payee'">
            <salesLeaders
              v-model="formInline['payee']"
              :disabled="isCheck || item.disabled || ( voucherStatus !== 0 && voucherStatus !== 2 )"
              :placeholder="item.placeholder"
            ></salesLeaders>
          </template>

          <el-input
            v-else
            v-model="formInline[item.prop]"
            :type="item.type"
            :disabled="isCheck || item.disabled || (voucherStatus !== 0 && voucherStatus !== 2 && item.prop !== 'lcTradeSn') || (item.prop == 'lcTradeSn' && voucherStatus > 2)"
            :placeholder="item.placeholder"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="'付款凭证上传'">
          <template v-if="!isCheck && (voucherStatus == 0 || voucherStatus == 2)">
            <input-file-upload @change="singleFileUpload($event)" v-if="uploadImgList.length<3">
              <el-button type="text" class="upload-img">上传</el-button>
            </input-file-upload>
            <span class="img-tip" v-else>凭证最多上传3张</span>
          </template>
          <div class="voucher-img-list">
            <div v-for="(uploadImg,index) in uploadImgList" :key="uploadImg.absolutePath">
              <template v-if="uploadImgList">
                <img :src="uploadImg.absolutePath" />
                <div class="check-img" @click="viewImg = uploadImg.absolutePath">查看</div>
                <i
                  class="el-icon-close"
                  @click="deleteImg(uploadImg, index)"
                  v-if="!isCheck && (voucherStatus == 0 || voucherStatus == 2) && !uploadImg.imgSource "
                ></i>
              </template>
            </div>
          </div>
        </el-form-item>
      </el-col>
      <el-col
        :span="12"
        :lg="8"
        :md="12"
        :sm="12"
        :xs="24"
        v-for="(reviewItem,i) in reviewItemList"
        :key="i"
      >
        <el-form-item
          :label="reviewItem.label"
          v-if="
        ( reviewItem.prop == 'lcTradeSn' && ( voucherStatus == 1 || voucherStatus > 2 ) )
        ||
        ( reviewItem.prop == 'reviewRemark' && voucherStatus > 0 )
        ||
        ( reviewItem.prop == 'writeOffRemark' && ( voucherStatus > 4 || ( voucherStatus == 4 && formInline.writeOffRemark !== undefined ) ) )"
        >
          <el-input
            v-model="formInline[reviewItem.prop]"
            :type="reviewItem.type"
            :disabled="isCheck || ( ( reviewItem.prop == 'lcTradeSn' || reviewItem.prop == 'reviewRemark' ) && (voucherStatus >= 2 ) )
          ||
          ( reviewItem.prop == 'writeOffRemark' && ( voucherStatus > 5 || voucherStatus == 4 ) )"
            :placeholder="reviewItem.placeholder"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-form>
    <el-row>
      <el-col :span="24" :lg="24" :md="24" :sm="24" :xs="24">
        <!-- 对账单模式 / 订单模式 -->
        <component
          :is="orderType ? 'monthlyTable' : 'ordinaryTable'"
          :formInline="formInline"
          :officeOrderList="officeOrderList"
          :isCheck="isCheck"
          :voucherStatus="voucherStatus"
          :reverseSign="reverseSign"
          :ref="orderType ? 'monthlyTable' : 'ordinaryTable'"
          :id="id"
          @add-payment-voucher-list="showPaymentVoucherDialog = true"
          @delete-payment-voucher-list="deletePaymentVoucherList"
        />
      </el-col>
      <!-- 底部 button -->
      <el-col :span="24" class="button-box">
        <div class="pull-right">
          <el-button
            type="primary"
            @click="signReverse()"
            v-if="$permissionValidateWithEnv( 1217, 1213 ) && isShowSignReverseBtn()"
          >重新核销</el-button>
          <template v-if="!isCheck">
            <el-button
              type="primary"
              @click="savePaymentVoucher('save')"
              v-if="( voucherStatus == 0 || voucherStatus == 2  ) && $permissionValidateWithEnv( 1223,1219 ) "
            >保存</el-button>
            <el-button
              type="primary"
              @click="savePaymentVoucher('submitReviewPaymentVoucher')"
              v-if="( voucherStatus == 0 || voucherStatus == 2 ) && $permissionValidateWithEnv( 1224,1220 )"
            >提交审批</el-button>
            <el-button
              type="primary"
              @click="savePaymentVoucher('save', voucherStatus)"
              v-if="( voucherStatus == 3 || voucherStatus == 4 || voucherStatus == 6 ) && $permissionValidateWithEnv( 1225,1221 )"
              :disabled="isDisabled()"
            >保存核销</el-button>
            <el-button
              type="primary"
              @click="savePaymentVoucher('submitWriteOffPaymentVoucher', voucherStatus)"
              v-if="( voucherStatus == 3 || voucherStatus == 4 || voucherStatus == 6 ) && $permissionValidateWithEnv( 1226,1222 )"
              :disabled="isDisabled()"
            >提交核销</el-button>
            <el-button
              type="primary"
              @click="reviewPaymentVoucher('review',1)"
              v-if="voucherStatus == 1 && $permissionValidateWithEnv( 1227,1223 )"
            >审批通过</el-button>
            <el-button
              type="warning"
              @click="reviewPaymentVoucher('reject',1)"
              v-if="voucherStatus == 1 && $permissionValidateWithEnv( 1228,1224 )"
            >审批打回</el-button>
            <el-button
              type="primary"
              @click="reviewPaymentVoucher('review',5)"
              v-if="voucherStatus == 5 && $permissionValidateWithEnv( 1229,1225 )"
            >核销通过</el-button>
            <el-button
              type="warning"
              @click="reviewPaymentVoucher('reject',5)"
              v-if="voucherStatus == 5 && $permissionValidateWithEnv( 1230,1226 )"
            >核销打回</el-button>
            <el-button
              type="warning"
              @click="reviewPaymentVoucher('obsolete')"
              v-if="voucherStatus !== 0 && voucherStatus !== 7 && voucherStatus !== 8 && !writtenOffAmount && $permissionValidateWithEnv( 1216,1212 )"
            >作废</el-button>
          </template>
        </div>
      </el-col>
    </el-row>
    <!--  全屏查看图片 -->
    <div class="view-mask" v-if="viewImg" @click="viewImg=''">
      <div class="img">
        <img :src="viewImg" />
        <i class="el-icon-close"></i>
      </div>
    </div>
    <el-dialog
      :title="`请选择满足条件的${orderType?'对账单':'订单'}`"
      size="large"
      v-if="showPaymentVoucherDialog"
      v-model="showPaymentVoucherDialog"
    >
      <select-customer
        :customer="orderType? 'monthlyCustomer' : 'commonCustomer'"
        :formInline="formInline"
        @change-office-list="changeOfficeList"
        :officeOrderList="officeOrderList"
      ></select-customer>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { paymentTypes, lcBanks, lcAllipays, lcWechats, lcFinAdjust } from '@/pages/server/const/paymentVoucherConst'
import lcTable from '../../components/table/index'
import inputFileUpload from '../../components/inputFileUpload.vue'
import selectCustomer from './components/selectCustomer.vue'
import monthlyTable from './components/monthlyTable.vue'
import ordinaryTable from './components/ordinaryTable.vue'
import salesLeaders from "@/components/salesLeaders.vue";
import API from '../../API'

@Component( {
  name: 'create-payment-voucher',
  components: {
    lcTable,
    inputFileUpload,
    selectCustomer,
    ordinaryTable,
    monthlyTable,
    salesLeaders
  }
} )
export default class createPaymentVoucher extends Vue {
  amountSum: number = 0
  relatedAmount: number = 0
  voucherSn: string = ''
  viewImg: string = ''
  showPaymentVoucherDialog: boolean = false
  @Prop( { type: Array } )
  officeList
  @Prop( { type: Number } )
  id
  @Prop( { default: false, type: Boolean } )
  isCheck
  @Prop( { type: Number } )
  voucherStatus
  @Prop( { type: Number, default: 0 } )
  reverseSign
  @Prop( { type: Number } )
  orderType
  @Prop( { type: String } )
  officeName
  get dimension () {
    return this.orderType === 1 ? 2 : 1
  }
  @Watch( 'formInline.paymentType' )
  paymentTypeWatcher ( v, o ) {
    if ( o !== '' ) {
      this.formInline.lcBank = ''
    }
  }

  isShowSignReverseBtn () {
    // 如果尚未重新核销过,并且是部分核销或已核销,可以显示重新核销按钮
    if ( this.reverseSign == 0 && ( this.voucherStatus == 6 || this.voucherStatus == 7 ) ) {
      return true
    }
    return false
  }

  isDisabled () {
    if ( this.reverseSign == 1 && this.voucherStatus == 4 ) {
      return false
    }
    return !!( ( this.voucherStatus == 6 && !this.officeOrderList.filter( v => v.isEditAdd ).length ) || ( this.voucherStatus == 4 && this.officeOrderList.filter( v => ( v.writtenOffAmount > 0 ) ).length == this.officeOrderList.length - 1 ) )
  }


  formInline: any = {
    voucherSn: '',
    officeName: '',
    amount: 0,
    refundedAmount: 0,
    refundingAmount: 0,
    unWrittenOffAmount: 0,
    tradeSn: '',
    remark: '',
    tenantId: '',
    officeId: '',
    customerId: '',
    payee: '',
    payer: '',
    lcBank: '',
    lcTradeSn: '',
    actualPayDate: '',
    paymentType: '',
    reviewRemark: '',
    writeOffRemark: ''
  }
  uploadImgList: any = []
  reviewItemList: any = [
    { prop: 'lcTradeSn', label: '商家流水号', type: 'text', placeholder: '请输入商家流水号', disabled: false },
    { prop: 'reviewRemark', label: '审批备注', type: 'textarea', placeholder: '请输入审批备注', disabled: false },
    { prop: 'writeOffRemark', label: '核销备注', type: 'textarea', placeholder: '请输入核销备注', disabled: false },
  ]

  get lcBanks () {
    const { paymentType } = this.formInline
    switch ( +paymentType ) {
      case 1:
        return lcBanks
      case 2:
        return lcAllipays
      case 3:
        return lcWechats
      case 4:
        return lcFinAdjust
      default:
        Object.assign( this.formInline, { lcBank: -1 } )
        return [ { id: -1, name: '未分配' } ]
    }
  }

  get itemList (): any[] {
    return [
      { prop: 'voucherSn', label: '付款凭证', type: 'text', placeholder: '', disabled: true },
      { prop: 'officeName', label: '客户名称', type: 'text', placeholder: '', disabled: false },
      { prop: 'amount', label: '凭证金额', type: 'text', placeholder: '请输入金额', disabled: false },
      { prop: 'payer', label: '付款人', type: 'text', placeholder: '请输入付款人', disabled: false },
      { prop: 'paymentType', label: '交易渠道', type: 'select', disabled: false, options: paymentTypes },
      { prop: 'lcBank', label: '收款银行', type: 'select', disabled: false, options: this.lcBanks },
      { prop: 'tradeSn', label: '交易流水', type: 'text', placeholder: '请输入交易流水号', disabled: false },
      { prop: 'payee', label: '销售负责人', type: 'text', placeholder: '请输入销售负责人', disabled: false },
      { prop: 'actualPayDate', label: '实际付款时间', type: 'datetimerange', placeholder: '请选择付款时间', disabled: false },
      { prop: 'remark', label: '备注', type: 'textarea', placeholder: '请输入备注信息', disabled: false }
    ]
  }

  officeOrderList: any = []
  changeOfficeList ( v ) {
    this.showPaymentVoucherDialog = false
    let length = this.officeOrderList.length
    let maxRowId = length > 1 ? this.officeOrderList[ length - 2 ].rowId : 0
    this.officeOrderList.splice( length - 1, 0, ...v.map( ( value, index ) => ( {
      ...value,
      relatedAmount: 0,
      bakRelatedAmount: 0,
      rowId: index + maxRowId + 1,
      isEditAdd: true,
      control: 'delete'
    } ) ) )
  }
  @Inject() formatMyDate

  signReverse () {
    if ( !this.formInline.voucherSn || this.formInline.voucherSn == "" ) {
      this.$notify( {
        type: 'warning',
        message: "voucherSn不能为空"
      } )
      return
    }

    this.$http( API[ 'signReverse' ], { voucherSn: this.formInline.voucherSn } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '操作成功！'
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: true, orderType: this.orderType } )
    }, ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: false, orderType: this.orderType } )
    } )
  }

  savePaymentVoucher ( api, voucherStatus ) {
    let tips = this.validateTip()
    // console.log(this.officeOrderList)
    //   if ( ( voucherStatus == 3 || voucherStatus == 4 || voucherStatus == 6 ) && this.officeOrderList.some( v => !v.bakRelatedAmount ) ) {
    //     tips = '对账单关联金额必须填写'
    //   }
    let compName = this.orderType ? 'monthlyTable' : 'ordinaryTable'
    let countAmount = this.$refs[compName]['countAmount'] || 0
    if ( parseFloat( countAmount ) < 0 ) {
      tips = '本次核销总金额不能小于0'
    }
    if ( tips ) {
      this.$notify( {
        type: 'warning',
        message: tips
      } )
      return
    }

    let APIPath = api == 'save' ? ( this.id !== undefined ? 'updatePaymentVoucher' : 'savePaymentVoucher' ) : api
    this.$http( API[ APIPath ], this.params() ).then( res => {
      this.$notify( {
        type: 'success',
        message: '操作成功！'
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: true, orderType: this.orderType } )
    }, ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: false, orderType: this.orderType } )
    } )
  }
  reviewPaymentVoucher ( type, voucherStatus ) {
    let { voucherSn, reviewRemark, writeOffRemark, lcTradeSn, paymentType, lcBank } = this.formInline
    let APIpath = ''
    let params = {}
    if ( type == 'review' ) {
      if ( voucherStatus == 1 && !lcTradeSn ) {
        return this.$notify( {
          type: 'warning',
          message: '请输入领健交易流水号'
        } )
      }
      APIpath = voucherStatus == 1 ? 'reviewPaymentVoucher' : 'writeOffPaymentVoucher'
      params = voucherStatus == 1 ? { lcTradeSn, reviewRemark, paymentType, lcBank } : { writeOffRemark }
    } else if ( type == 'reject' ) {
      APIpath = 'rejectPaymentVoucher'
      params = voucherStatus == 1 ? { lcTradeSn, reviewRemark } : { writeOffRemark }
    } else if ( type == 'obsolete' ) {
      APIpath = 'obsoletePaymentVoucher'
    }
    this.$http( API[ APIpath ], { voucherSn, ...params } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '操作成功！'
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: true } )
    }, ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
      this.$emit( 'change-payment-voucher-dialog', { dialog: false } )
    } )
  }
  validateTip () {
    let { amount, tradeSn, actualPayDate, payer, payee, lcBank, paymentType } = this.formInline
    if ( !amount || amount < 0 ) {
      return '请输入凭证金额'
    }
    if ( !payer ) {
      return '请输入付款人'
    }
    if ( !paymentType ) {
      return '请选择交易渠道'
    }
    if ( !lcBank && paymentType === 1 ) {
      return '如果支付渠道为银行的话,请输入对应的领健对公银行'
    }
    if ( !tradeSn ) {
      return '请输入交易流水号'
    }
    if ( !payee ) {
      return '请输入销售负责人'
    }
    if ( amount - this.relatedAmount < 0 ) {
      return '剩余关联金额不能小于0'
    }
    if ( !( this.uploadImgList && this.uploadImgList.length ) ) {
      return '请至少上传一张付款凭证'
    }
    if ( actualPayDate && ( new Date( actualPayDate ).getTime() > new Date().getTime() ) ) {
      return '实际付款时间必须小于现在的时间'
    }

  }
  params () {
    return ( {
      ...this.formInline,
      financialType: 1,
      dimension: this.dimension,
      actualPayDate: this.formInline.actualPayDate ? this.formatMyDate( this.formInline.actualPayDate ) : '',
      relatedAmount: this.relatedAmount,
      writtenOffAmount: this.officeOrderList.filter( v => v[ 'orderSn' ] ).reduce( ( total, next ) => {
        total += next[ 'writtenOffAmount' ]
        return total
      }, 0 ),
      voucherOrders: this.officeOrderList.filter( v => v[ 'orderSn' ] ).map( v =>
        ( {
          orderSn: v[ 'orderSn' ],
          relatedAmount: v[ 'bakRelatedAmount' ]
        } ) ),
      voucherStatements: this.officeOrderList.filter( v => v[ 'orderList' ] ).map( v =>
        ( {
          accountCheckSn: v[ 'accountCheckSn' ],
          relatedAmount: v[ 'bakRelatedAmount' ]
        } ) ),
      voucherImages: this.uploadImgList.map( ( v, i ) => ( { sort: i, imgUrl: v.id !== undefined ? v.imgUrl : v.relativePath } ) )
    } )
  }

  validateImg ( file ) {
    let isValidate = true

    const fileType = ( ( file.name || '' ).split( '.' ).slice( -1 )[ 0 ] || '' ).toLowerCase()
    const fileSize = file.size
    const maxSize = 200 * 1024

    if ( !( /(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) ) {
      this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
      isValidate = false
    }
    if ( fileSize > maxSize ) {
      this.$message( {
        type: 'error',
        message: "上传图片大小不能大于200kb！"
      } )
      isValidate = false
    }
    return isValidate
  }
  singleFileUpload ( e ) {
    let file = e.target.files[ 0 ]
    if ( !this.validateImg( file ) ) {
      return
    }

    // const absolutePath = item.absolutePath
    const formData = new FormData()
    formData.append( "voucherSn", this.formInline.voucherSn )
    formData.append( "imgPath[0]", file )

    this.$http( API.paymentVoucherUploadImg, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      const { absolutePath, relativePath } = data
      this.uploadImgList.push( { absolutePath, relativePath } )

      this.$notify( {
        type: 'success',
        message: '上传成功！'
      } )
    }, () => {
      this.$notify( {
        type: 'error',
        message: '上传错误！'
      } )
    } )

  }
  deleteImg ( uploadImg, index ) {
    this.$confirm( '是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.uploadImgList.splice( index, 1 )
      let imgUrl = uploadImg.imgUrl || uploadImg.relativePath
      this.$http( API.deletePaymentVoucherImage, { imgUrl } ).then( res => {
        this.$notify( {
          type: 'success',
          message: '删除成功！'
        } )
      }, rej => {
        this.$notify( {
          type: 'warning',
          message: '删除失败,请重试！'
        } )

      } )
    } )
  }
  paymentVoucherId: any = ''
  deletePaymentVoucherList ( v ) {
    this.$confirm( '是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      if ( v.id ) {
        this.$http( API.deletePaymentVoucherItem, { voucherSn: v.voucherSn, itemId: v.id } ).then( res => {
          this.officeOrderList = this.officeOrderList.filter( val => val.rowId !== v.rowId )
          this.$emit( 'delete-data-update' )
        }, rej => {
          this.$notify( {
            type: 'warning',
            message: rej.data.msg
          } )
        } )
      } else {
        this.officeOrderList = this.officeOrderList.filter( val => val.rowId !== v.rowId )
      }
    } )
  }
  writtenOffAmount: number = 0
  created () {
    if ( this.id !== undefined ) {
      this.$http( API.paymentVoucherDetail, { id: this.id } ).then( ( { data } ) => {
        let resConfig = data.data
        this.paymentVoucherId = resConfig.id
        Object.keys( this.formInline ).forEach( v => {
          if ( this.formInline.hasOwnProperty( v ) ) {
            this.formInline[ v ] = resConfig[ v ]
          }
        } )
        this.writtenOffAmount = resConfig.writtenOffAmount
        this.formInline.lcBank = resConfig.lcBank || ''
        this.formInline[ 'actualPayDate' ] = resConfig.actualPayDate ? new Date( resConfig.actualPayDate && resConfig.actualPayDate.time ) : ''
        let orders = resConfig.dimension == 1 ? resConfig.voucherOrders : resConfig.voucherStatements
        this.officeOrderList = orders && orders.map( ( v, i ) => ( {
          ...v,
          bakRelatedAmount: v.relatedAmount + v.writtenOffAmount,
          rowId: i + 1,
          control: 'delete'
        } ) ).concat( { control: 'add' } )
        this.uploadImgList = resConfig.voucherImages
      } )
    } else {
      let a = [ 'amount', 'tradeSn', 'remark', 'actualPayDate', 'payee', 'payer', 'lcBank', 'lcTradeSn', 'paymentType', 'reviewRemark', 'writeOffRemark' ]
      a.forEach( v => {
        if ( this.formInline.hasOwnProperty( v ) ) {
          this.formInline[ v ] = ''
        }
      } )
      this.uploadImgList = []
      this.$http( API.getPaymentVoucherSn, { financialType: 1 } ).then( ( { data } ) => {
        this.formInline.voucherSn = data.data
        this.formInline.officeName = this.officeName
        let addPaymentVoucherItem = JSON.parse( localStorage.getItem( 'addPaymentVoucherItem' ) )
        let officeOrderList = addPaymentVoucherItem[ this.formInline.officeName ] || []
        this.officeOrderList = officeOrderList.map( ( v, i ) => ( {
          ...v,
          orderSn: v.orderSn,
          amount: +v.paymentAmountString || +v.amount,
          rowId: i + 1,
          relatedAmount: 0,
          bakRelatedAmount: 0,
          control: 'delete'
        } ) ).concat( { control: 'add' } )
        let officeOrderItem = this.officeOrderList && this.officeOrderList[ 0 ] || {}
        this.formInline.tenantId = officeOrderItem.tenantId || ''
        this.formInline.officeId = officeOrderItem.officeId || ''
      } )

    }

  }
}
</script>
<style lang="stylus" scoped>
.upload-img
  cursor pointer
.voucher-img-list
  display flex
  div
    border 1px solid #eee
    margin-left 20px
    position relative
    .check-img
      position absolute
      top 0
      left -20px
      width 80px
      height 80px
      background rgba(0, 0, 0, 0.3)
      color #fff
      text-align center
      line-height 80px
      cursor pointer
      display none
    &:hover
      .check-img
        display block
    img
      width 80px
      height 80px
    i
      width 18px
      height 18px
      text-align center
      line-height 18px
      top -9px
      right -9px
      position absolute
      display block
      background rgba(32, 160, 255, 0.5)
      color #fff
      border-radius 50%
      &:hover
        background rgb(32, 160, 255)
.button-box
  margin 20px 0px
.view-mask
  position fixed
  left 0
  top 0
  right 0
  bottom 0
  z-index 999
  background rgba(0, 0, 0, 0.3)
  .img
    min-width 200px
    min-height 200px
    max-width 400px
    background rgba(0, 0, 0, 0.3)
    box-shadow 0 0 20px rgba(0, 0, 0, 0.8)
    position absolute
    top 50%
    left 50%
    transform translate3d(-50%, -50%, 0)
    i
      width 25px
      height 25px
      text-align center
      line-height 25px
      top -9px
      right -9px
      position absolute
      display block
      background rgba(32, 160, 255, 0.5)
      color #fff
      border-radius 50%
      &:hover
        background rgb(32, 160, 255)
    img
      width 100%
      height 100%
.img-tip
  color red
</style>
