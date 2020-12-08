<template>
  <el-dialog
    class="invoice-dialog-create"
    v-model="dialogVisible"
    :title="title"
    :modal-append-to-body="true"
    :before-close="dialogClose"
  >
    <div class="title">
      开票信息
      <template v-if="type == 2">- {{ value.accountCheckSn }}</template>
      <template v-else>- {{ value.orderSn }}</template>
      <template v-if="isEditInvoice">
        <el-button size="samll" @click="isEditInvoice=false">取消</el-button>
        <el-button size="samll" type="primary" @click="updateInvoiceApplyInfo">确认</el-button>
      </template>
      <template v-else>
        <el-button size="samll" type="primary" @click="isEditInvoice=true">修改</el-button>
      </template>
    </div>
    <template v-if="isEditInvoice">
      <div class="invoice-lists">
        <invoice-list
          :tenantInfo="tenantInfo"
          @invoice-changed="invoiceChanged"
          :is-set-default="true"
          :canSelectParams="{}"
          :checkable="true"
          :lastInvoice="invoiceApply"
          :can-not-select="false"
          :editable="true"
          :dialog-to-body="true"
          ref="invoiceList"
        ></invoice-list>
      </div>
    </template>
    <template v-else>
      <invoiceItem :invoice="invoiceApply"></invoiceItem>
    </template>

    <ReceiptSelector :invoice="selectInvoice" :sn="sn" :type="type" @change="receiptChange"></ReceiptSelector>
    <div class="total">
      <el-form label-width="120px" class="el-row">
        <el-form-item label="发票编号" required class="el-col el-col-16">
          <el-input v-model="blueInvoiceNum" size="small"></el-input>
        </el-form-item>
        <el-form-item label="发票金额" class="el-col el-col-8" style="textAlign:right;">
          <p style="color:red;">{{ amount }}</p>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" v-if="!isEditInvoice">
      <el-button @click="dialogClose">取消</el-button>
      <el-button type="primary" @click="submit">确认</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import invoiceList from '@/pages/invoice/invoiceList.vue'
import invoiceItem from "@/pages/invoice/components/invoiceItem.vue";
import API from "@/API";
import ReceiptSelector from "./receiptSelector.vue";

@Component( {
  components: {
    invoiceList,
    invoiceItem,
    ReceiptSelector
  }
} )
export default class InvoiceDialogCreate extends Vue {
  @Prop( { default: "开票" } )
  title: string;
  @Prop()
  value: any;
  @Prop()
  type: number; // 0: 待开随货发票 1: 待开订单发票 2： 待开对账单发票
  blueInvoiceNum = "";
  dialogVisible = true;
  get tenantInfo () {
    let { tenantId, officeId } = ( this.value || {} ) as any;
    return { tenantId, officeId };
  }

  isEditInvoice = false
  formatParam () {
    return {
      id: this.invoiceApply.id,
      userInvoiceDataId: this.selectInvoice.id
    };

  }

  updateInvoiceApplyInfo () {
    if ( !this.selectInvoice.id ) {
      this.$notify( {
        type: "error",
        message: "请先选择一个发票信息"
      } );
      return false;
    }

    // 开票时,无法选择电子发票
    if ( this.selectInvoice.invoiceKind == 0 ) {
      this.$notify( {
        type: "error",
        message: "请选择纸质发票"
      } );
      return false;
    }
    // this.$permissionValidateWithNotify( this.permissionEditInvoiceBtn )
    let param = this.formatParam();
    this.$http( API.updateInvoiceApplyInfo, param )
      .then( ( { data } ) => {
        this.value.invoiceApply = this.selectInvoice
        this.isEditInvoice = false
        this.$notify( {
          type: "success",
          message: data.msg
        } );
      } )
      .catch( ( { data = {} } ) => {
        this.$notify( {
          type: "error",
          message: ( data as any ).msg || "开票信息编辑失败"
        } );
      } );
  }

  dialogClose () {
    this.$emit( "input", null );
  }
  get accountCheckSn () {
    return this.value.accountCheckSn;
  }
  get orderSn () {
    return this.value.orderSn;
  }
  get receivableSn () {
    return this.value.receivableSn;
  }
  get sn () {
    return {
      accountCheckSn: this.accountCheckSn,
      orderSn: this.orderSn,
      receivableSn: this.receivableSn
    };
  }
  selectReceipt = [];
  selectType = 0;
  get invoiceApply () {
    return this.value.invoiceApply || {};
  }
  receiptChange ( { type, list } ) {
    this.selectReceipt = list;
    this.selectType = type;
  }
  selectInvoice = null;
  invoiceChanged ( invoice ) {
    this.selectInvoice = invoice;
  }
  get amount () {
    return this.selectReceipt
      .reduce( ( t, v ) => t + Number( v.receivableAmount ), 0 )
      .toFixed( 2 );
  }
  makeInvoiceAssert () {
    if ( !this.selectReceipt.length ) {
      this.notifyAssert( "请选择票据" );
    }
    if ( !this.blueInvoiceNum ) {
      this.notifyAssert( "请输入发票编号" );
    }
  }
  notifyAssert ( message ) {
    this.$notify( {
      type: "error",
      message
    } );
    throw new Error( message );
  }
  submit () {
    this.makeInvoiceAssert();
    let { accountCheckSn, orderSn } = this.value;
    let params = {
      accountCheckSn: ( !orderSn && accountCheckSn ) || undefined,
      orderSn,
      blueInvoiceNum: this.blueInvoiceNum,
      amount: this.amount,
      list: this.selectReceipt.map( v => ( {
        receivableSn: v.receivableSn
      } ) ),
      invoiceType: this.selectType,
      broadcast: true
    };
    this.$http( API.makePaperInvoice, params ).then( ( { data } ) => {
      this.dialogClose();
      this.$emit( "submit", this.value );
    } );
  }
}
</script>
<style lang="stylus" scoped>
.total
  padding 12px
  border 1px solid #dfe6ec
  border-top none
  .el-form-item
    margin-bottom 0
.invoice-list-item
  border 1px solid #e3e3e3
  padding 12px
  margin 12px 0
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
</style>
<style lang="stylus">
.invoice-dialog-create
  .el-dialog
    width 60%
</style>
