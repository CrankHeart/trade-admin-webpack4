<template>
  <div class="invoice-dialog-base">
    <el-dialog :title="title" v-model="dialogVisible" :modal-append-to-body="true">
      <div class="dialog-body">
        <div class="title">
          开票信息
          <template v-if="params.otype=='account'">- {{params.accountCheckSn}}</template>
          <template v-else>- {{params.orderSn}}</template>
        </div>
        <div class="invoice-msg" v-if="params.type!='remake'">
          <invoiceItem :invoice="invoiceMsg"></invoiceItem>
        </div>
        <div class="invoice-lists" v-else>
          <invoice-list
            :tenantInfo="tenantInfo"
            @invoice-changed="invoiceChanged"
            :is-set-default="true"
            :canSelectParams="{}"
            :checkable="true"
            :can-not-select="false"
            :editable="true"
            :dialog-to-body="true"
            ref="invoiceList"
          ></invoice-list>
        </div>

        <div class="title" style="margin-bottom:0">
          发票所关联单据信息
          <template
            v-if="params.otype=='account'"
          >&nbsp;&nbsp;对账单号: {{params.accountCheckSn}}</template>
          <el-button
            size="small"
            @click="exportInvoice"
            v-if="params.type =='remake' && $permissionValidateWithEnv(1202,1198)"
          >导出发票Excel</el-button>
        </div>
        <div class="invoice-refer">
          <lc-table :config="config" :data="accountInfoList" :has-page="false" ref="mutationTable">
            <template slot-scope="{row,con}">
              <template v-if="con.prop==='orderSn'">{{row[con.prop]}}</template>
              <template v-else>
                <template v-for="res in row.groupByOrderSnList">
                  <div
                    v-if="con.prop==='receiptType'"
                    class="scope-row"
                  >{{formatReceivableTypes(res[con.prop])}}</div>
                  <div v-else class="scope-row">{{res[con.prop]}}</div>
                </template>
              </template>
            </template>
          </lc-table>
        </div>
        <div class="invoice-input">
          <div class="total" v-if="isShowForm">
            <el-form label-width="120px" class="el-row">
              <el-form-item label="发票编号" required class="el-col el-col-16">
                <el-input v-model.trim="invoiceNum" size="small"></el-input>
              </el-form-item>
              <el-form-item label="发票金额" class="el-col el-col-8" style="textAlign:right;">
                <p style="color:red;">{{amount}}</p>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <!-- <div style="text-align:right;margin-top:15px;" v-if="isShowBtns" >
        <el-button type="primary" @click="submitOper">确定</el-button>
        <el-button @click="cancelOper">取消</el-button>
      </div>-->
      <div slot="footer" v-if="isShowBtns">
        <el-button type="primary" @click="submitOper">确定</el-button>
        <el-button @click="cancelOper">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import invoiceList from '@/pages/invoice/invoiceList.vue'
