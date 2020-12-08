<template>
  <div id="aptitude-remind">
    <lc-title :text="activeTitle"></lc-title>
    <template v-if="!productList.length">暂无提醒</template>
    <template v-else>
      <lc-table :config="config" :data="productList" @cur-change="curChange" :page="page">
        <template slot-scope="scope">
          <template
            v-if="scope.con.prop == 'deliveryDate'"
          >{{formatMyDate(scope.row[scope.con.prop] && scope.row[scope.con.prop].time)}}</template>
          <template v-else-if="scope.con.prop == 'sn'">
            <router-link
              :to="`/order/detail/${scope.row[scope.con.prop]}`"
            >{{scope.row[scope.con.prop]}}</router-link>
          </template>
          <template v-else-if="scope.con.prop == 'skus'">
            <div class="sku-item" v-for="item in scope.row.skus" :key="item.lcSkuCode">
              <li>
                <span>名称：</span>
                <span>{{item.skuName}}</span>
              </li>
              <li>
                <span>编码：</span>
                <span>{{item.lcSkuCode}}</span>
              </li>
              <li>
                <span>缺货数量：</span>
                <span>{{item.number}}</span>
              </li>
            </div>
          </template>
          <template v-else-if="scope.con.prop == 'control'">
            <el-button
              size="small"
              v-if="!scope.row.note && !scope.row.initOperationNote"
              type="primary"
              @click="scope.row.initOperationNote = true"
            >添加备注</el-button>
            <div class="control" v-else>
              <el-input type="textarea" v-model="scope.row.operationNote"></el-input>
              <el-button
                size="small"
                v-if="!scope.row.operationNote"
                type="primary"
                @click="scope.row.initOperationNote = false"
              >取消</el-button>
              <el-button
                size="small"
                type="primary"
                @click="addNotes(scope.row.sn,scope.row.operationNote)"
              >保存</el-button>
            </div>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Inject, Component } from 'vue-property-decorator'
import lcTitle from "../../components/title.vue"
import API from '../../API'
import { State, Action } from 'vuex-class'
import lcTable from "../../components/table/index"
import messageRemind from './components/messageRemind.vue'

@Component( {
  name: 'nonPaymentRemind',
  components: {
    lcTitle,
    lcTable
  }
} )
export default class nonPaymentRemind extends messageRemind {
  @State( state => state.message.msgTotal ) msgTotal
  @Action( 'message/msgHandled' ) callBack

  @Inject() formatMyDate
  // 订单号、客户、缺货商品、预计到货日期
  config = [
    { prop: "sn", label: "订单号", width: '210px' },
    { prop: "memberName", label: "客户", width: '210px' },
    { prop: "skus", label: "缺货商品" },
    { prop: "deliveryDate", label: "预计到货日期", width: '210px' },
    { prop: "control", label: "操作" }
  ]

  type = 8

  activated () {
    this.$permissionValidateWithNotify( 758 )
    this.getData()
  }

  getData () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    this.$http( API.getMessageDetail, {
      type: this.type,
      start,
      num
    } ).then( ( { data } ) => {
      let myData = data.data || {}
      myData.list.map( v => {
        // v.operationNote = ''
        v.initOperationNote = false
        if ( v.operationNote ) {
          v.initOperationNote = true
        }
      } )
      this.productList = myData.list || []
      this.page.total = myData.total
    }, () => {
      this.productList = []
      this.page.total = 0
    } )
  }
  addNotes ( sn, operationNote ) {
    this.$http( API.updateOrderBasicInfo, { sn, operationNote } ).then( res => {
      this.$message( {
        type: 'success',
        message: '提交备注成功!'
      } )
      this.callBack( { id: sn, type: this.type } ).then( res => {
        this.productList = this.productList.filter( v => v.sn !== sn )
      } ).catch( res => {
        this.$notify( {
          type: 'error',
          message: '消息处理失败'
        } )
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.control
  display flex
  flex-direction row
.el-button
  margin-left 5px
.sku-item
  border-bottom 1px solid #999
  margin-bottom 5px
  padding-bottom 5px
  &:last-child
    border-bottom none
  li
    display flex
    span
      &:first-child
        white-space nowrap
        font-weight 700
</style>
