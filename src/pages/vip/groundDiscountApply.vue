<template>
  <div class="ground-discount-apply">
    <lc-title :text="title">
      <!-- <el-button style="float: right" type="primary" @click="showConfig">地推优惠配置</el-button> -->
    </lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="120px"></lc-condition>

    <lc-table
      :config="config"
      :data="myData"
      :height="600"
      :page="page"
      @cur-change="curChange"
      controllerName="discountApply"
    >
      <template slot-scope="{con,row}">
        <template v-if="con.prop.indexOf('Time')>-1">{{formatDate(row[con.prop])}}</template>
        <template v-else-if="con.prop=='orderSn'">
          <router-link :to="`/order/search?sn=${row[con.prop]}`">{{row[con.prop]}}</router-link>
        </template>
        <template
          v-else-if=" con.prop=='purchaseGrossRate'||con.prop=='orderGrossProfit'"
        >{{(row[con.prop]*100).toFixed(2)}}%</template>

        <template
          v-else-if=" ['amountBeforeDiscount','groundDiscount','amountBeforeDiscount','bottomGrossProfit','purchaseGrossProfit'].includes(con.prop)"
        >{{row[con.prop] | currency}}</template>
        <template
          v-else-if=" ['purchaseGrossRate','orderGrossProfit'].includes(con.prop)"
        >{{(row[con.prop]*100).toFixed(2)}}%</template>
        <template
          v-else-if=" ['orderType','auditStatus','sourceType','quoteStatus','goalStatus'].includes(con.prop)"
        >{{convertData(row[con.prop],con.prop)}}</template>
        <template v-else-if=" con.prop=='control'">
          <el-button size="small" type="primary" @click="viewDetail(row)" v-if="!requestType">查看详情</el-button>
          <el-button-group v-if=" row.auditStatus==0">
            <template v-if="requestType">
              <el-button
                type="primary"
                @click="confirmPassAudit(row)"
                v-if="$permissionValidate(568)"
              >通过</el-button>
              <el-button type="warning" @click="showDialog(row)" v-if="$permissionValidate(569)">打回</el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                @click="showDialog(row,1)"
                v-if="$permissionValidateWithEnv(1181,1177)"
              >通过</el-button>
              <el-button
                type="warning"
                @click="showDialog(row,2)"
                v-if="$permissionValidateWithEnv(1182,1178)"
              >打回</el-button>
            </template>
          </el-button-group>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
    <el-dialog
      title="地推优惠申请详情"
      v-model="detailDialogVisible"
      :before-close="detailDialogClose"
      class="detail-dialog"
    >
      <lc-table :config="detailConfig" :data="detailList" :hasPage="false">
        <template slot-scope="{con,row}">
          <template
            v-if="['price','singleDiscount','amountBeforeDiscount','purchaseGrossProfit','amountAfterDiscount','subtotal'].includes(con.prop)"
          >{{row[con.prop] | currency}}</template>
          <template v-else>{{row[con.prop] }}</template>
        </template>
      </lc-table>
    </el-dialog>

    <el-dialog :title="msg=dialogType===1?'申请通过':'申请驳回'" v-model="dialogVisible">
      <p>请备注{{msg}}理由</p>
      <br />
      <el-input v-model.trim="remark" type="textarea"></el-input>
      <span slot="footer">
        <el-button type="primary" @click="updateAuditStatus(curApply)">确定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTable from '../../components/table/'
import lcTableConfig from '../../components/table/control.vue'
// import groundDiscountConfigList from './groundDiscountConfigList.vue'
import { matchArrItem } from '../../utils/'
import { auditStatus, sourceTypes, orderTypes } from './const'

import API from '../../API'
@Component( {
  name: 'ground-discount-apply',
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig,
    // groundDiscountConfigList
  }
} )
export default class GroundDiscountApply extends Vue {
  requestType = 0
  title: string = '地推优惠申请'