import invoiceItem from '@/pages/invoice/components/invoiceItem.vue'
import LcTable from '@/components/table'
import { receivableTypes } from '@/pages/order/const/invoiceConst.ts'
import API from '@/API'
export default {
  name: 'invoice-dialog-base',
  components: {
    LcTable,
    invoiceList,
    invoiceItem
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isShowInvoiceOper: { // 是否显示发票编辑按钮
      type: Boolean,
      default: false
    },
    isShowBtns: { // 是否显示底部确认,取消按钮
      type: Boolean,
      default: false
    },
    invoiceMsg: {
      type: Object
    },
    params: {
      type: Object,
      default: () => ( {} )
    },
    tenantInfo: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      isEditInoive: false,
      page: { cur: 1, num: 10, total: 0 },
      invoiceSelectId: null,
      invoiceInfo: { id: -1 },
      receivableTypes: receivableTypes,
      accountInfoList: [],
      invoiceNum: '',
      redInvoiceSn: '',
      amount: 0
    }
  },
  computed: {
    dialogVisible: {
      get: function () {
        return this.value
      },
      set: function ( value ) {
        this.$emit( 'input', value )
      }
    },
    isShowForm() { // 是否显示发票输入框
      // 1. 红冲时,根据之前的历史记录,历史发票为纸质发票显示输入框
      // 2. 重开时,动态根据选择的发票判断,如果是纸质发票,显示输入框
      if ( this.params.type == 'reverse' ) {
        return this.params.kind == 1
      } else if ( this.params.type == 'remake' ) {
        return this.invoiceInfo && this.invoiceInfo.invoiceKind == 1
      } else {
        return false
      }

    },
    config() {
      return [
        { prop: 'orderSn', label: '订单号' },
        { prop: 'receiptNo', label: '单据编号' },
        { prop: 'receiptType', label: '单据类型', width: '100px' },
        { prop: 'receivableMoney', label: '开票金额', width: '100px' }
      ]
    },
    title() {
      if ( this.params.type == 'detail' ) {
        return this.params.otype == 'order' ? '订单开票详情' : '对账单开票详情'
      } else if ( this.params.type == 'remake' ) {
        return '重新开票'
      } else if ( this.params.type == 'reverse' ) {
        return '红冲'
      }

    }
  },
  methods: {
    getAccountInfoList( invoiceSn ) {
      this.$http( API.getInvoiceDetail, {
        invoiceSn: invoiceSn
      } ).then( ( { data } ) => {
        this.accountInfoList = data.data.receivableRelations
        this.amount = data.data.invoiceAmount
      } )
    },
    getReceivableSn() {
      let ret = []
      this.accountInfoList.forEach(
        item => {
          item.groupByOrderSnList.forEach( info => {
            ret.push( info.receivableSn )
          } )
        }
      )
      return ret
    },
    formatReceivableTypes( id ) {
      return ( this.receivableTypes[ id ] && this.receivableTypes[ id ].name ) || ''
    },
    buildForm() {
      let formInfo = {
        invoiceSelectId: this.invoiceSelectId,
        invoiceInfo: this.invoiceInfo,
        invoiceNum: this.invoiceNum.trim(),
        oper: this.params.type || ''
      }
      if ( this.getFormInfo ) {
        formInfo = Object.assign( formInfo )
      }
      return formInfo
    },
    valideForm( params ) {
      if ( this.params.type == 'remake' && params.invoiceSelectId == null ) {
        return { code: 0, msg: '请选择一个发票' }
      }
      if ( this.isShowForm && this.invoiceNum.trim() == "" ) {
        return { code: 0, msg: '请输入发票编号' }
      }
      return { code: 1 }
    },
    submitOper() {
      let formCheck = this.valideForm( this.buildForm() )
      if ( formCheck.code != 1 ) {
        this.$message( {
          message: formCheck.msg,
          type: 'warning'
        } )
        return
      }
      this.$emit( 'onSubmit', this.buildForm() )
      this.$emit( 'input', false )
    },
    cancelOper() {
      this.$emit( 'onCancel', {} )
      this.$emit( 'input', false )
    },
    invoiceChanged( invoice ) {
      if ( invoice == -1 ) {
        this.invoiceSelectId = -1
        this.invoiceInfo = { id: -1, invoiceKind: null }
      } else {
        this.invoiceSelectId = invoice.id || null
        this.invoiceInfo = invoice
      }
    },
    editInvoice() {
      this.isEditInoive = true
    },
    cancelInvoice() {
      this.isEditInoive = false
    },
    // formatInvoiceParam() {
    //   let { tenantId, officeId } = this.tenantInfo
    //   if ( this.params.otype == "order" ) {
    //     //订单维度
    //     return { applySn: this.params.orderSn, id: this.invoiceMsg.id, userInvoiceDataId: this.invoiceSelectId }
    //   } else {
    //     //对账单维度
    //     return {
    //       tenantId,
    //       officeId,
    //       'accountCheckSn': this.params.accountCheckSn,
    //       'id': this.invoiceMsg.id,
    //       'userInvoiceDataId': this.invoiceSelectId
    //     }
    //   }
    // },
    exportInvoice() {
      let receviables = this.getReceivableSn()
      if ( !receviables.length ) {
        return this.$notify( {
          type: 'error',
          message: '暂无订单数据'
        } )
      }
      this.$submit( API.exportFinancialReceivesInvoice, {
        invoiceType: 0,
        receivableSns: receviables.join( ';' )
      } )
    }
  },
  created() {
    this.getAccountInfoList( this.params.invoiceSn )
  }
}
</script>
<style lang="stylus" scoped>
.invoice-dialog-base
  .title
    height 36px
    line-height 36px
    border-bottom 1px solid #dfe6ec
    padding-bottom 5px
    font-weight bold
    margin-bottom 10px
    button
      float right
      margin-left 15px
.dialog-body
  padding 5px 15px
  max-height 500px
  overflow-x hidden
  overflow-y auto
.invoice-lists
  margin-top 15px
  margin-bottom 15px
.invoice-msg
  margin-bottom 15px
  border 1px solid #e3e3e3
.total
  padding 12px
  border 1px solid #dfe6ec
  border-top none
  .el-form-item
    margin-bottom 0
.scope-row
  min-height 30px
  line-height 30px
  margin-left -18px
  margin-right -18px
  text-indent 18px
  + .scope-row
    border-top 1px solid #dfe6ec
</style>

<style lang="stylus">
.invoice-dialog-base
  .el-dialog
    width 60%
</style>
