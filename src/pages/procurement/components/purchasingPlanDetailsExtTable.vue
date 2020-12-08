<template>
  <div class="purchasing-plan-details-unstarted-table">
    <el-button
      type="primary"
      @click="confirmCreate"
      v-if="$permissionValidateWithEnv(1166,1163)"
      class="pull-right"
    >确认新建</el-button>
    <el-button
      type="primary"
      @click="exportSupplySku"
      v-if="$permissionValidateWithEnv(1166,1163)"
      class="pull-right"
      :disabled="canExport"
    >导出到Excel</el-button>
    <lc-table
      ref="skuTable"
      class="table-margin"
      :hasPage="false"
      :config="baseConfig"
      :data="tableList"
    >
      <template slot-scope="scope">
        <template>
          <template v-if="scope.con.prop=='control'">
            <div v-if="$permissionValidateWithEnv(1167,1164)">
              <template v-if="scope.row.isEdit">
                <span class="pramary pointer" @click="saveEditorData(scope.row)">保存</span>
                <span class="pramary pointer" @click="scope.row.isEdit = false">取消</span>
              </template>
              <span v-else class="pramary pointer" @click="scope.row.isEdit = true">编辑</span>
            </div>
          </template>
          <template v-else-if="scope.con.prop=='deliveryDate'">
            <template v-if="!!scope.row[scope.con.prop] && scope.row.isEdit">
              <el-date-picker
                style="width: 150px;"
                v-model="scope.row[scope.con.prop].time"
                type="date"
                placeholder="选择日期"
              ></el-date-picker>
            </template>
            <template
              v-else-if="!!scope.row[scope.con.prop] && !scope.row.isEdit"
            >{{formatMyDate( scope.row[scope.con.prop].time, 'yyyy-MM-dd' )}}</template>
          </template>
          <template v-else-if="scope.con.prop=='purchaseNum'">
            <template v-if="scope.row.isEdit">
              <el-input v-model="scope.row[scope.con.prop]" placeholder="请输入内容"></el-input>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
          <!-- <template v-else-if="scope.con.prop=='buyerId'">
            <template v-if="scope.row.isEdit">
              <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择">
                <el-option
                  v-for="item in scope.row['buyerList']"
                  :key="item.id"
                  :label="item.loginName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </template>
            <template v-else>{{getBuyerName(scope.row[scope.con.prop], scope.row['buyerList'])}}</template>
          </template>-->

          <template v-else-if="scope.con.prop=='currDeliveryDetails'">
            <span class="pramary pointer" @click="showRiskStatus( scope.row )">查看详情</span>
          </template>
          <template v-else-if="scope.con.prop=='goodLabel'">{{scope.row[scope.con.prop] ? '否':'是'}}</template>

          <!-- <template v-else-if="scope.con.prop=='buyerId'">
            <template v-if="scope.row.isEdit">
              <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择">
                <el-option
                  v-for="item in scope.row['buyerList']"
                  :key="item.id"
                  :label="item.loginName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </template>
            <template v-else>{{getBuyerName(scope.row[scope.con.prop], scope.row['buyerList'])}}</template>
          </template>-->
          <template v-else-if="scope.con.prop=='taskGapNum'">
            <span v-if="parseInt(scope.row['taskGapNum'])<0">0</span>
            <span v-else>{{scope.row['taskGapNum']}}</span>
          </template>
          <template v-else-if="scope.con.prop=='taskYingYu'">
            <span v-if="parseInt(scope.row['taskGapNum'])>=0">0</span>
            <span v-else>{{scope.row['taskGapNum']*-1}}</span>
          </template>

          <template v-else-if="scope.con.prop=='changeReasons'">
            <template v-if="scope.row.isEdit">
              <el-input v-model="scope.row[scope.con.prop]" placeholder="请输入变更原因"></el-input>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>

          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </template>
    </lc-table>
    <risk-status
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></risk-status>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcCondition from '../../../components/condition.vue'
import lcTable from '../../../components/table'
import riskStatus from './riskStatus.vue'
import API from '../../../API'
import { matchArrItem, isNotEmptyObj } from '../../../utils'
import { orderSkuExtTableConfig } from '../const'

@Component( {
  name: 'purchasing-plan-details-ext-table',
  components: {
    lcCondition,
    lcTable,
    riskStatus
  }
} )
export default class purchasingPlanDetailsExtTable extends Vue {
  @Inject() formatMyDate
  @Prop( { default: '' } )
  skuIds: string

  @State( state => state.procurement.buyingRequirementSkuList ) buyingRequirementSkuList
  @State( state => state.login.token ) accessToken
  @Mutation( 'procurement/editBuyingRequirementSkuList' ) editBuyingRequirementSkuList
  @Mutation( 'procurement/clearBuyingRequirementkuList' ) clearBuyingRequirementkuList
  isNotEmptyObj = isNotEmptyObj
  tableList: any[] = []

  skuIdStr = ''
  get baseConfig () {
    let conf = orderSkuExtTableConfig || []
    return conf
  }

  visibleRiskStatus: boolean = false
  currRiskLevleSkuId: string = ''
  currRiskLevelLcSkuCode: string = ''

  get canExport () {
    return this.skuIdStr == ''
  }

  checkLists ( lists ) {
    let ret = [];
    ret[ 'code' ] = true;
    if ( lists.length == 0 ) {
      ret[ 'code' ] = false;
      ret[ 'msg' ] = '暂无记录,无法提交';
    }
    // 检测purchaseNum 如果小于等于0,提示
    for ( let i = 0; i < lists.length; i++ ) {
      if ( parseInt( lists[ i ].purchaseNum ) <= 0 ) {
        ret[ 'code' ] = false;
        ret[ 'msg' ] = 'LC编码:' + lists[ i ].lcSkuCode + '采购数量不能小于0';
        break
      }
    }
    return ret;
  }

