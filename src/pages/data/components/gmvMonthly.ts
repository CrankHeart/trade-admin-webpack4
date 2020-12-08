import GmvBasic from './gmvBasic.vue'
import { Component } from 'vue-property-decorator'
import API from '../../../API/'
@Component( {
  name: 'gmv-monthly'
} )
export default class GmvMonthly extends GmvBasic {
  get title () {
    return 'GMV'
  }
  tipsHtml = `<b>GMV：</b>这里统计的是经营GMV，即选择时间段内生成的<br/>
  （下单时间为准）有效订单（待发货，待收货，已完成）<br/>
  中商品原价*数量<br/>
  <b>大设备：</b>指选择时间段内生成的（下单时间为准）有效<br/>
  订单（待发货，待收货，已完成）中 原价超过10000元<br/>
  的商品原价*数量`

  xAxisData = [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ]
  get baseConfig () {
    return {
      totalGmv: { name: 'GMV', color: '#94bf3c' },
      bigDeviceGmv: { name: `大设备`, color: '#26a4d6' }
    }
  }
  get config () {
    let o: any = []
    Object.keys( this.baseConfig ).forEach( key => {
      o.push( {
        prop: key, label: this.baseConfig[ key ].name
      } )
    } )
    o.unshift( {
      prop: 'index', label: '#'
    } )
    return o
  }
  allData: any = []
  get tableData () {
    let data = this.allData.concat()
    data.map( ( val, key ) => {
      val.index = this.xAxisData[ key ]
    } )
    return data
  }
  get option () {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )
    let option = {
      title: [
        {
          text: '单位:元',
          textStyle: {
            color: '#000',
            fontSize: 12,
            fontWeight: 'normal'
          },
          left: 20,
          bottom: 20
        }
      ],
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true
          }
        }
      },
      legend: {
        data: [],
        itemGap: 50,
        bottom: 10,
        borderColor: '#000'
      },
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        containLabel: true
      },
      xAxis: [
        {
          axisLabel: {
            textStyle: {
              fontSize: 12,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: this.xAxisData
        }
      ],
      yAxis: [
        {
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ '#f5f5f5' ]
            }
          }
        }
      ],
      series: []
    }
    this.allData.forEach( o => {
      Object.keys( baseConfig ).forEach( v => {
        baseConfig[ v ].data = baseConfig[ v ].data || []
        baseConfig[ v ].data.push( o[ v ] || 0 )
      } )
    } )
    let legend = [], series = []
    Object.keys( baseConfig ).forEach( ( v: any ) => {
      v = baseConfig[ v ]
      option.legend.data.push( v.name )
      option.series.push( {
        name: v.name,
        type: 'bar',
        data: v.data,
        barWidth: 20,
        itemStyle: {
          normal: {
            color: v.color,
          }
        }
      } )
    } )
    return option
  }

  getData () {
    this.yexiao.showLoading()
    this.$http( API.getGMV, {
      year: this.year,
      email: this.realEmail
    } ).then( ( { data } ) => {
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  afterDraw () {
    this.yexiao.on( 'click', ( { dataIndex } ) => {
      this.$emit( 'chose-month', dataIndex )
    } )
  }

}