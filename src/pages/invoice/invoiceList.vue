<template>
  <div class="invoice-list" :class="{'is-fold': myFold}">
    <div class="invoice-list-title" v-if="editable">
      <el-button type="primary" :disabled="moreNum <= 0" @click="addOper()">新增发票</el-button>
      还能新增 {{moreNum}} 个发票信息
    </div>
    <div></div>
    <myradioGroup v-model="checkedId">
      <myradio
        class="invoice-item-radio"
        :value="invoice.id"
        :disable="isDisableSelect(invoice)"
        :checkable="checkable"
        v-for="(invoice,index) in invoiceList"
        :key="invoice.id"
        v-if="!myFold || index==0"
      >
        <invoiceItem :editable="editable" :invoice="invoice">
          <template slot="oper">
            <div v-if="editable">
              <span class="oper-item" @click.stop="operDelete(invoice)">删除</span>
              <span class="oper-item" @click.stop="operEdit(invoice)">编辑</span>
              <span
                class="oper-item"
                @click.stop="operDefault(invoice)"
                v-if="!invoice.isDefault"
              >设为默认</span>
              <span class="oper-item default" v-else>默认</span>
            </div>
          </template>
        </invoiceItem>
      </myradio>
      <myradio class="invoice-item-radio" :value="-1" v-if="canNotSelect==true">
        <invoiceItem :isNoSelect="true"></invoiceItem>
      </myradio>
    </myradioGroup>
    <div class="invoice-dialog">
      <invoice-edit-dialog
        :dialog-to-body="dialogToBody"
        :invoice-item-msg="invoiceItemMsg"
        @update-invoice-msg-list="updateInvoicMsgList"
        :edit="isEditInvoice"
        :visible.sync="isShowInvoiceDialog"
      />
    </div>
    <div class="drop-down" v-if="invoiceList.length>1&&myFold" @click="myFold=false"></div>
  </div>
</template>
<script>
import invoiceItem from '@/pages/invoice/components/invoiceItem.vue'
import myradioGroup from '@/pages/invoice/components/myradioGroup.vue'
import myradio from '@/pages/invoice/components/myradio.vue'
import { invoiceKind, invoiceType, defaultInvoiceType, defaultInvoiceKind } from '../order/const/invoiceConst'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import invoiceEditDialog from './invoiceEditDialog'

