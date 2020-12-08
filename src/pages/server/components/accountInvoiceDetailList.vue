<template>
  <div class="invoice-detail-list">
    <div class="title">
      <h3>开票明细</h3>
      <span v-if="isPaperInvoice">
        <el-button
          type="primary"
          size="small"
          v-if="$permissionValidate( 1084 ) && isShowOper"
          @click.stop="exportInvoice"
        >导出Excel</el-button>
        <!-- <el-button type="primary" size="small" v-if="$permissionValidate( 1085 )" @click.stop="showInvoiceDialog">新建开票记录</el-button> -->
      </span>
    </div>
    <lc-table :data="list" :config="config" :page="page" @cur-change="curChange">
      <template slot-scope="scope">
        <template
          v-if="scope.con.prop === 'createDate'"
        >{{ formatInvoiceTime( scope.row[ scope.con.prop ] ) }}</template>
        <template v-else-if="scope.con.prop === 'control'">
          <!-- <span v-if="isPaperInvoice && $permissionValidate( 1083 )">
            <el-button type="danger" size="mini" @click.stop="showRedInvoiceDialog( scope.row )">红冲</el-button>
          </span>-->
          <span v-if="!isPaperInvoice && $permissionValidate( 1082 )">
            <!-- <a v-if="scope.row.bluePdfUrl" :href="scope.row.bluePdfUrl" class="el-button el-button--primary el-button--mini">下载</a>
            <a v-else class="el-button el-button--primary el-button--mini">下载</a>-->
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
        <template v-else-if="scope.con.prop === 'index'">{{scope.$index + 1}}</template>
        <template v-else>{{scope.row[ scope.con.prop ]}}</template>
      </template>
    </lc-table>
    <el-dialog size="small" title="开票" v-model="isShowDialog">
      <el-form :model="newInvoice" :rules="createRules" ref="invoiceForm" label-width="100px">
        <el-form-item label="发票编号" prop="invoiceNo">
          <el-input v-model="newInvoice.invoiceNo"></el-input>
        </el-form-item>
        <el-form-item label="开票金额" prop="invoiceAmount">
          <el-input v-model="newInvoice.invoiceAmount"></el-input>
        </el-form-item>
        <!-- <el-form-item label="订单号" prop="orderSn">
          <el-input v-model="newInvoice.orderSn"></el-input>
        </el-form-item>-->
        <!-- <el-form-item label="订单号" prop="orderSn" :class="{ hide: isRedInvoice }">
          <el-input v-model="newInvoice.orderSn"></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="confirmBtnLoading" @click="confirmBtn">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import lcTable from '../../../components/table/'
import API from '../../../API'

@Component( {
  name: 'invoice-detail-list',
  components: {
    lcTable
  }
} )
export default class PaperInvoiceList extends Vue {
  @Prop() list: any[]
  @Prop() accountCheckSn: string
  @Prop() page: any
  @Prop() paper: boolean
  @Prop() invoiceType: number

  @Inject() formatMyDate

  get isPaperInvoice () {
    return this.paper
  }

  isShowDialog: boolean = false
  confirmBtnLoading: boolean = false

  config: any[] = [
    { prop: 'index', label: '发票序号', width: '100px' },
    // { prop: 'orderSn', label: '订单号' },
    { prop: 'blueInvoiceNum', label: '发票编号', width: '300px' },
    { prop: 'createDate', label: '开票日期' },
    { prop: 'invoiceAmount', label: '发票金额' },
    { prop: 'control', label: '操作' },
  ]

  newInvoice: any = {
    invoiceNo: '',
    invoiceAmount: '',
    // orderSn: ''
  }

  createRules: any = {
    invoiceNo: [
      { required: true, message: '发票编号不可为空', trigger: 'blur' }
    ],
    invoiceAmount: [
      { required: true, message: '开票金额不可为空', trigger: 'blur' }
    ]
    // orderSn: [
    //   { required: true, message: '订单号不可为空', trigger: 'blur' }
    // ]
  }

  isRedInvoice: boolean = false

  curChange ( cur ) {
    this.$emit( 'change-page', cur )
  }

  get isShowOper () {
    // 此版本对账单先不让导出
    return false
  }

  showInvoiceDialog () {
    this.newInvoice = {
      invoiceNo: '',
      invoiceAmount: '',
      // orderSn: ''
    }
    this.isRedInvoice = false
    this.isShowDialog = true
  }

  showRedInvoiceDialog ( row ) {
    this.newInvoice.invoiceId = row.id
    // this.newInvoice.orderSn = row.orderSn
    this.newInvoice.invoiceNo = ''
    this.newInvoice.invoiceAmount = ''
    this.isRedInvoice = true
    this.isShowDialog = true
  }

  confirmBtn () {
    this.confirmBtnLoading = true
    if ( this.isRedInvoice ) {
      this.createNewRedInvoice()
    } else {
      this.createNewInvoice()
    }
  }

  createNewInvoice () {
    if ( !this.inValidForm() ) {
      this.confirmBtnLoading = false
      return
    }
    this.$permissionValidateWithNotify( 1085 )
    this.$http( API.makePaperInvoice, {
      accountCheckSn: this.accountCheckSn,
      invoiceType: this.invoiceType,
      ...this.newInvoice
    } ).then( ( { data } ) => {
      data = data.data
      this.unshiftInvoiceItem( data )
      this.confirmBtnLoading = false
    } ).catch( ( { data } ) => {
      this.confirmBtnLoading = false
      this.$notify( {
        type: 'error',
        message: data.msg || '开票记录红冲失败'
      } )
    } )
  }

  createNewRedInvoice () {
    if ( !this.inValidForm() ) {
      this.confirmBtnLoading = false
      return
    }
    this.$permissionValidateWithNotify( 1083 )
    let { invoiceId, invoiceNo, invoiceAmount } = this.newInvoice

    this.$http( API.reservePaperInvoiceForAccount, {
      invoiceId, invoiceNo, invoiceAmount
    } ).then( ( { data } ) => {
      // this.unshiftInvoiceItem()
      this.confirmBtnLoading = false
      data = data.data || {}
      this.list.some( item => {
        let isTheInvoice = item.id === invoiceId
        if ( isTheInvoice ) {
          item.id = data.invoiceId
          item.invoiceSn = invoiceNo
          item.invoiceAmount = invoiceAmount
          item.createDate = { time: Date.now() }
        }
        return isTheInvoice
      } )
      this.isShowDialog = false
    } ).catch( ( { data } ) => {
      this.confirmBtnLoading = false
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

  unshiftInvoiceItem ( data ) {
    let invoice = this.newInvoice
    this.list.unshift( {
      orderSn: invoice.orderSn,
      id: data.invoiceId,
      invoiceSn: invoice.invoiceNo,
      invoiceAmount: invoice.invoiceAmount,
      createDate: { time: Date.now() },
    } )
    this.page.total += 1
    this.isShowDialog = false
  }

  exportInvoice ( row ) {
    this.$permissionValidateWithNotify( 1084 )
    this.$submit( API.exportAccountPaperInvoice, {
      accountCheckSn: this.accountCheckSn
    } )
  }

  formatInvoiceTime ( timeObj ) {
    if ( timeObj && timeObj.time ) {
      return this.formatMyDate( timeObj.time, 'yyyy-MM-dd' )
    } else {
      return ''
    }
  }

}
</script>

<style lang="stylus" scoped>
.title
  display flex
  align-items center
  margin-bottom 10px
  span
    flex 1
    text-align right
.hide
  display none
</style>


