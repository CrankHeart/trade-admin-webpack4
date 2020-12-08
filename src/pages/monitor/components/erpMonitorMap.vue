<template>
  <div class="erp-monitor-map">
    <div class="canvas" ref="erp-canvas"></div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { erpMonitorType, erpMonitorStatus } from '../const'
import AsyncEcharts from '../../../components/asyncEcharts'
import API from '../../../API'
import { matchArrItem } from '../../../utils'
@Component( {
  name: 'erp-monitor-map',
  components: {

  }
} )
export default class ErpMonitorMap extends AsyncEcharts {
  @Prop() value
  yexiao: any = null
  totalData: any[] = []
  mounted () {
    this.$nextTick( () => {
      let canvas = this.$refs[ 'erp-canvas' ]
      if ( !canvas ) {
        return
      }
      this.asynEcharts.then( echarts => {
        this.yexiao = echarts.init( canvas )
        this.getData()
      } )
    } )
  }
  getData () {
    this.$http( API.getCountMonitors ).then( ( { data } ) => {
      // data = { "msg": "", "code": "A0000", "data": [ { "gmv": 0, "num": 157, "province": "上海市" }, { "gmv": 0, "num": 3, "province": "云南省" }, { "gmv": 0, "num": 157, "province": "其他" }, { "gmv": 0, "num": 3, "province": "内蒙古自治区" }, { "gmv": 0, "num": 189, "province": "北京市" }, { "gmv": 0, "num": 4, "province": "吉林省" }, { "gmv": 0, "num": 52, "province": "四川省" }, { "gmv": 0, "num": 11, "province": "天津市" }, { "gmv": 0, "num": 6, "province": "宁夏回族自治区" }, { "gmv": 0, "num": 7, "province": "安徽省" }, { "gmv": 0, "num": 36, "province": "山东省" }, { "gmv": 0, "num": 27, "province": "山西省" }, { "gmv": 0, "num": 95, "province": "广东省" }, { "gmv": 0, "num": 46, "province": "广西壮族自治区" }, { "gmv": 0, "num": 4, "province": "新疆维吾尔自治区" }, { "gmv": 0, "num": 1, "province": "昆山" }, { "gmv": 0, "num": 15, "province": "未知" }, { "gmv": 0, "num": 162, "province": "江苏省" }, { "gmv": 0, "num": 2, "province": "江西省" }, { "gmv": 0, "num": 23, "province": "河北省" }, { "gmv": 0, "num": 19, "province": "河南省" }, { "gmv": 0, "num": 81, "province": "浙江省" }, { "gmv": 0, "num": 58, "province": "湖北省" }, { "gmv": 0, "num": 80, "province": "湖南省" }, { "gmv": 0, "num": 6, "province": "甘肃省" }, { "gmv": 0, "num": 1, "province": "福建省" }, { "gmv": 0, "num": 14, "province": "辽宁省" }, { "gmv": 0, "num": 6, "province": "重庆市" }, { "gmv": 0, "num": 125, "province": "陕西省" }, { "gmv": 0, "num": 3, "province": "黑龙江省" } ] }
      this.totalData = data.data
      this.drawCharts()
    } )
  }
  get option () {

    let sendStatus = this.totalData.map( v => v.sendStatus )
    let formatedSendStatus = sendStatus.map( v => matchArrItem( v, erpMonitorStatus, 'id' ).name )
    return {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          // type: 'shadow',
          // label: {
          //   show: true
          // }
        }
      },
      // color: ,
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '10%',
        containLabel: true
      },
      // xAxis: [
      //   {
      //     axisLabel: {
      //       textStyle: {
      //         fontSize: 14,
      //         color: '#999'
      //       }
      //     },
      //     axisLine: {
      //       show: false
      //     },
      //     axisTick: {
      //       show: false
      //     },
      //     data: formatedSendStatus
      //   }
      // ],
      // yAxis: [
      //   {
      //     axisLabel: {
      //       textStyle: {
      //         fontSize: 14,
      //         color: '#999'
      //       }
      //     },
      //     axisLine: {
      //       show: true,
      //       lineStyle: {
      //         color: '#999'
      //       }
      //     },
      //     splitNumber: 5,
      //     splitLine: {
      //       lineStyle: {
      //         width: 1,
      //         color: [ 'rgba(38, 164, 214,.2)' ]
      //       }
      //     }
      //   }
      // ],
      series: [
        {
          type: 'pie',
          data: this.totalData.map( v => ( {
            ...v,
            name: matchArrItem( v.sendStatus, erpMonitorStatus, 'id' ).name,
            value: v.total,
            itemStyle: {
              normal: {
                color: ( [ '#baa0ea', '#f3854f', '#26a4d6', '#fa7c8d' ] )[ v.sendStatus - 1 ]
              }
            }
          } ) ),
          barWidth: 20
        }
      ]
    }

  }
  drawCharts () {
    this.$nextTick( () => {
      this.yexiao.clear()
      window.removeEventListener( 'resize', this.yexiao.resize )
      window.addEventListener( 'resize', this.yexiao.resize )
      this.yexiao.setOption( this.option )
      this.yexiao.hideLoading()
      this.yexiao.off( 'click' )
      this.afterDraw()
    } )
  }
  afterDraw () {
    this.yexiao.on( 'click', ( data ) => {
      let myData = data.data
      this.$emit( 'input', { sendStatus: myData.sendStatus } )
      this.$emit( 'toggle' )
    } )
  }

}
</script>
<style lang="stylus" scoped>
.canvas 
  width 100%
  height 400px
</style>
