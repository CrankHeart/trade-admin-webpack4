<template>
  <div class="detail-invoice-list">
    <div class="invoice-tables">
      <div class="detail-invoice-header">
        <h3>开票明细</h3>
        <span v-if="isPaperInvoice" class="invoice-header-right">
          <el-button
            type="primary"
            size="small"
            v-if="$permissionValidate( 1079 )"
            @click.stop="exportInvoice"
          >导出Excel</el-button>
          <!-- <el-button type="primary" size="small" v-if="hasCreateInvoiceBtn && $permissionValidate( 1080 )" @click.stop="showInvoiceDialog">新建开票记录</el-button> -->
        </span>
      </div>
      <lc-table :config="config" :has-page="false" :data="invoiceItemList">
        <template slot-scope="scope">
          <template
            v-if="scope.con.prop === 'invoiceApplyTime'"
          >{{ formatInvoiceTime( scope.row[ scope.con.prop ] ) }}</template>
          <template v-else-if="scope.con.prop === 'control'">
            <!-- <span v-if="isPaperInvoice && $permissionValidate( 1078 )">
                <el-button type="danger" size="mini" @click.stop="showRedInvoiceDialog( scope.row )">红冲</el-button>
            </span>-->
            <span v-if="!isPaperInvoice &&  $permissionValidate( 1077 )">
              <!-- <span @click.stop="downloadPDF( scope.row.bluePdfUrl )" class="el-button el-button--primary el-button--mini" v-if="scope.row.bluePdfUrl" >下载</span> -->
              <a
                download=".pdf"
                target="_blank"
                class="el-button el-button--primary el-button--mini"
                v-if="scope.row.bluePdfUrl"
                :href="scope.row.bluePdfUrl"
              >下载</a>
              <span v-else>暂无发票</span>
            </span>
          </template>
          <template v-else-if="scope.con.prop === 'index'">{{ scope.$index + 1 }}</template>
          <template v-else>{{scope.row[ scope.con.prop ]}}</template>
        </template>
      </lc-table>
    </div>
    <el-dialog size="small" title="开票" v-model="isShowDialog">
      <el-form :model="newInvoice" :rules="createRules" ref="invoiceForm" label-width="100px">
        <el-form-item label="发票编号" prop="invoiceNo">
          <el-input v-model="newInvoice.invoiceNo"></el-input>
        </el-form-item>
        <el-form-item label="开票金额" prop="invoiceAmount">
          <el-input v-model="newInvoice.invoiceAmount"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="confirmBtnDisabled" @click="confirmBtn">确定</el-button>
      </span>
    </el-dialog>
    <!-- <div style="text-align: center;margin-top: 20px;">
      <el-button v-if="$permissionValidate( 1087 )" type="primary" :loading="reCreateBtnDisabled" @click.stop="reCreateInvoice">重新开票</el-button>
    </div>-->
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Inject, Prop } from "vue-property-decorator"
import API from "../../../API"
import lcTable from '../../../components/table/'
import { invoiceKind, invoiceType } from '../const/invoiceConst'
import { orderAllStatus } from "../const/orderSearchCondition"

@Component( {
  name: "detail-invoice-list",
  components: {
    lcTable
  }
} )
export default class DetailInvoice extends Vue {
  @Prop( { default: '' } ) id: string
  @Prop( { default: 0 } ) orderStatus: number
  @Prop( { default: () => { } } ) invoiceMsg: any
  @Prop( { default: () => [] } ) invoiceItemList: any[]
  // @Prop( { default: () => false } ) elecInvoiceStatus: boolean
  @Inject() formatMyDate


  config: any = [
    { prop: 'index', label: '发票序号' },
    { prop: 'blueInvoiceNum', label: '发票编号' },
    { prop: 'invoiceApplyTime', label: '开票日期' },
    { prop: 'invoiceAmount', label: '发票金额' },
    { prop: 'control', label: '操作' }
  ]

  currInvoiceId: string = ''

  // elecInvoiceStatus: boolean = false

