<template>
  <div id="tenant-wrap">
    <lc-title @year-change="yearChange" text="企业数据" :year="year">
      <!-- <el-button type="primary" size="small" class="pull-right" @click="exportCityCustomerDate">企业采购-城市客户进展导出</el-button> -->
    </lc-title>
    <div class="tenant-tabs">
      <ul>
        <li v-for="(tab,index) in tabs" :key="tab" :class="{'is-active':curTabIndex == index}" @click="tabChange(index)">{{tab}}</li>
      </ul>
    </div>
    <el-row :gutter="16">
      <el-col :span="24">
        <component :is="monthlyComponent" :year="year" @chose-month="choseMonth" />
      </el-col>
      <template v-if="curTabIndex!==2">
        <!-- 大区占比 -->
        <el-col :md="8" :xs="24" v-if="hasPermission">
          <tenant-zone :year="year" :month="month" :type="type" @chose-region="choseRegion" :cur-tab="curTabIndex" :is-history="isHistory" />
        </el-col>
        <!-- 客户区域占比 -->
        <el-col :md="hasPermission ? 16: 24" :xs="24">
          <tenant-user-region :year="year" :month="month" :region="region" @chose-city="choseCity" :is-history="isHistory" :type="type" :is-sale-city="isSaleCity" :cur-tab="curTabIndex" @is-sale-city-change="isSaleCityChange" />
        </el-col>
        <!-- 客户分类占比 -->
        <el-col :md="hasPermission?12:14" :xs="24">
          <tenant-user-type :year="year" :month="month" :region="region" :type="type" :is-sale-city="isSaleCity" :is-history="isHistory" :region-province="regionProvince" :cur-tab="curTabIndex" @chose-user="choseUser" @is-sales-department-change="isSalesDepartmentChange" :is-sales-department="isSalesDepartment" />
        </el-col>
        <!-- 销售金额占比 -->
        <el-col :year="year" :md="hasPermission?12:10" :xs="24" v-if="isHistory&&curTabIndex==1">
          <tenant-sale-time-type :year="year" :month="month" :region="region" :user-type="userType" :type="type" :is-sale-city="isSaleCity" :region-province="regionProvince" :cur-tab="curTabIndex" @chose-saleTimeType="choseSaleTimeType" :is-sales-department="isSalesDepartment" :sales-departments-type="salesDepartmentsType" />
        </el-col>
        <el-col :md="hasPermission?12:10" :xs="24" v-else>
          <tenant-sale-num-type :year="year" :month="month" :region="region" :type="type" :is-sale-city="isSaleCity" :region-province="regionProvince" :cur-tab="curTabIndex" :user-type="userType" @chose-salesAmountType="choseSalesAmountType" :is-sales-department="isSalesDepartment" :sales-departments-type="salesDepartmentsType" />
        </el-col>

        <!-- <el-col :md="hasPermission?24:14" :xs="24">
          <tenant-region :year="year" :month="month" :region="region" :type="type" :is-sale-city="isSaleCity" :is-history="isHistory" :region-province="regionProvince" :cur-tab="curTabIndex" :user-type="userType" @chose-city="choseProvince" :province="province" />
        </el-col> -->
        <el-col :span="24" class="center">
          <el-button v-if="$permissionValidate(490)" type="primary" @click="getTenantTotal">生成当前数据图表</el-button>
        </el-col>
        <tenant-total :data="tenantTotal" v-if="tenantTotal.length" />
      </template>
      <template v-else>
        <tenant-monthly-average-user-type :year="year" :month="month"></tenant-monthly-average-user-type>
      </template>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import lcTitle from './dataTitle.vue'

import API from '../../../API'
import GmvWrap from './gmvWrap.vue'

import tenantMonthlyGmv from './tenantMonthlyGmv'
import tenantMonthlyUser from './tenantMonthlyUser'
import tenantMonthlyAverage from './tenantMonthlyAverage'

import tenantZone from './tenantZone'
import tenantUserRegion from './tenantUserRegion.vue'
import tenantUserType from './tenantUserType.vue'
import tenantSaleNumType from './tenantSaleNumType'
import tenantSaleTimeType from './tenantSaleTimeType'
import tenantRegion from './tenantRegion'

import tenantTotal from './tenantTotal.vue'
import tenantMonthlyAverageUserType from './tenantMonthlyAverageUserType'

