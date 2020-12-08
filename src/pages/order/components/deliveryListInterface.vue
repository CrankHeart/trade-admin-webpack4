<template>
  <el-dialog
    title="新建发货单"
    :visible="value"
    class="delivery-list"
    :before-close="handleClose"
    size="large"
  >
    <lc-table :config="config" :data="mergeSkuNumToDelivery" :has-page="false">
      <template slot-scope="scope">
        <template v-if="['skuNum'].indexOf(scope.con.prop)>-1">
          <el-input v-model="scope.row[scope.con.prop]" size="mini"></el-input>
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
  @Prop( { type: Boolean } )
  value
  @Prop( { type: Array } )
  memberOrderItem
  @Prop( { type: String } )
  orderSn
  @Inject() formatMyDate
  @Inject() app

  config: any = [
    { prop: 'skuName', label: '商品名称', width: '210px' },
    { prop: 'specification', label: '规格', width: '110px' },
    { prop: 'lcSkuCode', label: 'lcCode', width: '210px' },
    { prop: 'code', label: '自有编码', width: '210px' },
    // { prop: 'totalNum', label: '数量', width: '110px' },
    { prop: 'unit', label: '单位', width: '100px' },
    { prop: 'toDistributeNum', label: '未发数量', width: '110px' },
    { prop: 'avaliableStock', label: '当前可用库存', width: '150px' },
    { prop: 'skuNum', label: '发货数量', width: '210px' }
  ]
  get mergeSkuNumToDelivery () {
    return this.memberOrderItem.map( item => {
      return {
        ...item,
        ...{
          skuNum: item.avaliableStock >= item.toDistributeNum ? item.toDistributeNum : item.avaliableStock
        }
      }
    } )
  }
  handleClose () {
    this.$emit( 'input', false )
  }
  confirmDelivery () {
    let { orderSn } = ( this as any )
    let a = []
    // if ( this.mergeSkuNumToDelivery.some( v => !v.skuNum ) ) {
    //   this.$notify( {
    //     type: "warning",
    //     message: "请填写发货数量"
    //   } )
    //   return false
    // }
    // if(this.mergeSkuNumToDelivery.some( v => !+v.skuNum )){
    //   this.$notify( {
    //     type: "warning",
    //     message: "发货数量必须大于0"
    //   } )
    //   return false
    // }
    this.mergeSkuNumToDelivery.forEach( v => {
      if ( v.skuNum ) {
        a.push( {
          skuId: v.skuId,
          skuType: v.skuType,
          skuNum: +v.skuNum
        } )
      }
    } )
    let option = {
      orderSn,
      skuInfo: a
    }
    this.$http( API.addDeliveryOrderManual, option ).then( () => {
      this.$notify( {
        type: "success",
        message: "新建发货单成功"
      } )
      this.$emit( 'change-delivery-state', true )
      this.$emit( 'input', false )

      // 刷新顶层组件的所有数据
      this.app.refreshAll();
    }, rej => {
      // this.$emit( 'input', false )
      this.$notify( {
        type: "warning",
        message: rej.data.msg || '新建失败'
      } )
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

