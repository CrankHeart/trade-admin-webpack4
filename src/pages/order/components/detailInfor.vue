<template>
  <el-row class="order-detail-info">
    <el-col :md="12">
      <el-card>
        <el-row>
          <el-col :span="12" class="flex-wrap">
            <span>订单号：</span>
            <p class="content">{{data.sn}}</p>
          </el-col>
          <el-col :span="12" class="flex-wrap">
            <span>下单时间：</span>
            <p class="content">{{formatMyDate( data.createDate&&data.createDate.time) }}</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <span>客户名称：</span>
            <el-tooltip placement="bottom" effect="light">
              <div slot="content" class="tooltip-content">
                <p>CustomerId：{{usersCustomerOffice.customerId}}</p>
                <p>SaaS Code：{{usersCustomerOffice.saasCode}}</p>
                <p>OfficeId：{{usersCustomerOffice.officeId}}</p>
                <br />
                <el-button type="text" @click="toUserCustomerDetails">点击前往客户详情 -></el-button>
              </div>
              <el-button type="text">{{ data.customerName }}</el-button>
            </el-tooltip>
          </el-col>
          <el-col :span="12" class="flex-wrap">
            <span>下单人：</span>
            <p class="content">{{ data.customerOrder }}({{formatCustomerIdentitys(data.customerIdentity)}})</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="flex-wrap">
            <span>收货信息：</span>
            <p class="content">{{data.addressDetail&&data.addressDetail.split(';').join(' ')}}</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="flex-wrap">
            <span>客户备注：</span>
            <p class="content">
              <b>{{ data.registerInvoiceRemark }}</b>
              <span v-if="data.remark">,{{data.remark}}</span>
            </p>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="flex-wrap">
            <span>客服备注：</span>
            <template v-if="!isOperationNoteEdit">
              <p class="content">
                {{ data.operationNote }} &nbsp;
                <span
                  class="pramary span-button"
                  @click="editOperationNote"
                  v-if="$permissionValidate(543)"
                >编辑</span>
              </p>
            </template>
            <template v-else>
              <p class="content">
                <el-input style="width: 180px;" v-model.trim="operationNote" placeholder="请输入内容"></el-input>
                <span
                  class="pramary span-button"
                  @click="saveOperationNote(operationNote)"
                  v-if="$permissionValidate(550)"
                >保存</span>
                <span class="pramary span-button" @click="isOperationNoteEdit=false">取消</span>
              </p>
            </template>
          </el-col>
        </el-row>
        <!-- <p>
          <span>订单号：</span>{{data.sn}}</p>
        <p>
          <span>下单时间：</span>{{formatMyDate( data.createDate&&data.createDate.time) }}</p>
        <p>
          <span>注册证：</span>{{data.isRegister==0 ? '不需要':'需要'}}</p>
        <p>
          <span>经销商：</span>{{data.storeName}}</p>
        <p>
          <span>收货人信息：</span> {{data.addressDetail&&data.addressDetail.split(';').join(' ')}} </p>
        <p>
          <span>用户名：</span> 
          <template v-if="data.tenantId == 'mall'">
             {{data.customerId }} ({{data.memberName}})
          </template> 
          <template v-else>
            {{data.customerId || data.member}} ({{data.memberName}})({{data.saasCode}})
          </template>
          </p>
        <p>
        <span>支付方式：</span>{{ formatPayment() }}</p>-->
      </el-card>
    </el-col>
    <el-col :md="12" style="min-height:120px">
      <el-steps :space="150" :active="active" align-center center>
        <el-step v-for="(item,index) in steps" :title="item.title" :description="item.desc" :key="index"></el-step>
      </el-steps>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import API from "../../../API"
import { matchArrItem } from '../../../utils'
import { paymentMethods, customerIdentitys } from '../const/orderSearchCondition'
@Component( {
  name: 'orde-detail-info',
  components: {
  }
} )
export default class OrderDetailInfo extends Vue {
  @Inject() formatMyDate
  @Prop( { default: {} } )
  data: any
  @Prop( { default: {} } )
  usersCustomerOffice: any

  isOperationNoteEdit: boolean = false

  get memberOrderData () {
    return this.data || {}
  }

  get operationNote () {
    return this.memberOrderData.operationNote
  }

  set operationNote ( value ) {
    this.memberOrderData.operationNote = value
  }

  get steps () {
    let arr = []
    let l
    let data = this.data
    data.paymentDate = data.payment && data.payment.firstPhaseDate
    'createDate,paymentDate,sendDate,completeDate'.split( ',' ).forEach( ( v, i ) => {
      let o = {}
      if ( data[ v ] ) {
        l = i
        o = {
          title: this.stepTitle[ i ],
          desc: this.formatMyDate( data[ v ].time )
        }
      }
      arr.push( o )
    } )
    this.active = l + 1
    return arr
  }

  stepTitle: string[] = [ '已下单待付款', '已付款待发货', '已发货待完成', '已完成', '已取消' ]
  active: number = 0
  formatPayment () {
    let paymentMethodList = this.data.payment && this.data.payment.paymentMethodList || []
    if ( !paymentMethodList.length ) {
      return ''
    }
    const methods = paymentMethods.filter( v => paymentMethodList.includes( v.id ) ).map( v => v.name )
    return methods.join( ' ; ' )
  }

  formatCustomerIdentitys ( statu ) {
    return matchArrItem( +statu, customerIdentitys, 'id' ).name
  }

  toUserCustomerDetails () {
    const { id, tenantId, officeId } = this.usersCustomerOffice
    this.$router.push( `/vip/portrait/detail/${id}?tenant_id=${tenantId}&office_id=${officeId}` )
  }

  editOperationNote () {
    this.isOperationNoteEdit = true;
    this.operationNote = this.data.operationNote
  }

  saveOperationNote ( data ) {
    this.$http( API.saveExtraInfo, {
      operationNote: this.operationNote,
      orderSn: this.$route.params.sn,
    } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '保存成功'
      } )
      this.isOperationNoteEdit = false;
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: data.msg || '保存失败'
      } )
      this.isOperationNoteEdit = false;
    } )
  }
}
</script>
<style lang="stylus">
.tooltip-content
  font-size 14px
  line-height 1.5
.order-detail-info
  .el-col
    margin-bottom 15px
  .el-steps
    overflow hidden
  .el-steps +.el-button
    position absolute
    right 0
    bottom 0
  .el-step
    min-width 180px
    margin-bottom 30px
  .el-button
    font-size 16px
    padding 0
  // .el-card
  // line-height 30px
  // p
  // margin-right 30px
  // span
  // font-weight bold
  // margin-right 10px
  .flex-wrap
    display flex
    justify-content center
    align-items flex-start
    .content
      flex 1
      word-break break-all
      .span-button
        cursor pointer
</style>