import { Getter } from 'vuex-class'
import { userTypes } from '../../order/const/orderSearchCondition'
import { salesDepartmentsTypes } from '../../../const'
import { gmvTypes, numTypes, tenantMonthlyUserTypes } from '../const/index'
@Component( {
  name: 'tenant-wrap',
  components: {
    lcTitle,
    tenantMonthlyGmv,
    tenantMonthlyUser,
    tenantMonthlyAverage,

    tenantZone,
    tenantUserRegion,
    tenantUserType,
    tenantSaleNumType,
    tenantSaleTimeType,
    tenantRegion,
    tenantTotal,
    tenantMonthlyAverageUserType

  }
} )
export default class TenantWrap extends GmvWrap {
  @Getter( 'login/email' ) email
  isHistory = false
  get hasPermission (): boolean {
    return this.$permissionValidate( 726 )
  }
  limitPromission = [ 724 ]
  get realEmail () {
    if ( this.limitPromission.length && this.$permissionValidate.apply( null, this.limitPromission ) ) {
      return this.email
    }
    return ''
  }
  // tab大类
  curTabIndex = 0
  // tab小类
  type: number | string = 0
  // 用户类型
  userType: number = null

  // 是否是销售城市
  isSaleCity: boolean = false
  // 客服区域
  regionProvince: string = null

  // 是否是销售部门
  isSalesDepartment: boolean = false

  salesDepartmentsType: number = null

  region: string = null

  province: any = {}

  tenantTotal: any = []

  salesAmountType: any = null

  saleTimeType: any = null

  isMonthUserClicked = false

  tabChange ( index ) {
    this.isHistory = false
    this.curTabIndex = index
    this.type = 0
    this.userType = null
    this.salesDepartmentsType = null
    this.isSalesDepartment = false
    this.regionProvince = null
    this.isSaleCity = false
    this.region = null
    this.province = {}
    this.isMonthUserClicked = false
  }
  get monthlyComponent () {
    switch ( this.curTabIndex ) {
      case 0:
        return 'tenant-monthly-gmv'
      case 1:
        return 'tenant-monthly-user'
      case 2:
        return 'tenant-monthly-average'
      default:
        return ''
    }
  }

  tabs = [ 'GMV', '用户数据', '门诊月平均采购额' ]

