<template>
  <div id="aptitude-remind">
    <lc-title text="限时未付款提醒"></lc-title>
    <!-- <el-tabs v-model="activeName" @tab-click="handleClick" v-if="tabs.length">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.prop" :key="item.prop"></el-tab-pane>
    </el-tabs>-->

    <template v-if="!productList.length && hasInited">暂无提醒</template>
    <template v-else>
      <lc-table :config="config" :data="productList" @cur-change="curChange" :page="page">
        <template slot-scope="scope">
          <template
            v-if="scope.con.prop == 'createDate'"
          >{{formatMyDate(scope.row[scope.con.prop] && scope.row[scope.con.prop].time)}}</template>
          <template v-else-if="scope.con.prop == 'sn'">
            <router-link
              :to="`/order/detail/${scope.row[scope.con.prop]}?type=6`"
            >{{scope.row[scope.con.prop]}}</router-link>
          </template>
          <template v-else-if="scope.con.prop == 'control'">
            <el-button
              size="small"
              v-if="!scope.row.operationNote && !scope.row.initOperationNote"
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
  config = [
    { prop: "createDate", label: "下单时间", width: '180px' },
    { prop: "sn", label: "订单号", width: '210px' },
    { prop: "addressDetail", label: "收件人信息" },
    { prop: "control", label: "操作" }
  ]

  type = 6
  activated () {
    this.$permissionValidateWithNotify( 432 )
    this.getData()
  }

  getData () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    this.$http( API.getMessageDetail, {
      type: 6,
      start,
      num
    } ).then( ( { data } ) => {
      this.hasInited = true
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
      this.hasInited = true
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
</style>
