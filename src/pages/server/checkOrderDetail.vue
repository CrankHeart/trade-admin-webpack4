
<template>
  <div id="check-order-detail">
    <lc-title text="核对订单详情"></lc-title>
    <el-col :lg="16" :sm="24" :xs="24">
      <div class="detail-info-desc">
        <span>客户ID: {{accountCheckDetail.tenantId}}</span>
        <span>集团名称: {{accountCheckDetail.tenantName}}</span>
      </div>
      <div class="detail-info-desc">
        <span>订单号: {{orderSn}}</span>
        <span>订单金额: {{accountCheckDetail.memberOrder && accountCheckDetail.memberOrder.orderAmountString}}</span>
      </div>
      <div class="detail-info-desc">
        <span>服务单数: {{accountCheckDetail.serviceOrderList && accountCheckDetail.serviceOrderList.length}}个</span>
        <span>服务单汇总金额: {{accountCheckDetail.serviceOrderAmounts || 0}}</span>
      </div>
      <lc-table
        :data="accountCheckDetail.serviceOrderList"
        :config="serverConfig"
        :hasPage="false"
        :key="serverConfig.length"
      >
        <template slot-scope="scope">
          <template
            v-if="scope.con.prop == 'refundAmount'"
          >{{Number(scope.row[scope.con.prop]).toFixed(2)}}</template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>

      <h3>银行流水号列表</h3>
      <lc-table
        :data="renderBankStatementData"
        :config="bankStatementConfig"
        :hasPage="false"
        :key="bankStatementConfig.length"
      >
        <template slot-scope="scope">
          <template v-if="scope.row.control == true">
            <template v-if="scope.con.prop=='control'">
              <el-button type="text" @click="addDataItem" v-if="$permissionValidate(594)">新增</el-button>
            </template>
          </template>
          <template v-else>
            <template v-if="scope.con.prop=='control'">
              <el-button type="text" @click="deleteData(scope.row)" v-if="scope.row.disabled">删除</el-button>
              <template v-else>
                <el-button type="text" @click="saveData(scope.row)">保存</el-button>
                <el-button
                  type="text"
                  v-if="!scope.row['bankSn']"
                  @click="bankSnData.splice(scope.row.index,1)"
                >取消</el-button>
              </template>
            </template>
            <template v-else-if="scope.con.prop=='bankSn'">
              <el-input :disabled="scope.row.disabled" v-model="scope.row[scope.con.prop]"></el-input>
            </template>
            <template v-else-if="scope.con.prop=='index'">{{scope.row[scope.con.prop] + 1}}</template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
        </template>
      </lc-table>
    </el-col>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject } from "vue-property-decorator"
import lcTitle from "../../components/title.vue"
import lcTable from '../../components/table/index'
import { State, Action } from 'vuex-class'
import API from "../../API"
@Component( {
  name: "check-order-detail",
  components: {
    lcTitle,
    lcTable
  }
} )
export default class CheckOrderDetail extends Vue {
  @State( state => state.server.accountCheckingList ) accountCheckingList
  @Action( 'server/getAccountCheckingList' ) getAccountCheckingList
  @Action( 'server/saveBankSnBatch' ) saveBankSnBatch
  get accountCheckDetail () {
    return this.accountCheckingList[ 0 ] || {}
  }
  get orderSn () {
    return this.$route.params.orderSn
  }
  get serverConfig () {
    let l = [
      { prop: 'serviceSn', label: '服务单号', width: '300' },
      { prop: 'refundAmount', label: '服务单金额' }
    ]
    return l
  }
  serverData: any = []
  get bankStatementConfig () {
    let l = [
      { prop: 'index', label: '序号', width: '100' },
      { prop: 'bankSn', label: '银行流水号' },
      { prop: 'control', label: '操作', width: '150' }
    ]
    return l
  }
  bankSnData: any = []
  get renderBankStatementData () {
    return this.bankSnData.concat( { control: true } )
  }
  addDataItem () {
    let l = Math.max.apply( null, this.bankSnData.map( v => +v.index ).concat( -1 ) ) + 1
    this.bankSnData.push( {
      index: l,
      bankSn: '',
      disabled: false,
      accountCheckSn: this.accountCheckDetail.accountCheckSn,
      orderSn: this.accountCheckDetail.orderSn
    } )
  }
  serverStatementData: boolean = false
  deleteData ( v ) {
    let accountCheckSubId = v.id
    this.$http( API.delBankSn, { accountCheckSubId } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: `${data.msg}`
      } )
      this.bankSnData.splice( this.bankSnData.indexOf( v ), 1 )
    } )
  }
  saveData ( v ) {
    if ( !v.bankSn ) return
    let { accountCheckSn, orderSn, bankSn } = v
    let params = [ { accountCheckSn, orderSn, bankSn } ]
    this.saveBankSnBatch( params ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: `${data.msg}`
      } )
    } )
    v.disabled = true
  }
  activated () {
    this.$permissionValidateWithNotify( [ 777, 472 ] )
    // if(!this.accountCheckingList.length){
    this.getAccountCheckingList( { orderSn: this.orderSn } ).then( res => {
      this.bankSnData = res.list[ 0 ].accountCheckingSubList.map( ( v, i ) => ( { ...v, index: i, disabled: true } ) )
    } )
    // }else{
    //   this.bankSnData = this.accountCheckDetail.accountCheckingSubList.map((v,i)=>({...v,index:i,disabled:true}))
    // }
  }
}
</script>
<style lang="stylus" scoped>
.table-with-page
  margin 10px 20px
.detail-info-desc
  padding 5px
  font-size 14px
  span
    &:last-child
      margin-left 20px
</style>

