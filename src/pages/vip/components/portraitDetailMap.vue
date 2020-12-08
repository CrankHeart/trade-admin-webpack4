<template>
  <div class="portraite-detail-map box">
    <ul class="portraite-header">
      <li>首次交易时间: {{formatDate(item.firstTradeTime||item.lastTradeTime)}}</li>
      <li>最近交易时间: {{formatDate(item.lastTradeTime)}}</li>
      <!-- <li>欠款金额: {{thoundandSeparator(item.arrears)}}元</li> -->
      <!-- <li>19年起逾期账款：{{thoundandSeparator(item.overdueArrears)}}</li> -->
      <!-- <li>新增账款：{{thoundandSeparator(item.newlyArrears)}}</li> -->
      <li>可用优惠券数量: {{effectiveCouponNum}}</li>
    </ul>
    <h5>{{title}}</h5>
    <div class="canvas" ref="my-canvas"></div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Echarts } from '../../../typing/'
import { Getter } from 'vuex-class'
import asyncEcharts from '../../../components/asyncEcharts'
import { Component, Watch, Prop, Inject } from "vue-property-decorator"
import API from "../../../API/"
import { thoundandSeparator } from '../../../utils/'
@Component( {
  name: 'UserPortraitDetailMap'
} )
export default class UserPortraitDetailMap extends asyncEcharts {
  @Prop() item
  @Inject() formatMyDate
  thoundandSeparator = thoundandSeparator
  formatDate ( date ) {
    let timeStmp = date && date.time
    return timeStmp && this.formatMyDate( timeStmp )
  }
  yexiao: Echarts = {
    showLoading: () => { },
    resize: () => { },
    hideLoading: () => { }
  }
  effectiveCouponNum: number = 0
  echarts: any = null
  activated () {
    let canvas = this.$refs[ 'my-canvas' ]
    if ( !canvas ) return
    this.asynEcharts.then( echarts => {
      this.echarts = echarts
      this.yexiao = echarts.init( canvas )
      this.getData()
    } )
    this.getEffectiveCouponNum()
  }
  mounted () {
    this.$nextTick(()=>{
      let canvas = this.$refs[ 'my-canvas' ]
      if ( !canvas ) return
      this.asynEcharts.then( echarts => {
        this.echarts = echarts
        this.yexiao = echarts.init( canvas )
        this.getData()
      } )
      this.getEffectiveCouponNum()
    })
  }
  getEffectiveCouponNum () {
    this.$http( API.getEffectiveCouponNum, { ...this.$route.query } ).then( ( { data } ) => {
      this.effectiveCouponNum = data.data || 0
    } )
  }
  drawChart () {
    this.$nextTick( () => {
      this.yexiao.clear()
      window.removeEventListener( 'resize', this.yexiao.resize )
      window.addEventListener( 'resize', this.yexiao.resize )
      this.yexiao.setOption( this.option )
      this.yexiao.hideLoading()
      this.yexiao.off( 'click' )
    } )
  }
  yearMonthList: any = []
  title: string = ''
  get baseConfig () {
    return {
      avgOrderPrice: { name: '客单价', color: '#3d8ae4' },
      consumGmv: { name: `交易额`, color: '#cee5ff' },
      consumOrderNum: { name: `订单数`, color: '#ff8909' }
    }
  }
  get option () {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )
    let option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: [],
        bottom: 10
      },
      xAxis: [
        {
          data: [],
          axisLabel: {
            textStyle: {
              fontSize: 12,
              color: '#9397a2'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
        }
      ],
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '8%',
        containLabel: true
      },
      yAxis: [
        {
          name: `交易额/元`,
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#20a0ff'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#20a0ff'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: [ 'rgba(32,160,255,.2)' ]
            }
          }
        },
        {
          name: `订单数/个`,
          minInterval: 1,
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#ff8909'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ff8909'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: [ 'rgba( 255, 137, 9, .2 )' ]
            }
          }
        } ],
      series: []
    }
    this.yearMonthList.length && this.yearMonthList.forEach( o => {
      option.xAxis[ 0 ].data.push( o.year + '.' + o.month )
      Object.keys( baseConfig ).forEach( v => {
        baseConfig[ v ].data = baseConfig[ v ].data || []
        baseConfig[ v ].data.push( o[ v ] || 0 )
      } )
    } )
    Object.keys( baseConfig ).forEach( ( v: any ) => {
      v = baseConfig[ v ]
      option.legend.data.push( v.name )
      option.series.push( {
        name: v.name,
        type: v.name == '交易额' ? 'bar' : 'line',
        data: v.data,
        barWidth: 22,
        yAxisIndex: v.name == '订单数' ? 1 : 0,
        itemStyle: {
          normal: {
            color: v.color,
          }
        }
      } )
    } )
    return option
  }
  @Watch( "option", { deep: true } )
  optionWatcher () {
    this.drawChart()
  }

  getData () {
    this.yexiao.showLoading()
    this.$http( API.getAccumulativeAmount, { ...this.$route.query } ).then(
      ( { data } ) => {
        this.yearMonthList = data.data.yearMonthList
        this.title = `累计交易额: 当月¥${( data.data.currMonthTotal ).toFixed( 2 )}/当年¥${( data.data.currYearTotal ).toFixed( 2 )}/历史¥${( data.data.historyTotal ).toFixed( 2 )}`
        this.drawChart()
      }, rej => {
        this.yearMonthList = []
        this.title = ''
        let msg = rej.msg
        if ( msg ) {
          this.$notify( {
            type: 'error',
            message: msg
          } )
        }
        this.yexiao.hideLoading()
      } )

  }
}
</script>
<style lang="stylus" scoped>
.portraite-detail-map
  border 1px solid #eee
  padding 0  0 20px 0 !important
  .canvas
    width 100%
    height 445px
  h5
    text-align center
    color #3d8ae4
    font-size 14px
    font-weight 400
    letter-spacing 0.5px
  .portraite-header
    display flex
    margin-bottom 20px
    border-bottom 1px solid #eee
    height 32px
    line-height 32px
    color #333
    li
      flex-grow 1
      font-size 12px
      border-right 1px solid #eee
      text-align center
      box-sizing border-box
      &:last-child
        border-right none
</style>