  getTaskMetas () {
    return this.tableList.map( val => {
      return {
        skuId: val.skuId,
        buyerId: val.buyerId,
        lcSkuCode: val.lcSkuCode,
        taskGapNum: val.taskGapNum,
        recommendNum: val.recommendNum,
        recommendPurchaseNum: val.recommendNum,
        changeReasons: val.changeReasons,
        calculateNum: val.calculateNum,
        purchaseNum: val.purchaseNum,
        deliveryDate: this.formatMyDate( val.deliveryDate.time, 'yyyy-MM-dd' )
      }
    } )
  }

  confirmCreate () {
    let lists = this.getTaskMetas();
    let checkRet = this.checkLists( lists )
    if ( !checkRet[ 'code' ] ) {
      this.$notify( {
        type: 'error',
        message: checkRet[ 'msg' ]
      } )
      return;
    }
    this.$http( API.addOutPlanTask, {
      taskMetas: lists,
    } ).then( res => {
      this.$message( {
        message: '新增成功,执行计划有延迟,请稍后再在进行中计划查看!',
        type: 'success',
        duration: 5000
      } )
      this.clearBuyingRequirementkuList()
      this.tableList = []
      this.$router.push( '/procurement/buyingRequirement' )
    } ).catch( err => {
      this.$notify( {
        type: 'error',
        message: err.data.msg || '修改错误'
      } )
    } )
  }

  formatOptions () {
    return {}
  }

  getTableList: any[] = []
  search () {
    if ( this.skuIdStr == '' ) {
      return
    }
    this.$http( API.getPurchaseRequires, { purchasePlanId: -1, skuIds: this.skuIdStr } ).then( ( { data } ) => {
      this.getTableList = data.data
      this.tableList = []
      // *直接执行下面的$set可能导致tableList有内容为空而报错
      this.getTableList.forEach( item => {
        this.tableList.push( [] )
      } )
      this.getTableList.forEach( async ( v, i ) => {
        // let item = await this.dealTableBuyerData( v, i )
        // *防止异步导致的排序问题
        // 这里注入默认的参数
        let item = { ...v, isEdit: false }
        item.recommendNum = item.recommendNum > 0 ? item.recommendNum : 0
        item.purchaseNum = item.recommendNum
        item.changeReasons = ''
        this.$set( this.tableList, i, item )
      } )
    } ).catch( rej => {
      this.tableList = []
    } )
  }
  getBuyerName ( id, buyerList ) {
    let item = !!buyerList && buyerList.find( v => v.id == id )
    return !!item ? item.loginName : ''
  }
  async dealTableBuyerData ( v, i ) {
    let { data } = await this.$http( API.getUserByBrandId, { brandIds: [ v.brandId ] } )
    return {
      ...v,
      isEdit: false,
      buyerList: data.data
    }
  }

  showRiskStatus ( row ) {
    this.currRiskLevleSkuId = row.skuId + ''
    this.currRiskLevelLcSkuCode = row.lcSkuCode
    this.visibleRiskStatus = true
  }
  validateItemInfo ( item ) {
    if ( typeof item.purchaseNum === "string" && item.purchaseNum.trim() == '' ) {
      this.$notify( {
        type: 'warning',
        message: '请输入计划采购数'
      } )
      return false
    }
    if ( !item.deliveryDate.time ) {
      this.$notify( {
        type: 'warning',
        message: '请选择交付日期'
      } )
      return false
    }
    // 推荐跟实际不一样要写原因
    if ( item.purchaseNum != item.recommendNum && item.changeReasons == '' ) {
      this.$notify( {
        type: 'warning',
        message: '请输入变更原因'
      } )
      return false
    }
    if ( item.buyerId == '' ) {
      this.$notify( {
        type: 'warning',
        message: '请选择买手'
      } )
      return false
    }
    return true
  }
  saveEditorData ( item ) {
    if ( !this.validateItemInfo( item ) ) {
      return
    }
    item.isEdit = false
    let { skuId, deliveryDate, buyerId, purchaseNum, taskGapNum, calculateNum, recommendNum, lcSkuCode, changeReasons } = item
    this.editBuyingRequirementSkuList( {
      skuId,
      buyerId,
      lcSkuCode,
      taskGapNum,
      recommendNum,
      // recommendPurchaseNum: recommendPurchaseNum,
      changeReasons,
      calculateNum,
      purchaseNum: +purchaseNum,
      deliveryDate: this.formatMyDate( deliveryDate.time, 'yyyy-MM-dd' )
    } );
  }
  activated () {
    let skuIds = this.buyingRequirementSkuList.map( val => {
      return val.skuId
    } );
    this.skuIdStr = skuIds.join( ',' )
    this.search()
  }

  deactivated () {
    this.clearBuyingRequirementkuList()
  }

  beforeDestroy () {
    this.clearBuyingRequirementkuList()
  }

  exportSupplySku () {
    this.$submit( API.exportPurchaseTask2, {
      purchasePlanId: -1, skuIds: this.skuIdStr,
      accessToken: this.accessToken
    } )
  }
}
</script>
<style lang='stylus' rel="stylesheet/stylus" scoped>
.flex
  display flex
  justify-content center
  align-items center
.purchasing-plan-details-ongoing
  .ongoing-panel-content
    @extend .flex
    justify-content flex-start
  .ongoing-panel-details
    padding-left 20px
.ongoing-panel-purchases-number
  @extend .flex
  .purchases-number
    margin-right 10px
</style>


