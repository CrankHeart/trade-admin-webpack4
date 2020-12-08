<template>
  <div class="invoice-manage">
    <lc-condition :condition="condition" @submit="search">
      <template v-if="$permissionValidateWithEnv(1285,1274)" slot="btn">
        <el-button @click="setInExcel" type="warning">批量邮寄</el-button>
        <template v-if="importTaskInfo.status==2">
          <el-button
            type="primary"
            @click="setInExcel"
            v-loading.fullscreen.lock="fullscreenLoading"
            element-loading-text="批量导入比较耗时,请耐心等候:>"
          >导入中,请稍后</el-button>
        </template>
        <template v-else-if="importTaskInfo.status==3">
          <el-button type="primary" @click="showErrorMsg">导入完成,查看结果</el-button>
        </template>
        <template v-else-if="importTaskInfo.status==4">
          <el-button type="danger" @click="showErrorMsg">导入失败,查看结果</el-button>
        </template>
      </template>
    </lc-condition>
    <div>
      <lc-table
        :config="config"
        :data="lists"
        @cur-change="curChange"
        :page="page"
        :key="config.length"
      >
        <template slot-scope="{row,con}">
          <template v-if="con.prop==='control' ">
            <el-button
              type="info"
              size="small"
              v-if="$permissionValidateWithEnv(1189,1185)"
              @click="detailOper(row)"
            >详情</el-button>
            <el-button
              type="info"
              size="small"
              v-if="$permissionValidateWithEnv(1285,1274)"
              @click="emailSend(row)"
            >邮寄</el-button>
            <template
              v-if="row.invoiceStatus!=2 && row.invoiceStatus!=3 && row.receivableType != 2"
            >
              <!-- 发票已重开以及红字应收的暂不支持操作  -->
              <a
                download=".pdf"
                target="_blank"
                v-if="row.invoiceStatus!=1 && row.bluePdfUrl && $permissionValidateWithEnv(1190,1186)"
                class="el-button el-button--info el-button--small"
                :href="row.bluePdfUrl"
              >下载</a>
              <el-button
                type="info"
                size="small"
                v-if="row.invoiceStatus ==1 && $permissionValidateWithEnv(1191,1187)"
                @click="remakeOper(row)"
              >重开发票</el-button>
              <el-button
                type="danger"
                size="small"
                v-if="row.invoiceStatus!=1 && $permissionValidateWithEnv(1192,1188)"
                @click="reverseOper(row)"
              >红冲</el-button>
            </template>
          </template>
          <template v-else-if="con.prop==='invoiceKind'">{{formatInvoiceKind(row[con.prop])}}</template>
          <template v-else-if="con.prop==='invoiceStatus'">{{formatInvoiceStatus(row[con.prop])}}</template>
          <template v-else-if="con.prop==='mailStatus'">{{formatMailStatus(row[con.prop])}}</template>
          <template v-else-if="con.prop==='withGoods'">{{formatWithGoods(row[con.prop])}}</template>
          <template v-else-if="con.prop==='invoiceApplyTime'">{{formatDate(row[con.prop])}}</template>
          <template v-else-if="con.prop==='mailTime'">{{formatDate(row[con.prop])}}</template>
          <template v-else-if="['invoiceAmount'].includes(con.prop)">
            <span v-price-info="row[con.prop]"></span>
          </template>
          <template v-else>{{row[con.prop]}}</template>
        </template>
      </lc-table>
    </div>
    <sync-import
      ref="syncImport"
      v-model="visibleDialog"
      :importUrl="importUrl"
      :downloadUrl="downloadUrl"
      :checkTastStatusUrl="checkImportStatusUrl"
      @taskOk="taskOk"
      @taskFail="taskFail"
      @taskAddSuc="taskAddSuc"
      @taskAddFail="taskAddFail"
    ></sync-import>
    <invoiceDialogBase
      v-if="showInvoiceDialog"
      @onSubmit="onSubmit"
      :invoiceMsg="invoiceMsg"
      :isShowBtns="isShowInvoiceBtns"
      :tenantInfo="tenantInfo"
      :params="invoiceParams"
      v-model="showInvoiceDialog"
    ></invoiceDialogBase>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import lcCondition from '@/components/condition.vue'
