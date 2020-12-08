<template>
  <el-dialog
    :title="title"
    :visible="visible"
    :before-close="cancel"
    class="invoice-selecter-dialog"
    :modal-append-to-body="dialogToBody"
  >
    <invoice-list
      :tenantInfo="tenantInfo"
      :store-id="selectStoreId"
      @invoice-changed="invoiceChanged"
      :key="tenantInfo.tenantId+tenantInfo.officeId"
      :is-set-default="isSetDefault"
      :canSelectParams="canSelectParams"
      :checkable="checkable"
      :can-not-select="canNotSelect"
      :editable="editable"
      :dialog-to-body="dialogEditToBody"
      ref="acountInvoiceList"
    ></invoice-list>

    <div>
      <el-button type="danger" :disabled="canDisabled" @click="operSubmit()">{{btnStr}}</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import invoiceList from '@/pages/invoice/invoiceList.vue'
import { Action } from 'vuex-class'
@Component( {
  name: 'invoice-selecter-dialog',
  components: {
    invoiceList
  }
} )
export default class InvoiceEditDialog extends Vue {
  @Prop( { default: '发票列表' } ) title: string // 标题
  @Prop( { default: '确认' } ) btnStr: string  // 按钮文字
  @Prop( {
    required: true, default: () => {
      return { tenantId: null, officeId: null }
    }
  } ) tenantInfo: any
  @Prop( {
    required: false, default: () => {
      return { dimension: null }
    }
  } ) canSelectParams: any
  @Prop( { required: true, default: false } ) visible: boolean

  @Prop( { default: true } ) isSetDefault: boolean // 是否自动选中默认的
  @Prop( { default: true } ) checkable: boolean // 是否有单选框
  @Prop( { default: true } ) editable: boolean // 是否可以编辑
  @Prop( { default: true } ) canNotSelect: boolean  // 是否可以不选择发票
  @Prop( { default: false } ) dialogToBody: boolean // 发票选择框是否附加到body
  @Prop( { default: true } ) dialogEditToBody: boolean // 发票编辑页面是否附加到body
  selectStoreId = null   // 当前发票的storeId ,为了判断是否是自营,自营无法开电子发票
  currentInvoice: any = {}
  noInvoice: boolean = false // 不选择发票

  get canDisabled () {
    if ( this.noInvoice == true ) {
      return false
    }
    return !this.currentInvoice || !this.currentInvoice.id
  }
  mounted () {
    // 解决element-ui dialog 多层嵌套,内部dialog不完整问题,塞到body上面,顶层弹窗
    if ( this.dialogToBody ) {
      document.body.appendChild( this.$el )
    }
  }
  invoiceChanged ( invoice ) {
    if ( invoice == -1 ) {
      this.noInvoice = true
      this.currentInvoice = { id: -1 }
    } else {
      this.noInvoice = false
      this.currentInvoice = invoice
    }
  }
  operSubmit () {
    if ( !this.currentInvoice.id ) {
      this.$notify( {
        type: 'warning',
        message: '请先选择一个发票信息'
      } )
      return false
    }
    this.$emit( 'invoice-selected', this.currentInvoice )
    this.$emit( 'update:visible', false )
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