  formatType ( type: string ) {
    switch ( this.curTabIndex ) {
      case 0:
        return gmvTypes[ type ]
      case 1:
        return numTypes[ type ]
      default:
        return 0
    }
  }
  choseMonth ( data ) {
    this.isHistory = false
    let { componentType, seriesName } = data
    if ( componentType === 'xAxis' ) { // 点击总计
      // this.type = '3,4'
      this.type = data.myType
      this.month = data.index + 1
    } else if ( componentType === 'series' ) { // 点击数据bar
      let { dataIndex, seriesName } = data
      if ( 'gmvType,rePurchase,orderNum,unitPrice'.indexOf( seriesName ) > -1 ) return
      this.type = this.formatType( seriesName )
      this.month = dataIndex + 1

      if ( seriesName == 'num' ) {
        this.isHistory = true
      }
    }

    this.isMonthUserClicked = true

    this.choseRegion( { name: null } )
  }
  choseRegion ( { name } ) {
    this.region = name

    this.isSaleCity = false
    this.userType = null
    this.regionProvince = null
    this.province = {}
    this.choseCity( { name: null } )
  }
  choseCity ( { name } ) {
    this.regionProvince = name
    if ( !this.isSaleCity ) {
      this.province = { name }
    }
    this.choseProvince( null )
  }
  choseProvince ( data ) {
    this.province = data || {}
    this.choseUser( { name: null } )
  }
  choseUser ( { name } ) {
    let array = this.isSalesDepartment ? salesDepartmentsTypes : userTypes
    let type = this.isSalesDepartment ? 'salesDepartmentsType' : 'userType'
    let user: { name?: string, id?: number } = array.filter( v => v.name == name )[ 0 ] || {}
    this[ type ] = user.id !== undefined ? user.id : null
    this.choseSalesAmountType( null )
    this.choseSaleTimeType( null )
  }
  choseSalesAmountType ( type ) {
    this.salesAmountType = type
  }
  choseSaleTimeType ( type ) {
    this.saleTimeType = type
  }
  isSaleCityChange ( v: boolean ) {
    this.isSaleCity = v
    this.userType = null
    this.salesDepartmentsType = null
    this.choseCity( { name: void 0 } )
  }
  isSalesDepartmentChange ( v: boolean ) {
    console.log( v )
    this.isSalesDepartment = v
    this.userType = null
    this.salesDepartmentsType = null
    this.choseCity( { name: void 0 } )
  }
  // exportCityCustomerDate () {
  //   this.$submit( API.exportCityCustomerDate )
  // }
  get totalOption () {
    // let o: any = {
    //   type: this.type,
    //   userType: this.userType,
    //   isSaleCity: this.isSaleCity,
    //   salesAmountType: this.salesAmountType,
    //   region: this.region,
    //   province: this.province.name,
    //   year: this.year,
    //   month: this.month,
    //   email: this.realEmail
    // }
    // let province = ( this.province || {} ).name
    // if ( province ) {
    //   if ( !/[省|市|区]$/.test( province ) ) {
    //     o.province = this.formatProvinceName( province )
    //   } else {
    //     o.province = province
    //   }
    // }
    // if ( !this.isSaleCity ) {
    //   o.regionProvince = this.regionProvince
    // } else {
    //   o.saleCity = this.regionProvince
    // }
    // Object.keys( o ).forEach( v => {
    //   if ( o[ v ] === null ) {
    //     delete o[ v ]
    //   }
    // } )
    // return o
    let o: any = {
      year: this.year,
      month: this.month,
      email: this.realEmail,
      type: this.type,
      userType: this.userType,
      isSaleCity: this.isSaleCity,
      saleType: this.salesAmountType,
      lastType: this.saleTimeType,
      region: this.region,
      curTab: this.curTabIndex,
      salesDepartments: this.salesDepartmentsType

    }
    if ( this.isHistory ) {
      o.isHistory = true
    }
    if ( this.regionProvince ) {
      if ( this.isSaleCity ) {
        o.salesCity = this.regionProvince
      } else {
        o.province = o.regionProvince = this.regionProvince
      }
    }
    let province = ( this.province || {} ).name
    if ( province ) {
      if ( !/[省|市|区]$/.test( province ) ) {
        o.province = this.formatProvinceName( province )
      } else {
        o.province = province
      }
    }
    Object.keys( o ).forEach( v => {
      if ( o[ v ] === null ) {
        delete o[ v ]
      }
    } )
    let typeProp = this.curTabIndex ? 'numType' : 'gmvType'
    return {
      ...o,
      [ typeProp ]: o.type,
      // gmvType: this.curTabIndex ? 2 : o.type,
      regionType: +o.isSaleCity
    }
  }
  getTenantTotal () {
    let promise
    // if(this.totalOption){
    //   return console.log(this.totalOption)
    // }
    if ( this.curTabIndex === 1 ) {
      if ( !this.isMonthUserClicked ) {
        promise = this.getDataDetailForEndType()
      } else {
        if ( this.type ) {
          promise = this.getDataDetail()
        } else {
          promise = this.getDataDetailForLastTradingType()
        }
      }
    } else {
      promise = this.getDataDetail()
    }

    promise.then( ( { data } ) => {
      this.tenantTotal = ( data.data || [] ).map( ( v, i ) => ( { ...v, index: i + 1 } ) )
    } )
  }
  getDataDetailForEndType () {
    return this.$http( API.getDataDetailForEndType, this.totalOption )
  }

  getDataDetailForLastTradingType () {
    return this.$http( API.getDataDetailForLastTradingType, this.totalOption )
  }
  getDataDetail () {
    return this.$http( API.getDataDetail, this.totalOption )
  }
  formatProvinceName ( t ) {
    switch ( t ) {
      case '宁夏':
        return '宁夏回族自治区';
      case '广西':
        return '广西壮族自治区';
      case '北京':
      case '上海':
      case '天津':
      case '重庆':
        return t + '市';
      case '香港':
      case '台湾':
      case '澳门':
      case '全国':
        return t;
      default: return t + '省'
    }
  }
}
</script>
<style lang="stylus" scoped>
.tenant-tabs
  border 1px solid #efefef
  margin-bottom -1px
  ul
    display flex
    line-height 32px
    background #f4f4f4
    height 32px
    position relative
    z-index 2
    li
      flex-grow 1
      text-align center
      border-left 1px solid #efefef
      height 32px
      cursor pointer
      &:first-child
        border-left none
      &.is-active
        background #ffffff
        border-bottom 1px solid #fff
.el-col
  .el-button
    margin 30px auto
</style>
<style lang="stylus">
#tenant-wrap
  .box
    height 395px
    h3
      min-height 20px
</style>