  condition: any[] = [
    { value: undefined, key: 'orderSn', label: '订单编号', type: 'text' },
    { value: undefined, key: 'auditStatus', label: '审核状态', type: 'select', options: auditStatus },
    { value: undefined, key: 'applyUser', label: '申请人', type: 'text' },
    { value: undefined, key: 'sourceType', label: '来源', type: 'select', options: sourceTypes },
    { value: undefined, key: 'applyTime', label: '申请时间', type: 'daterange' },
    { value: undefined, key: 'orderType', label: '结算类型', type: 'select', options: orderTypes }
  ]
  @Inject() formatMyDate
  formatDate ( o ) {
    let time = o && o.time
    if ( time ) {
      return this.formatMyDate( new Date( time ) )
    }
  }
  dialogVisible = false
  curApply = null
  remark: string = ''
  dialogType = null
  showDialog ( item, dialogType ) {
    this.remark = ''
    this.curApply = item
    this.dialogVisible = true
    this.dialogType = dialogType
  }
  closeDialog () {
    this.curApply = null
    this.dialogVisible = false
    this.dialogType = null
  }
  confirmPassAudit ( item ) {
    this.dialogType = 1
    this.updateAuditStatus( item )
  }
  updateAuditStatus ( item ) {
    const auditStatus = this.dialogType || 2
    let o: any = {
      id: item.id,
      auditStatus
    }
    if ( !this.requestType || ( this.requestType == 1 && auditStatus == 1 ) ) {
      o.remark = this.remark
    }

    if ( !this.requestType && !o.remark && o.auditStatus !== 1 ) {
      return this.$notify( {
        type: 'error',
        message: '请输入理由！'
      } )
    }

    this.$http( API.discountApply, {
      ...o,
      requestType: this.requestType,
      broadcast: true
    } ).then( ( { data } ) => {
      item.auditStatus = auditStatus
      if ( o.remark ) {
        item.remark = o.remark
      }
      this.closeDialog()
      this.remark = ''
    } )
  }
  convertData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'auditStatus':
        arr = auditStatus
        break
      case 'sourceType':
        arr = sourceTypes
        break
      case 'orderType':
        arr = orderTypes
        break
      case 'quoteStatus':
        arr = [
          { id: 0, name: '异常' },
          { id: 1, name: '正常' },
        ]
        break
      case 'goal':
        arr = [
          { id: 0, name: '失效' },
          { id: 1, name: '生效' },
        ]
    }
    return matchArrItem( value, arr, 'id' ).name
  }
  computeCondition () {
    let { num, cur } = this.page
    let o: any = {}
    o.start = ( cur - 1 ) * num
    o.num = num
    this.condition.forEach( ( { value, key } ) => {
      if ( value !== undefined ) {
        o[ key ] = value
        if ( Array.isArray( value ) && !value[ 0 ] ) {
          delete o[ key ]
        }
        if ( key == 'tenant' ) {
          o.tenantId = value.id
          o.tenantName = value.name
          delete o.tenant
        }
      }
    } )
    if ( o.applyTime ) {
      let [ begin, end ] = o.applyTime
      o.applyTimeBegin = this.formatMyDate( begin )
      o.applyTimeEnd = this.formatMyDate( end, undefined, true )
      delete o.applyTime
    }
    return o
  }
  activated () {
    this.search()
  }
  search ( cur = 1 ) {
    if ( this.requestType ) {
      this.$permissionValidateWithNotify( 567 )
    } else {
      this.$permissionValidateWithNotifyEnv( 1180, 1176 )
    }

    this.page.cur = cur
    let o = this.computeCondition()
    this.$http( API.getDiscountApplyList, {
      ...o,
      requestType: this.requestType
    } ).then( ( { data } ) => {
      let { list, total } = data.data
      this.page.total = total || 0
      this.myData = list || []
    }, () => {
      this.page.total = 0
      this.myData = []
    } )
  }
  // 地推优惠申请列表新增字段 bottomGrossProfit：综合成本毛利额 purchaseGrossProfit：采购成本毛利额  purchaseGrossRate：采购成本毛利率

  get config () {
    let lcConfig = [
      { prop: 'orderSn', label: '订单编号', width: 210 },
      { prop: 'orderType', label: '结算类型', width: 100 },
      { prop: 'amountBeforeDiscount', label: '订单金额（优惠前）', width: 200 },
      { prop: 'groundDiscount', label: '优惠申请金额', width: 200 },
      { prop: 'amountAfterDiscount', label: '订单金额（优惠后）', width: 200 }
    ]
    if ( this.$permissionValidate( 487 ) ) {
      lcConfig = [
        ...lcConfig,
        { prop: 'orderGrossProfit', label: '订单综合成本毛利率', width: 200 },
        { prop: 'bottomGrossProfit', label: '订单综合成本毛利额', width: 200 },
        { prop: 'purchaseGrossRate', label: '订单采购成本毛利率', width: 200 },
        { prop: 'purchaseGrossProfit', label: '订单采购成本毛利额', width: 200 },
      ]
    }
    return [
      ...lcConfig,
      { prop: 'auditStatus', label: '状态', width: 100 },
      { prop: 'applyUser', label: '申请人', width: 250 },
      { prop: 'auditUser', label: '审核人', width: 250 },
      { prop: 'applyReasons', label: '申请原因', width: 200 },

      { prop: 'sourceType', label: '来源', width: 100 },
      { prop: 'remark', label: '审核备注', width: 210 },
      { prop: 'applyTime', label: '申请时间', width: 200 },
      { prop: 'auditTime', label: '审核时间', width: 200 },
      { prop: 'control', label: '操作', fixed: 'right', width: 250 }
    ]
  }
  myData: any[] = []
  page = {
    cur: 1,
    num: 20,
    total: 0
  }
  curChange ( cur ) {
    this.search( cur )
  }
  showConfig () {
    // this.showConfigDialog = true
    this.$router.push( '/vip/groundDiscountConfigList' )
  }
  detailAuditStatus: number = null
  detailList: any[] = []
  get detailConfig () {
    const config = [
      { prop: 'lcSkuCode', label: 'LC编码' },
      { prop: 'skuName', label: 'SKU名称' },
      { prop: 'specification', label: '规格' },
      { prop: 'unit', label: '单位' },
      { prop: 'price', label: '单价' },
      { prop: 'number', label: '数量' },
      { prop: 'singleDiscount', label: '单项优惠' },
      { prop: 'subtotalBeforeDiscount', label: '小计（优惠前）', status: 2 },
      { prop: 'groundDiscount', label: '优惠申请金额', status: 2 },
      { prop: 'subtotalAfterDiscount', label: '小计（优惠后）', status: 2 },
      { prop: 'subtotal', label: '小计', status: 1 }
      // status 1 -> 通过 2-> 非通过（审核中，已驳回，已取消）
    ]

    return config.filter( ( { status } ) => {
      return !status || ( this.detailAuditStatus == 1 ? status === 1 : status !== 1 )
    } )
  }
  detailDialogVisible = false
  viewDetail ( row ) {
    this.detailDialogVisible = true
    this.detailAuditStatus = row.auditStatus
    this.$http( API.getGroundDiscountDetail, {
      id: row.id
    } ).then( ( { data } ) => {
      this.detailList = data.list
    } )
  }
  detailDialogClose () {
    this.detailDialogVisible = false
    setTimeout( () => {
      this.detailAuditStatus = null
      this.detailList = []
    }, 500 )
  }
}
</script>
<style>
.detail-dialog .el-dialog {
  width: 1000px;
}
</style>