import invoiceDialogBase from '@/pages/invoice/components/invoiceDialogBase.vue'
import lcTable from '@/components/table/index'
import API from '@/API'
import { invoiceKind, invoiceType, invoiceStatus, receivableTypes, withGoods, mailStatus } from '@/pages/order/const/invoiceConst.ts'
import { matchArrItem } from '../../../utils/'
import syncImport from "@/pages/server/components/syncImport.vue"

const emaillMsgConfig = {
  queryUrl: '/business/invoice/getMailInvoiceDetail',
  saveUrl: '/business/invoice/updateInvoiceMailInfo',
  saveTip: true,
  fields: [ {
    name: '发票编号',
    key: 'blueInvoiceNum'
  }, {
    name: '邮寄地址',
    key: 'address'
  }, {
    name: '快递公司',
    key: 'expressCompanyId',
    required: true,
    editor: 'select',
    filterable: true,
    clearable: true,
    config: {
      id: 'expressCompanyIdQueryDs',
      queryUrl: API.allLogistic,
      show: 'name',
      key: 'id',
      queryFilter: data => data.logisticCompanyList
    }
  }, {
    name: '运单号',
    key: 'mailSn',
    editor: 'input',
    required: true,
  } ],
  queryFilter( { data } ) {
    let address = data.address.name + ' ' + data.address.mobile + ' ' + data.address.address
    let { id, blueInvoiceNum, expressCompanyId, mailSn } = data
    return { id, blueInvoiceNum, address, expressCompanyId, mailSn }
  }
}

