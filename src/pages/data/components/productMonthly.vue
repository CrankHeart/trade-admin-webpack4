<template>
  <div class="product-monthly">
    <el-row :gutter="30">
      <el-col :span="24">
        <el-date-picker v-model="year" align="right" type="year" size="small" :picker-options="pickerOptions" placeholder="选择年" @change="yearChange">
        </el-date-picker>
        <get-monthly-summarys :year="+year"></get-monthly-summarys>
      </el-col>

    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import getMonthlySummarys from './productMonthlySummarys'
import lcTable from '../../../components/table/'
import API from '../../../API'
@Component( {
  name: 'product-monthly',
  components: {
    getMonthlySummarys
  }
} )
export default class ProductMonthly extends Vue {
  @Prop()
  dateOptions: any
  get pickerOptions () {
    return this.dateOptions || {
      disabledDate ( time ) {
        return time.getTime() < new Date( '2017-01-01 00:00:00' ).getTime() || time.getTime() > Date.now()
      }
    }
  }
  year: string = `${new Date().getFullYear()}`
  yearChange ( year ) {
    this.year = year
  }
}
</script>
<style lang="stylus" scope>
.product-monthly
  position relative
  .el-date-editor
    position absolute
    right 100px
    top 30px
    z-index 99
</style>
