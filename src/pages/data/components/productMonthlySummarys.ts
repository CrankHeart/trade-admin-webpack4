import GmvMonthly from './gmvMonthly'
// import gmvBasic from './gmvBasic.vue'

import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'
import { tenantMonthlyGmvTypes } from '../const/index'
@Component( {
  name: 'tenant-monthly-gmv'
} )
export default class ProductMonthlySummary extends GmvMonthly {
  get title () {
    return '月度数据统计'
  }
  @Prop( { default: ( new Date() ).getFullYear() } )
  year: number
  // @Prop( { default: ( new Date().getMonth() + 1 ) } )
  // month: number

  getData () {
    this.yexiao.showLoading()
    this.$http( API.getMonthlySummarys, {
      year: this.year
    } ).then( ( { data } ) => {
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get baseConfig (): any {
    return {
      lackRate: { name: '常备商品订单缺货率', color: '#409EFF' },
      orderRate: { name: '订购商品订购单占比', color: '#8040FF' },
      saleRate: { name: '库存商品动销率', color: '#DF40FF' },
      turnoverRate: { name: '商品周转率', color: '#FF404D' },
      turnoverDays: { name: '商品周转天数', color: '#FFB640' },
      serviceOrderRate: { name: '服务订单占比', color: '#00a8cb' }
    }
  }
  get option (): any {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )
    let option = {
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
        bottom: 0,
        borderColor: '#000',
        formatter: ( v ) => this.baseConfig[ v ].name
      },
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '8%',
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
            lineStyle: {
              color: '#ccc'
            }
          },
          data: this.xAxisData
        },
        // {
        //   axisLabel: {
        //     formatter: ( value, index ) => +value && this.toTenThousand( value, 2 ) || '',
        //     textStyle: {
        //       fontSize: 12,
        //       color: '#9397a2'
        //     }
        //   },
        //   axisLine: {
        //     show: false
        //   },
        //   axisTick: {
        //     show: false
        //   },
        //   data: this.xAxisData.map( ( v, i ) => {
        //     console.log( v, i )
        //     let val = this.allData[ i ] || {}
        //     return val.gmv || 0
        //   } ),
        //   triggerEvent: true
        // }
      ],
      yAxis: [
        {
          name: '百分比',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontSize: 14
          },
          min: 0,
          max: 100,
          axisLabel: {
            rotate: 30,
            textStyle: {
              fontSize: 14,
              color: '#9397a2'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ '#f5f5f5' ]
            }
          }
        },
        {
          name: '天数',
          nameGap: 30,
          position: 'right',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#42d9ef'
            }
          },
          min: 0,
          max: 200,
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ 'rgba(66,217,239,.1)' ]
            }
          }
        }
      ],
      // dataZoom: [

      //   {
      //     type: 'slider',
      //     show: true,
      //     yAxisIndex: [0],
      //     right: '0%',
      //     start: 0,
      //     end: 100
      //   },
      //   {
      //     type: 'inside',
      //     yAxisIndex: 0,
      //     filterMode: 'empty'
      //   }
      // ],
      series: []
    }
    this.allData.forEach( ( o, i ) => {
      Object.keys( baseConfig ).forEach( v => {
        baseConfig[ v ].data = baseConfig[ v ].data || []
        baseConfig[ v ].data.push( o[ v ] || 0 )
      } )
    } )
    let nowYear = new Date().getFullYear()
    if ( nowYear == this.year ) {
      'saleRate,turnoverRate,turnoverDays'.split( ',' ).forEach( v => {
        baseConfig[ v ].data.pop()
      } )
    }

    Object.keys( baseConfig ).forEach( ( k: any ) => {
      let v = baseConfig[ k ]
      option.legend.data.push( k )
      // orderNum   unitPrice
      if ( 'lackRate,orderRate,saleRate,serviceOrderRate'.indexOf( k ) > -1 ) {
        option.series.push( {
          name: k,
          type: 'line',
          data: v.data.map( v => ( +v ) * 10000 / 100 ),
          barWidth: 20,
          itemStyle: {
            normal: {
              color: v.color,
              clickable: true
            }
          },
          tooltip: {
            formatter: ( { seriesName, marker, name, value } ) => {
              // let { seriesName, marker, value } = params
              // console.log(params)
              return `${name}:<br/>
              ${marker}${baseConfig[ seriesName ].name}：${value}%`
            }
          }
        } )
      } else {
        option.series.push( {
          name: k,
          type: 'line',
          data: v.data,
          symbol: 'emptyCircle',
          symbolSize: 6,
          cursor: 'default',
          yAxisIndex: 1,
          lineStyle: {
            normal: {
              color: v.color
            }
          },
          itemStyle: {
            normal: {
              borderColor: v.color,
              color: v.color
            }
          },
          tooltip: {
            formatter: ( { name, data, marker, seriesName } ) => {
              return `${marker}${name}<br/>
                      ${this.baseConfig[ seriesName ].name}：${data}`
            }
          }
        } )
      }

    } )

    // #94bf3c #b8e262
    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', ( data ) => {
      let value = data.value, index
      for ( let i = 0, l = this.allData.length; i < l; i++ ) {
        if ( this.allData[ i ].gmv == value ) {
          index = i
          break
        }
      }

      this.$emit( 'chose-month', { ...data, index } )
    } )
  }
}