export default {
  name: 'invoice-recode',
  components: {
    lcCondition,
    invoiceDialogBase,
    lcTable,
    syncImport
  },
  inject: [ 'formatMyDate' ],
  props: {
  },
  data() {
    return {
      invoiceKinds: invoiceKind,
      invoiceStatus: invoiceStatus,
      withGoods: withGoods,
      receivableTypes: receivableTypes,
      condition: [
        { value: {}, key: 'tenant', label: '集团名称', type: 'tenantSearch' },
        { value: {}, key: 'customer', label: '客户名称', type: 'customerSearch' },
        { value: [], key: 'applyTime', label: '开票时间', type: 'daterange' },
        { value: '', key: 'blueInvoiceNum', label: '发票编号', type: 'text' },
        { value: '', key: 'orderSn', label: '订单号', type: 'text' },
        { value: '', key: 'deliverySn', label: '出库单号', type: 'text' },
        { value: '', key: 'accountCheckSn', label: '对账单号', type: 'text' },
        { value: '', key: 'invoiceKind', label: '开票方式', type: 'select', options: invoiceKind },
        { value: '', key: 'withGoods', label: '是否随货', type: 'select', options: withGoods },
        { value: '', key: 'mailStatus', label: '邮寄状态', type: 'select', options: mailStatus },
        { value: '', key: 'invoiceStatus', label: '发票状态', type: 'select', options: invoiceStatus },
        { value: '', key: 'mailSn', label: '运单号', type: 'text' },
        { value: [], key: 'mailTime', label: '邮寄时间', type: 'daterange' },
      ],
      config: [
        { prop: 'blueInvoiceNum', label: '发票编号', width: '220px' },
        { prop: 'invoiceAmount', label: '发票金额', width: '150px' },
        { prop: 'invoiceApplyTime', label: '开票时间', width: '180px' },
        { prop: 'invoiceKind', label: '开票方式', width: '220px' },
        { prop: 'withGoods', label: '是否随货', width: '180px' },
        { prop: 'invoiceStatus', label: '发票状态', width: '180px' },
        { prop: 'customerName', label: '客户', width: '180px' },
        { prop: 'mailStatus', label: '邮寄状态', width: '180px' },
        { prop: 'mailSn', label: '运单号', width: '180px' },
        { prop: 'mailTime', label: '邮寄时间', width: '180px' },
        { prop: 'control', label: '操作', width: '260px', fixed: 'right' }
      ],
      page: { cur: 1, total: 0, num: 10 },
      visibleDialog: false,// 弹框开关
      importUrl: '/business/invoice/importInvoiceMailInfoFile',// 批量邮寄接口
      downloadUrl: '/excel/invoiceModule',// 模板下载接口
      checkImportStatusUrl: API.getJobResult,
      importTaskInfo: {
        // 异步导入状态
        status: 1,
        jobId: null,
      },
      fullscreenLoading: false,
      lists: [],
      invoiceItemList: [], // 已经开出的发票记录
      invoiceMsg: {},
      tenantInfo: {},
      orderInfoList: [], // 订单出库信息
      accountInfoList: [], // 对账单出库信息
      invoiceAmount: 0, // 对账单金额汇总
      elecInvoiceStatus: null,
      showInvoiceDialog: false,
      isShowInvoiceBtns: false, // 是否显示发票弹窗按钮
      invoiceParams: { otype: 'order', type: 'detail', kind: undefined } // invoice弹窗传递的参数 otype order类型订单,对账单, type:操作类型 detail,remark,reverse,kind 发票类型0电子,1纸质
    }
  },
  computed: {
    ...mapState( {
      allLogistic: state => state.logistic.logistic
    } )
  },
  methods: {
    setInExcel() {
      this.visibleDialog = true
      this.importTaskInfo.status = 1;
    },
    showErrorMsg() {
      this.$refs.syncImport && this.$refs.syncImport.showErrDialog();
    },
    taskAddSuc( info ) {
      this.importTaskInfo.status = 2;
      this.importTaskInfo.jobId = info.jobId;
      this.fullscreenLoading = true;
    },
    taskAddFail( err ) {
      this.importTaskInfo.status = 4;
      this.importTaskInfo.jobId = null;
      this.$message( {
        type: "error",
        message: err.msg,
      } );
    },
    taskOk( okJobs ) {
      this.importTaskInfo.status = okJobs.exportStatus;
      this.importTaskInfo.jobId = okJobs.jobId;
      this.fullscreenLoading = false;
      this.loadData();
    },
    taskFail( failJobs ) {
      this.importTaskInfo.status = failJobs.exportStatus;
      this.importTaskInfo.jobId = failJobs.jobId;
      this.fullscreenLoading = false;
    },
    curChange( cur ) {
      this.page.cur = cur
      this.loadData()
    },
    dataAdapter() {
      let o = {}
      o.num = this.page.num
      o.start = ( this.page.cur - 1 ) * o.num
      this.condition.forEach( ( con ) => {
        let { key, value, type } = con
        if ( type === 'tenantSearch' ) {
          o.tenantId = value.id
          o.tenantName = value.name
        } else if ( type === 'customerSearch' ) {
          o.customerId = value.id
          o.customerName = value.name
        } else if ( type == 'daterange' ) {
          if ( value && value[ 0 ] ) {
            o[ `${key}Start` ] = this.formatMyDate( value[ 0 ] )
            o[ `${key}End` ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
          }
        } else if ( type == 'date' ) {
          if ( value ) {
            o[ key ] = this.formatMyDate( value, 'yyyy-MM-dd hh:mm:ss', true )
          }
        } else {
          if ( value !== '' ) {
            o[ key ] = value
          }
        }
      } )
      return o
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time )
      }
      return ''
    },
    formatInvoiceKind( invoiceKind ) {
      return ( this.invoiceKinds[ invoiceKind ] && this.invoiceKinds[ invoiceKind ].name ) || ''
    },
    formatInvoiceStatus( invoiceStatusId ) {
      return ( this.invoiceStatus[ invoiceStatusId ] && this.invoiceStatus[ invoiceStatusId ].name ) || ''
    },
    formatMailStatus( code ) {
      let record = mailStatus.find( item => item.id === code )
      return record ? record.name : ''
    },
    formatWithGoods( withGoodsId ) {
      return matchArrItem( withGoodsId, this.withGoods, 'id' ).name
    },
    loadData() {
      // this.$permissionValidateWithNotifyEnv(1188,1184)
      let params = this.dataAdapter()
      this.$http( API.invoiceListByCondition, params ).then( ( { data } ) => {
        this.lists = data.list || []
        this.page.total = data.total
      }, rej => {
        this.$message( {
          message: rej.msg,
          type: 'warning'
        } )
      } )
    },
    showInvoiceDetail() {
      this.showInvoiceDialog = true
    },
    search() {
      this.page.cur = 1
      this.loadData()
    },
    onSubmit( formInfo ) {
      let { oper } = formInfo
      if ( oper == 'remake' ) {
        this.remoteRemakeOper( { invoiceSn: this.invoiceParams.invoiceSn, userInvoiceDataId: formInfo.invoiceSelectId, blueInvoiceNum: formInfo.invoiceNum } )
      } else if ( oper == 'reverse' ) {
        this.remoteReverseOper( { id: this.invoiceParams.id, redInvoiceSn: formInfo.invoiceNum } )
      }
    },
    valideForm( { tenantId, officeId } ) {
      return ( tenantId == '' && 'tenantId不能为空' ) || ( officeId == '' && 'officeId不能为空' ) || ''
    },
    remoteReverseOper( params ) {
      // 电子发票红冲,纸质发票不知道是不是这个接口
      this.$http( API.redDashElecInvoice, params ).then( ( { data } ) => {
        this.$message( {
          message: '红冲成功',
          type: 'success'
        } )
        setTimeout( () => {
          this.loadData()
        }, 1000 );

      } ).catch( ( { data } ) => {
        this.$notify( {
          type: 'error',
          message: data.msg || '开票记录红冲失败'
        } )
      } )
    },
    remoteRemakeOper( params ) {
      this.$http( API.remakeSingleEInvoice, params ).then( data => {
        this.$message( {
          message: '重新开票成功',
          type: 'success'
        } )
        setTimeout( () => {
          this.loadData()
        }, 1000 );

      } ).catch( rej => {
        this.$message( {
          message: rej.data.msg,
          type: 'warning'
        } )
      } )
    },
    detailOper( row ) {
      this.isShowInvoiceBtns = false
      this.invoiceOper( row, 'detail' )
    },
    emailSend( row ) {
      this.emailMsgDs.query( { id: row.id } )
      this.$popup( {
        title: '邮寄发票',
        props: this.emailMsgDs,
        confirm: async () => {
          let res = await this.emailMsgDs.save()
          if ( res ) {
            this.loadData()
          }
          return res
        }
      } )
    },
    downloadOper( url ) {
    },
    remakeOper( row ) {
      // 电子发票重新开票不需要填写发票信息,纸质需要
      // 调用接口查询是订单还是对账单维度
      this.invoiceOper( row, 'remake' )
      this.isShowInvoiceBtns = true
    },
    invoiceOper( params, type ) {
      this.tenantInfo = {
        tenantId: params.tenantId,
        officeId: params.officeId
      }
      let errMsg = this.valideForm( this.tenantInfo )
      if ( errMsg ) {
        this.$message( {
          message: errMsg,
          type: 'warning'
        } )
        return
      }

      this.invoiceParams = {
        orderSn: params.orderSn,
        id: params.id,
        invoiceSn: params.invoiceSn,
        accountCheckSn: params.accountCheckSn || "",
        otype: params.accountCheckSn == "" ? "order" : "account",
        type: type,
        kind: params.invoiceKind
      }
      this.renderInvoiceHeader( params )
      this.showInvoiceDialog = true
    },
    reverseOper( row ) {
      this.invoiceOper( row, 'reverse' )
      this.isShowInvoiceBtns = true
    },
    getOrderInfoList( orderSn ) {
      this.$http( API.getOutBoundDetail, {
        orderSn: orderSn
      } ).then( ( { data } ) => {
        this.orderInfoList = data.deliveryList
      } )
    },
    renderInvoiceHeader( data ) {
      const {
        invoiceTitle,
        invoiceKind,
        companyAddress,
        invoiceType,
        invoiceMobile,
        bankDeposit,
        taxpayerId,
        bankAccount,
        consignee,
        consigneeTel,
        consigneeAddress
      } = data
      this.invoiceMsg = {
        invoiceTitle,
        invoiceKind,
        companyAddress,
        invoiceType,
        invoiceMobile,
        bankDeposit,
        taxpayerId,
        bankAccount,
        consignee,
        consigneeTel,
        consigneeAddress
      }
    },
    calcMoney( items ) {
      let moneyCount = 0.0;
      items.forEach( item => {
        moneyCount += parseFloat( item.agreePrice )
      } )
      return moneyCount
    }
  },
  created() {
    this.loadData()
    this.emailMsgDs = this.$dataSet( emaillMsgConfig )
  }
}
</script>
<style lang="stylus" scoped></style>

