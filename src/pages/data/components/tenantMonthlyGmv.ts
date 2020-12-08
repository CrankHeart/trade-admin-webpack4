import GmvMonthly from './gmvMonthly'
import { Component } from 'vue-property-decorator'
import API from '../../../API/'
import { tenantMonthlyGmvTypes } from '../const/index'
import { thoundandSeparator } from '@/utils'
@Component( {
  name: 'tenant-monthly-gmv'
} )
export default class TenantMonthlyGmv extends GmvMonthly {
  limitPromission = [ 724 ]
  getData () {
    this.yexiao.showLoading()
    this.$http( API.getCompanyGMV, {
      year: this.year,
      email: this.realEmail
    } ).then( ( { data } ) => {
      // 新增一个目标数
      // data.data.forEach( v => {
      //   v.target = 1710000 || 0
      // } )
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get baseConfig (): any {
    return Object.assign( {}, tenantMonthlyGmvTypes, {
      consumOrderNum: { name: `订单数`, color: '#fa7c8d' },
      avgOrderPrice: { name: `平均客单价`, color: '#42d9ef' }
    } )
  }
  get option (): any {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )
    let option = {
      title: [
        {
          text: '年度总计：' + thoundandSeparator( ( ( this.allData.reduce( ( prev, next ) => next.totalGmv + prev, 0 ) ) / 10000 ) ) + '万元',
          textStyle: {
            color: '#000',
            fontSize: 12,
            fontWeight: 'normal'
          },
          right: '50%',
          top: 0
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
        {
          axisLabel: {
            formatter: ( { totalGmv }, index ) => +totalGmv && this.toTenThousand( totalGmv, 2 ) || '',
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
          data: this.xAxisData.map( ( v, i ) => {
            let val = this.allData[ i ] || {}
            return {
              value: {
                ...val,
                index: i
              }
            }
          } ),
          triggerEvent: true
        }
      ],
      yAxis: [
        {
          name: 'gmv',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontSize: 14
          },
          axisLabel: {
            rotate: 30,
            formatter: ( value, index ) => this.toTenThousand( value, 0 ),
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
          // name: '客单价',
          nameGap: 30,
          position: 'right',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#42d9ef'
            }
          },
          min: 0,
          max: 5000,
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
    Object.keys( baseConfig ).forEach( ( k: any ) => {
      let v = baseConfig[ k ]
      option.legend.data.push( k )
      // orderNum   unitPrice
      if ( 'repurchaseGmv,newlyGmv,bigDeviceGmv'.indexOf( k ) > -1 ) {
        option.series.push( {
          name: k,
          type: 'bar',
          data: v.data,
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
              ${marker}${baseConfig[ seriesName ].name}：${this.toTenThousand( value )}`
            }
          },
          stack: 'repurchaseGmv,newlyGmv'.indexOf( k ) > -1 ? 'yexiao' : null
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

      let index = 0
      if ( data.componentType == 'xAxis' ) {
        data.myType = 2
      }
      try {
        let myIndex = data.value.index
        if ( myIndex ) {
          index = myIndex
        }
      } catch ( e ) { }
      console.log( data )
      this.$emit( 'chose-month', { ...data, index } )
    } )
  }
}