export default {
  name: 'invoice-list',
  components: {
    invoiceEditDialog,
    invoiceItem,
    myradioGroup,
    myradio
  },
  props: {
    canNotSelect: { // 是否可以不选择发票
      default: false
    },
    canSelectParams: { // 发票是否可选,额外参数
      required: false,
      default: () => {
        return { dimension: null }
      }
    },
    dialogToBody: { // 是否把弹窗提到顶层,弹窗嵌套时可用
      required: false,
      default: false
    },
    lastInvoice: { //  上次的发票信息,为了判断本次是否可以选择其他发票类型.
      required: false,
      default: () => { }
    },
    isOpened: {  // 是否已经有开票记录,如果有开票记录,则
      required: false,
      default: false
    },
    storeId: Number,
    tenantId: String,
    officeId: String,
    accountCheckSn: String, // 对账单时,需要传入对账单编号
    checkable: {  // 是否显示左侧的单选组件,
      required: false,
      default: false
    },
    editable: { // 是否选择右上角的编辑,删除,设为默认等操作
      required: false,
      default: true
    },
    isSetDefault: {  // 是否需要初始时把默认地址选上
      required: false,
      default: false
    },
    tenantInfo: {  // 是否需要初始时把默认地址选上
      required: true,
      default: () => {
        return { tenantId: '', officeId: '' }
      }
    },
    fold: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      invoiceTypes: invoiceType,
      invoiceKinds: invoiceKind,
      invoiceItemMsg: {},
      checkedId: null,
      isEditInvoice: false,
      isShowInvoiceDialog: false,
      page: { cur: 1, num: 10, total: 0 },
      myFold: false
    }
  },
  computed: {
    ...mapGetters( {
      moreNum: 'invoice/moreNum'
    } ),
    ...mapState( {
      invoiceList: state => state.invoice.invoiceList,
      operInvoice: state => state.invoice.operInvoice
    } ),
  },
  watch: {
    checkedId: {
      handler( val, oldVal ) {
        if ( val ) {
          if ( val == -1 ) {
            // 说明是选择不开发票,要特殊处理
            this.$emit( 'invoice-changed', -1 )
            this.setOperInvoiceMutation( {} )
            return
          }
          let invoiceFind = this.invoiceList.find( item => item.id == val )
          if ( !invoiceFind ) {
            // 如果发票不存在
            this.reSetInvoiceSelected()
          } else if ( invoiceFind.invoiceKind == 0 ) {
            // 电子发票
            if ( this.checkCanMakeElecInvoice( invoiceFind ) ) {
              this.$emit( 'invoice-changed', invoiceFind )
              this.setOperInvoiceMutation( invoiceFind )
            } else {
              this.reSetInvoiceSelected()
            }
          } else {
            // 检测是否是纸质发票,如果是纸质发票,需要验证收货地址是否完整
            if ( this.checkPaperInfoOk( invoiceFind ) ) {
              this.$emit( 'invoice-changed', invoiceFind )
              this.setOperInvoiceMutation( invoiceFind )
            } else {
              // 提示用户信息不完整,请编辑后再次选择
              this.reSetInvoiceSelected()
              this.$message( {
                message: '纸质发票必须填写邮寄信息,请完善后再次选择',
                type: 'warning'
              } )
            }
          }
        } else {
          this.reSetInvoiceSelected()
        }
      },
      immediate: false
    },
    tenantInfo: {
      handler( val, oldVal ) {
        this.checkedId = null
        this.loadData()
      },
      deep: true
    }
  },
  methods: {
    ...mapActions( {
      getInvoiceList: 'invoice/getInvoiceList',
      deleteInvoice: 'invoice/deleteInvoice',
      setDefaultInvoice: 'invoice/setDefaultInvoice',
      isZiYing: 'stores/isZiYing'
    } ),
    ...mapMutations( {
      setOperInvoiceMutation: 'invoice/setOperInvoiceMutation',
    } ),
    updateInvoicMsgList() {
      this.loadData()
    },
    addOper() {
      this.invoiceItemMsg = {
        tenantId: this.tenantInfo.tenantId, officeId: this.tenantInfo.officeId,
        bankAccount: '',
        bankDeposit: '',
        companyAddress: '',
        companyCityId: '',
        companyCountryId: '',
        companyDetailAddress: '',
        companyProvinceId: '',
        consignee: '',
        consigneeAddress: '',
        consigneeCityId: '',
        consigneeCountryId: '',
        consigneeDetailAddress: '',
        consigneeProvinceId: '',
        consigneeTel: '',
        id: null,
        invoiceKind: defaultInvoiceKind,
        invoiceMobile: '',
        invoiceTitle: '',
        invoiceType: defaultInvoiceType
      }
      this.isShowInvoiceDialog = true
    },
    reSetInvoiceSelected() {
      this.checkedId = null
      this.$emit( 'invoice-changed', {} )
      this.setOperInvoiceMutation( {} )
    },
    operEdit( invoice ) {
      this.invoiceItemMsg = invoice
      this.isShowInvoiceDialog = true
    },
    operDelete( invoice ) {
      this.$confirm( '确认删除么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      } ).then( () => {
        this.deleteInvoice( { id: invoice.id } ).then( ( data ) => {
          // 删除成功后,如果之前选择的是当前删除的项,会出bug,所以要清楚选中的项
          if ( this.operInvoice && this.operInvoice.id == invoice.id ) {
            this.$emit( 'invoice-changed', {} )
            this.setOperInvoiceMutation( {} )
          }
        } ).catch( ( { data } ) => {
          this.$message( {
            message: data.msg,
            type: 'error'
          } )
        } )
      } )
    },
    operDefault( invoice ) {
      this.setDefaultInvoice( { id: invoice.id } ).then( data => {
        if ( data.code == 'A0000' ) {
          this.$message( {
            message: data.msg,
            type: 'success'
          } )
        } else {
          this.$message( {
            message: data.msg,
            type: 'error'
          } )
        }
      }
      )
    },
    // 如果正确返回true,否则返回false
    checkPaperInfoOk( invoice ) {
      // 检测纸质类型发票是否有收获地址
      if ( invoice && invoice.invoiceKind == 1 ) {// 如果是纸质发票,需要检测信息是否齐全
        if ( invoice.consigneeAddress && invoice.consigneeAddress != ''
          && invoice.consigneeTel && invoice.consigneeTel != '' ) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    checkCanMakePaperInvoice( invoice ) {
      // 纸质发票,暂无限制,这里预留处理方法
      return true
    },
    checkCanMakeElecInvoice( invoice ) {
      // 电子发票可以改为纸质发票,纸质发票不能改为电子发票
      // invoiceKind 0 电子,1纸质
      if ( this.lastInvoice && this.lastInvoice.invoiceKind && this.lastInvoice.invoiceKind == 1 && invoice.invoiceKind == 0 ) {
        // console.log('纸质发票不能改为电子发票')
        return false
      }
      // 出库单可以开电子发票了
      // if ( invoice.invoiceKind == 0 && this.canSelectParams && this.canSelectParams.dimension && this.canSelectParams.dimension == 1 ) {
      //   // console.log('出库单粒度，不能开电子发票')
      //   return false
      // }
      return true
    },
    // 是否可选,返回true,不可选
    isDisableSelect( invoice ) {
      // 如果不是自营,并且storeId有值传入,电子发票不能选择 (这里后台先不做限制,只做前台限制)
      // if(this.storeId&&!this.isZiYing(this.storeId)&&invoice.invoiceKind==0){
      //   return true
      // }
      if ( !this.checkCanMakeElecInvoice( invoice ) ) {
        return true
      }
      if ( !this.checkCanMakePaperInvoice( invoice ) ) {
        return true
      }
      return false
    },
    loadData() {
      this.checkedId = null
      // 这里如果商户变了,需要更新发票列表信息
      if ( this.tenantInfo.tenantId && this.tenantInfo.officeId ) {
        this.getInvoiceList( {
          tenantId: this.tenantInfo.tenantId,
          officeId: this.tenantInfo.officeId
        } ).then( data => {
          // 设置默认发票选中状态
          if ( data.length > 0 && this.isSetDefault == true ) {
            let defaultInvoicde = data.find( item => item.isDefault == true )
            if ( defaultInvoicde && defaultInvoicde.id ) {
              this.checkedId = defaultInvoicde.id
            }
          }
        } ).catch( err => {
          this.$message( {
            message: err.data.msg || '发票加载出错',
            type: 'error'
          } )
        } )
      }
    }
  },
  created() {
    this.myFold = this.fold
    this.loadData()
  }
}
</script>
<style scoped>
.invoice-list-title {
  margin-bottom: 15px;
}
.invoice-item-radio {
  border: 1px solid #e3e3e3;
  margin-bottom: 25px;
}
</style>
<style lang="stylus" scoped>
.invoice-list
  &.is-fold
    position relative
    min-height 235px
    .drop-down
      border-left 1px solid #000
      border-bottom 1px solid #000
      width 12px
      height 12px
      position absolute
      left 50%
      bottom 3px
      transform rotate(-45deg) translateX(-50%)
      cursor pointer
</style>



