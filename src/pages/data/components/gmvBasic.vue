<template>
  <div class="box">
    <h3>
      {{title}}
      <tool-tips
        @handler-click="tableBtnClick"
        :has-view="hasView"
        :tips-html="tipsHtml"
        :has-tips="hasTips"
        :is-table="isTable"
      >
        <el-tooltip placement="top" v-if="notChinaMap">
          <div slot="content">全国地图</div>
          <i class="icon-quanguoditu iconfont" @click="$emit('chose-city')"></i>
        </el-tooltip>
      </tool-tips>
    </h3>
    <div class="data-box">
      <div class="canvas" ref="my-canvas"></div>
      <transition name="el-zoom-in-bottom">
        <lc-table
          :has-page="false"
          :height="height"
          :config="config"
          :data="tableData"
          v-if="isTable"
        >
          <template slot-scope="scope">{{formatValue(scope.row[scope.con.prop])}}</template>
        </lc-table>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import toolTips from './toolTips.vue'
import lcTable from '../../../components/table/'
import { Echarts } from '../../../typing/'
import { Getter, State } from 'vuex-class'
import { thoundandSeparator } from '@/utils'
@Component( {
  name: 'gmv-basic',
  components: {
    toolTips,
    lcTable
  }
} )
export default class GmvBasic extends Vue {
  @Getter( 'login/email' ) email
  limitPromission = [ 723 ]
  get realEmail () {
    if ( this.limitPromission.length && this.$permissionValidate.apply( null, this.limitPromission ) ) {
      return this.email
    }
    return ''
  }
  height: number = 370
  @Prop( { default: ( new Date() ).getFullYear() } )
  year: number
  @Prop( { default: () => ( {} ) } )
  other: any
  yexiao: Echarts = {
    showLoading: () => { },
    resize: () => { },
    hideLoading: () => { }
  }
  @Inject() asynEcharts
  @Watch( 'year' )
  yearWatcher ( v ) {
    // if (typeof v !== 'string') return
    this.getData()
  }
  formatValue ( value: any ) {
    if ( typeof +value === 'number' && +value == value ) {
      return thoundandSeparator( value )
    } else {
      return value
    }
  }
  getData () {
    console.log( 'getData' )
  }
  get baseConfig (): any {
    return {}
  }

  get config () {
    let o: any = []
    Object.keys( this.baseConfig ).forEach( key => {
      o.push( {
        prop: key, label: this.baseConfig[ key ].name
      } )
    } )
    return o
  }
  formatTitle (): string {
    return ''
  }
  get title (): string {
    return this.formatTitle()
  }
  hasView: boolean = true
  tipsHtml: string = ''
  get hasTips (): boolean {
    return !!this.tipsHtml
  }
  isTable: boolean = false
  tableBtnClick () {
    this.isTable = !this.isTable
  }
  get tableData () {
    return []
  }
  get option (): any {
    return {}
  }
  echarts: any = null
  mounted () {
    this.$nextTick( () => {
      let canvas = this.$refs[ 'my-canvas' ]
      if ( !canvas ) return
      this.asynEcharts.then( echarts => {
        this.echarts = echarts
        this.yexiao = echarts.init( canvas )
        this.getData()
      } )
    } )
  }
  beforeDraw () {
    return Promise.resolve()
  }
  drawChart () {
    this.$nextTick( () => {
      this.yexiao.clear()
      this.beforeDraw().then( res => {
        window.removeEventListener( 'resize', this.yexiao.resize )
        window.addEventListener( 'resize', this.yexiao.resize )
        this.yexiao.setOption( this.option )
        this.yexiao.hideLoading()
        this.yexiao.off( 'click' )

      } ).then( res => {
        this.afterDraw()
      } )
    } )

  }
  afterDraw () {

  }

  get notChinaMap (): boolean {
    return false
  }
  notifyError ( msg ) {
    if ( msg ) {
      this.$notify( {
        type: 'error',
        message: msg
      } )
    }
    this.yexiao.hideLoading()
  }
  toTenThousand ( v, count = 2 ) {
    return thoundandSeparator( ( ( +v ) / 10000 ), count ) + '万'
  }
}

</script>
<style lang="stylus" scoped>
.box
  margin-bottom 20px
h3
  position relative
  .el-icon-information
    font-size 12px
.data-box
  height 370px
  position relative
  .table-with-page, .el-table
    position absolute
    width 100%
    height 100%
    left 0
    top 0
.canvas
  width 100%
  height 370px
</style>
// <style lang="stylus" >

// .data-box

//   td + td,

//   th + th

//     text-align right

// </style>
