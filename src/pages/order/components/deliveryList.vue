<template>
  <el-dialog
    title="新建发货单"
    :visible="value"
    class="delivery-list"
    :before-close="handleClose"
    size="large"
  >
    <el-row class="logistic-info">
      <el-col :span="8">
        <el-select
          ref="selectCompanyId"
          v-model="companyId"
          placeholder="请选择物流公司"
          @visible-change="visibleChange"
          filterable
        >
          <el-option v-for="logc in allLogistic" :label="logc.name" :value="logc.id" :key="logc.id"></el-option>
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-input placeholder="请输入运单号" v-model.trim="logisticNo"></el-input>
      </el-col>
    </el-row>
    <lc-table :config="config" :data="mergeSkuNumToDelivery" :has-page="false">
      <template slot-scope="scope">
        <template v-if="['skuNum','lotNumber'].indexOf(scope.con.prop)>-1">
          <el-input v-model="scope.row[scope.con.prop]" size="mini"></el-input>
        </template>
        <template v-else-if="scope.con.prop == 'expirationDate'">
          <el-date-picker v-model="scope.row['expirationDate']" type="date" placeholder="选择日期"></el-date-picker>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <el-button type="primary" class="pull-right confirm-btn" @click="confirmDelivery">确定</el-button>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from "vue-property-decorator"
import API from "../../../API"
import { State, Action, Getter, Mutation } from "vuex-class"
import lcTable from '../../../components/table/'
@Component( {
  name: 'delivery-list',
  components: {
    lcTable
  }
} )
export default class deliveryList extends Vue {
  @Getter( 'logistic/allLogistic' ) allLogistic
  @Action( 'logistic/getAllLogistic' ) getAllLogistic
  @Prop( { type: Boolean } )
  value
  @Prop( { type: Array } )
  memberOrderItem
  @Prop( { type: String } )
  orderSn
  @Inject() formatMyDate
  companyId: any = ''
  companyName: any = ''
  logisticNo: any = ''
  config: any = [
    { prop: 'skuName', label: '商品名称', width: '210px' },
    { prop: 'specification', label: '规格', width: '110px' },
    { prop: 'lcSkuCode', label: 'lcCode', width: '210px' },
    { prop: 'toDistributeNum', label: '未发数量', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'code', label: '自有编码', width: '210px' },
    { prop: 'skuNum', label: '发货数量', width: '210px' },
    { prop: 'lotNumber', label: '生产批号', width: '180px' },
    { prop: 'expirationDate', label: '失效日期', width: '180px' }
  ]
  get mergeSkuNumToDelivery () {
    return this.memberOrderItem.map( item => {
      return {
        ...item,
        ...{
          skuNum: item.toDistributeNum
        }
      }
    } )
  }
  handleClose () {
    this.$emit( 'input', false )
  }
  confirmDelivery () {
    let { companyId, companyName, logisticNo, orderSn } = ( this as any )
    if ( !companyId || !logisticNo ) {
      this.$notify( {
        type: "warning",
        message: "请选择物流公司和填写运单号"
      } )
      return false
    }
    let a = []
    // if ( this.mergeSkuNumToDelivery.some( v => !v.skuNum ) ) {
    //   this.$notify( {
    //     type: "warning",
    //     message: "请填写发货数量"
    //   } )
    //   return false
    // }
    // if ( this.mergeSkuNumToDelivery.some( v => !+v.skuNum ) ) {
    //   this.$notify( {
    //     type: "warning",
    //     message: "发货数量必须大于0"
    //   } )
    //   return false
    // }
    this.mergeSkuNumToDelivery.forEach( v => {
      if ( v.skuNum ) {
        a.push( {
          expirationDate: this.formatMyDate( v.expirationDate, 'yyyy-MM-dd hh:mm:ss', true ),
          skuId: v.skuId,
          skuNum: v.skuNum,
          lotNumber: v.lotNumber
        } )
      }
    } )
    let option = {
      companyId,
      logisticNo,
      orderSn,
      skuDetail: a
    }
    this.$http( API.newShippingInfo, option ).then( ( { data } ) => {
      this.$notify( {
        type: "success",
        message: "新建发货单成功"
      } )
      this.$emit( 'change-delivery-state', true )
      this.$emit( 'input', false )
    }, rej => {
      this.$notify( {
        type: "warning",
        message: rej.data.msg || '新建失败'
      } )
    } )

  }

  visibleChange ( v ) {
    if ( !v ) {
      this.companyName = this.$refs[ 'selectCompanyId' ][ 'selectedLabel' ]
    }
  }
  created () {
    this.getAllLogistic()
  }
  destroyed () {
    this.memberOrderItem.forEach( v => {
      v.expirationDate = ''
      v.lotNumber = ''
    } )
  }

}
</script>
<style lang="stylus">
.delivery-list
  .logistic-info
    margin-bottom 20px
  .confirm-btn
    margin 15px
</style>

