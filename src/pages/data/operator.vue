<template>
  <div class="operator">
    <lc-title text="活动看板">
      <el-date-picker v-model="other.dateRange" type="daterange" align="left" placeholder="选择日期范围">
      </el-date-picker>
    </lc-title>
    <activity-data :other="other" @change="changeActivity" ></activity-data>
    <activity-detail-table :activity="currActivity"></activity-detail-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import asyncEcharts from '../../components/asyncEcharts'
import lcTitle from '../../components/title.vue'
import activityData from './components/activityData'
import activityDetailTable from './components/activityDetailTable.vue'
import API from '../../API'

@Component( {
  name: 'operator-data',
  components: {
    lcTitle,
    activityData,
    activityDetailTable
  }
} )
export default class operator extends asyncEcharts {
  @Inject() formatMyDate
  other: any = {
    dateRange: []
  }
  discountId: string = '123'
  currActivity: any = {}
  pickerOptions2 = {
    shortcuts: [
      {
        text: '最近一月',
        onClick ( picker ) {
          let end = new Date()
          let start = new Date()
          start.setTime( start.getTime() - 3600 * 1000 * 24 * 30 )
          picker.$emit( 'pick', [ start, end ] )
        }
      }
    ]
  }
  created () {
    this.initDateRange()
  }

  initDateRange () {
    const one_day = 1000 * 60 * 60 * 24
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth()

    let endYear, startYear
    let endMonth, startMonth

    endMonth = month + 1 + 1
    startMonth = month - 1
    endYear = year
    startYear = year

    if ( endMonth > 11 ) {
      endMonth = endMonth - 12
      endYear = year + 1
    }
    if ( startMonth < 0 ) {
      startMonth = month + 12
      startYear = year - 1
    }
    let end = new Date( endYear, endMonth, 1 ).getTime() - one_day
    let start = new Date( startYear, startMonth, 1 ).getTime()

    this.other.dateRange = []
    this.other.dateRange.push( start )
    this.other.dateRange.push( end )
  }

  changeActivity ( activity ) {
    this.currActivity = activity
  }

}
</script>


<style lang='stylus' scoped>
</style>
