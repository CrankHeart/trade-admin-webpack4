<template>
  <div id="gmv-wrap">

    <lc-title @year-change="yearChange" text="商城数据" :year="year">
      <!-- <el-button type="primary" class="pull-right" size="small" @click="dataPanelExport">下载当前商城数据</el-button> -->
    </lc-title>

    <gmv-monthly :year="year" @chose-month="choseMonth"></gmv-monthly>
    <el-row :gutter="15">
      <el-col :span="9" :sm="24" :xs="24" :md="9">
        <gmv-user :year="year" :month="month" @chose-user="choseUser"></gmv-user>
      </el-col>
      <el-col :span="15" :sm="24" :xs="24" :md="15">
        <gmv-proportion :year="year" :month="month" :user="user" @chose-city="choseCity"></gmv-proportion>
      </el-col>
    </el-row>
    <!-- <gmv-region :year="year" :month="month" :province="province" @chose-city="choseCity" :user-type="user&&user.userType"></gmv-region> -->
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from './dataTitle.vue'

import gmvMonthly from './gmvMonthly'
import gmvUser from './gmvUser'
import gmvProportion from './gmvProportion.vue'
import gmvRegion from './gmvRegion'
import API from '../../../API'
let date = new Date()
let month = date.getMonth() + 1
let year = date.getFullYear()
@Component( {
  name: 'gmv',
  components: {
    lcTitle,
    gmvMonthly,
    gmvUser,
    gmvProportion,
    gmvRegion
  }
} )
export default class GmvWrap extends Vue {
  year: number = year
  month: number = month
  user: any = null
  province: any = {}
  yearChange ( date: number ): void {
    // console.log(typeof date) 
    this.year = date
    let newDate: any = new Date()
    let nowMonth = newDate.getMonth() + 1
    let nowYear = newDate.getFullYear()
    if ( nowMonth < this.month && nowYear <= date ) {
      this.month = 5
    }
  }
  choseMonth ( index: number ): void {
    this.month = index + 1
  }
  choseUser ( params ) {
    if ( !params.name ) return
    this.user = {
      userType: params.data.userType,
      name: params.name
    }
  }
  choseCity ( params ) {
    let isZone = params && params.data && params.data.isZone
    if ( isZone ) return
    this.province = params || {}
  }
  // dataPanelExport () {
  //   if ( !this.year ) return
  //   this.$submit( API.dataPanelExport, {
  //     year: this.year
  //   } )
  // }
}
</script>



