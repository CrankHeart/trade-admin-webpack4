<template>
  <lc-title :text="text">
    <slot></slot>
    <el-date-picker v-model="myYear" align="right" type="year" size="small" :picker-options="pickerOptions" placeholder="选择年" @change="yearChange">
    </el-date-picker>
  </lc-title>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import lcTitle from '../../../components/title.vue'

@Component( {
  name: 'data-title',
  components: {
    lcTitle
  }
} )
export default class GmvTitle extends Vue {
  @Prop()
  text: string
  @Prop()
  dateOptions: any
  @Prop()
  year: number
  @Watch( 'year' )
  yearWatcher ( v ) {
    this.myYear = `${v}`
  }
  myYear: string = null

  get pickerOptions () {
    return this.dateOptions || {
      disabledDate ( time ) {
        return time.getTime() < new Date( '2017-01-01 00:00:00' ).getTime() || time.getTime() > Date.now()
      }
    }
  }
  created () {
    this.myYear = `${this.year}`
    this.yearChange( this.year )
  }
  yearChange ( year ) {
    if ( !year ) return
    this.$emit( 'year-change', +year )
  }
}
</script>

