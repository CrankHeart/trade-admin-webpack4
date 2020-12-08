<template>
  <div id="user-portrait-detail">
    <lc-title :text="`${myData && myData.name || ''} - 用户画像详情`"></lc-title>
    <template v-if="myData">
      <el-row :gutter="20" style="margin-bottom:20px;">
        <el-col :span="9" v-if="$permissionValidate(672)">
          <div class="box">
            <!-- <el-tabs v-model="componentName" >allUserInfoTabs
              <el-tab-pane label="基础信息" name="portraitDetailInfo"></el-tab-pane>
              <el-tab-pane label="会员权益" name="portraitDetailMember"></el-tab-pane>
              <el-tab-pane label="客户喜好" name="portraitDetailLike"></el-tab-pane>
            </el-tabs>-->
            <el-tabs v-model="componentName">
              <el-tab-pane
                v-for="key in Object.keys( allUserInfoTabs )"
                :key="key"
                :label="allUserInfoTabs[key]"
                :name="key"
              ></el-tab-pane>
            </el-tabs>
            <component
              :is="componentName"
              :item="myData"
              :is-edit="isEdit"
              v-if="componentName !== 'portraitDetailMember'"
            >
              <template v-if="$permissionValidate(482)">
                <el-button-group class="pull-right">
                  <el-button
                    icon="circle-cross"
                    size="small"
                    @click="toggleEditStatus(false)"
                    v-if="isEdit"
                  >撤销</el-button>
                  <el-button
                    :icon="isEdit?'circle-check':'edit'"
                    type="primary"
                    size="small"
                    @click="toggleEditStatus(true)"
                  >{{isEdit?'保存':'编辑'}}</el-button>
                </el-button-group>
              </template>
            </component>
            <keep-alive>
              <PortraitDetailMember
                ref="portrait-detail-member"
                :priceLevel="myData.priceLevel"
                v-show="componentName === 'portraitDetailMember'"
                :is-edit="isEdit"
              >
                <template v-if="$permissionValidate(482)">
                  <el-button-group class="pull-right">
                    <el-button
                      icon="circle-cross"
                      size="small"
                      @click="toggleEditStatus(false)"
                      v-if="isEdit"
                    >撤销</el-button>
                    <el-button
                      :icon="isEdit?'circle-check':'edit'"
                      type="primary"
                      size="small"
                      @click="toggleEditStatus(true)"
                    >{{isEdit?'保存':'编辑'}}</el-button>
                  </el-button-group>
                </template>
              </PortraitDetailMember>
            </keep-alive>
          </div>
        </el-col>
        <el-col :span="15" v-if="$permissionValidate(560)">
          <!-- <div class="box"> -->
          <PortraitDetailMap :item="myData"></PortraitDetailMap>
          <!-- </div> -->
        </el-col>
      </el-row>
      <PortraitDetailTable :tenant="myData"></PortraitDetailTable>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'

import lcTitle from "../../components/title.vue"
// tabs:基础信息/会员权益/会员权益
// 基础信息
import portraitDetailInfo from './components/portraitDetailInfo.vue'
// 会员权益
import PortraitDetailMember from './components/portraitDetailMember.vue'
// 客户喜好
import portraitDetailLike from './components/portraitDetailLike.vue'
// import portraitDetailSalesManage from './components/portraitDetailSalesManage.vue'
import PortraitDetailMap from './components/portraitDetailMap.vue'
import PortraitDetailTable from './components/portraitDetailTable.vue'
import { Mutation, Getter } from "vuex-class"
import API from '../../API'
@Component( {
  name: 'user-portrait-detail',
  components: {
    lcTitle,
    portraitDetailInfo,
    portraitDetailLike,
    PortraitDetailMember,
    PortraitDetailMap,
    PortraitDetailTable,
    // portraitDetailSalesManage
  }
} )
export default class UserPortraitDetail extends Vue {
  get isConsumablesPerson () {
    return this.$permissionValidate( 729 )
  }
  @Getter( 'login/email' ) email
  get realEmail () {
    if ( this.$permissionValidate( 728 ) ) {
      return this.email
    }
    return void 0
  }
  allUserInfoTabs: any = {
    portraitDetailInfo: '基础信息',
    portraitDetailMember: '会员权益',
    portraitDetailLike: '客户喜好'
  }
  componentName: string = 'portraitDetailInfo'
  isEdit: boolean = false
  myData: any = null
  myDataBak: any = {}

  activated () {
    let { tenant_id, office_id } = this.$route.query
    this.myData = {
      tenantId: tenant_id,
      officeId: office_id
    }
    this.getData()
  }
  deactivated () {
    this.myData = {}
    this.componentName = 'portraitDetailInfo'
  }
  getData () {
    const reqParams = {
      ...this.$route.params,
      email: this.realEmail
    }
    this.$http( API.getOfficesDetail, reqParams ).then( ( { data } ) => {
      let myData = data.data || {}
      if ( myData.hasOwnProperty( 'isPrintDeliveryOrder' ) ) {
        myData.isPrintPrice = myData.isPrintDeliveryOrder
        delete myData.isPrintDeliveryOrder
      }
      this.myData = myData
      this.myDataBak = Object.assign( {}, myData )
    } )

  }
  toggleEditStatus ( isSaveAction ) {
    let bo = this.isEdit = !this.isEdit
    let memberBenefit: any = undefined
    let isPriceChange = false

    memberBenefit = this.$refs[ 'portrait-detail-member' ]
    memberBenefit.memberBenefits.memberPrices === memberBenefit.memberBenefitsBak.memberPrices ? '' : isPriceChange = true

    if ( !bo ) {
      if ( isSaveAction ) {
        // 保存
        if ( isPriceChange ) {
          this.myData.priceLevel = memberBenefit.memberBenefits.memberPrices
        }
        memberBenefit.saveMemberBenefit()
        this.savePortrait()
      } else {
        // 撤销
        memberBenefit.cancelMemberBenefit()
        this.myData = Object.assign( this.myData, this.myDataBak )
      }
    } else {
      // 编辑
      memberBenefit.editMemberBenefit()
      this.myDataBak = Object.assign( {}, this.myData )
    }
  }
  savePortrait () {
    let o: any = {}
    Object.keys( this.myData ).forEach( key => {
      let value = this.myData[ key ]
      let valueBak = this.myDataBak[ key ]
      if ( value != valueBak ) {
        o[ key ] = value
      }
    } )
    if ( o.hasOwnProperty( 'enabled' ) ) {
      o.enabled = +o.enabled
    }
    if ( o.hasOwnProperty( 'isPrintPrice' ) ) {
      o.isPrintDeliveryOrder = o.isPrintPrice
      delete o.isPrintPrice
    }
    let { params, query } = this.$route
    let isPlainObject = o => {
      for ( let i in o ) {
        return false
      }
      return true
    }
    if ( isPlainObject( o ) ) {
      return
    }
    Object.assign( o, { id: +params.id, ...query } )

    this.$http( API.updateOfficeDetail, o ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: '更新成功!'
      } )
    }, () => {
      this.myData = Object.assign( this.myData, this.myDataBak )
      this.$notify( {
        type: 'error',
        message: '更新失败!'
      } )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.box
  height 515px
  padding 10px
.el-tabs
  margin -10px 0 0
.el-select
  width 100%
</style>
<style lang="stylus">
#user-portrait-detail
  .box
    .el-tabs__header
      margin-bottom 8px
</style>