  newInvoice: any = {
    invoiceNo: '',
    invoiceAmount: ''
  }
  createRules: any = {
    invoiceNo: [
      { required: true, message: '发票编号不可为空', trigger: 'blur' }
    ],
    invoiceAmount: [
      { required: true, message: '开票金额不可为空', trigger: 'blur' }
    ]
  }

  isShowDialog: boolean = false
  isRedInvoice: boolean = false
  confirmBtnDisabled: boolean = false
  reCreateBtnDisabled: boolean = false

  get isPaperInvoice () {
    return this.invoiceMsg && this.invoiceMsg.invoiceKind === 1
  }

  get hasInvoiceData () {
    return this.invoiceItemList.length || Object.keys( this.invoiceMsg ).length
  }

  get hasCreateInvoiceBtn () {
    let { withGoods } = this.invoiceMsg
    let status = this.orderStatus
    // withGoods = 1:随货发票，2:普通发票
    // orderStatus = [ '未付款', '待发货', '已发货', '已收货', '已评价', '已完成', '已取消', '部分发货' ]
    return ( withGoods == 1 && !( [ 0, 6 ].indexOf( status ) > -1 ) )
      || ( withGoods == 2 && [ 2, 3, 4, 5 ].indexOf( status ) > -1 )
  }

  exportInvoice () {
    this.$permissionValidateWithNotify( 1079 )
    this.$submit( API.exportOrderPaperInvoice, {
      orderSn: this.id
    } )
  }



  showInvoiceDialog () {
    this.newInvoice = {
      invoiceNo: '',
      invoiceAmount: ''
    }
    this.isRedInvoice = false
    this.isShowDialog = true
  }

  showRedInvoiceDialog ( row ) {
    this.currInvoiceId = row.id
    this.newInvoice.invoiceNo = ''
    this.newInvoice.invoiceAmount = ''
    this.isShowDialog = true
    this.isRedInvoice = true
  }

  confirmBtn () {
    this.confirmBtnDisabled = true
    if ( this.isRedInvoice ) {
      this.reservePaperInvoice()
    } else {
      this.makeMemberOrderPaperInvoice()
    }
  }

  makeMemberOrderPaperInvoice () {
    if ( !this.inValidForm() ) {
      this.confirmBtnDisabled = false
      return
    }
    this.$permissionValidateWithNotify( 1080 )
    this.$http( API.makeMemberOrderPaperInvoice, {
      ...this.newInvoice,
      orderSn: this.id
    } ).then( ( { data } ) => {
      this.isShowDialog = false
      this.confirmBtnDisabled = false
      this.$emit( 'refresh' )
    } ).catch( ( { data } ) => {
      this.confirmBtnDisabled = false
      this.$notify( {
        type: 'error',
        message: data.msg || '开票记录新建失败'
      } )
    } )
  }

  reservePaperInvoice () {

    if ( !this.inValidForm() ) {
      this.confirmBtnDisabled = false
      return
    }
    this.$permissionValidateWithNotify( 1078 )
    let { invoiceNo, invoiceAmount } = this.newInvoice

    this.$http( API.reservePaperInvoice, {
      invoiceNo,
      invoiceAmount,
      invoiceId: this.currInvoiceId
    } ).then( ( { data } ) => {
      this.$emit( 'refresh' )
      this.isShowDialog = false
      this.confirmBtnDisabled = false
    } ).catch( ( { data } ) => {
      this.confirmBtnDisabled = false
      this.$notify( {
        type: 'error',
        message: data.msg || '开票记录红冲失败'
      } )
    } )
  }

  inValidForm () {
    let isValid = false
    let form: any = this.$refs[ 'invoiceForm' ]

    form.validate( ( valid ) => {
      isValid = valid
      return isValid
    } )
    return isValid
  }







  formatInvoiceTime ( applyTime ) {
    let time = applyTime && applyTime.time
    return this.formatMyDate( time, 'yyyy-MM-dd' )
  }
}
</script>

<style lang="stylus" scoped>
.detail-invoice-header
  display flex
  align-item center
  .invoice-status
    margin-left 20px
    background #999
    color #fff
    padding 3px 25px
  .invoice-header-right
    flex 1
    text-align right
  .invoice-message
    margin-top 10px
.invoice-tables
  margin-top 20px
.center
  text-align center
</style>
