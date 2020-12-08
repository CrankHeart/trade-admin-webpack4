import GmvMonthly from './gmvMonthly'
import { Component } from 'vue-property-decorator'
import API from '../../../API/'

@Component( {
  name: 'tenant-monthly-average'
} )
export default class TenantMonthlyAverage extends GmvMonthly {
  limitPromission = [ 724 ]
  getData () {
    this.yexiao.showLoading()
    this.$http( API.getRePurchaseByYear, {
      year: this.year,
      email: this.realEmail
    } ).then( ( { data } ) => {
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get baseConfig (): any {
    return {
      unitPrice: { name: '月平均', color: '#fa7c8d' },
    }
  }
  get title () {
    return '门诊月平均采购额'
  }
  get option (): any {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )

    let option = {
      title: [
        {
          text: '年度月平均：' + ( this.toTenThousand( this.allData.reduce( ( prev, next ) => next.unitPrice + prev, 0 ) / this.allData.length ) ),
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
        },
        formatter: ( { seriesName, marker, name, value } ) => {
          // let { seriesName, marker, name, value } = params
          // console.log(params)
          return `${seriesName}:<br/>
              ${marker}${name}：${this.toTenThousand( value )}`
        }
      },
      legend: {
        data: [],
        itemGap: 50,
        bottom: 0,
        borderColor: '#000'
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
              // color: '#9397a2'
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
          name: '复购率',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            rotate: 30,
            textStyle: {
              fontSize: 14,
              color: '#bbb'
            },
            formatter: value => this.toTenThousand( value, 0 ),
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#bbb'
            }
          },
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ 'rgba(186,160,234,.2)' ]
            }
          }
        }
      ],
      series: []
    }

    this.allData.forEach( ( o, i ) => {
      Object.keys( baseConfig ).forEach( v => {
        baseConfig[ v ].data = baseConfig[ v ].data || []
        baseConfig[ v ].data.push( o[ v ] || 0 )
      } )
    } )
    let legend = [], series = []
    Object.keys( baseConfig ).forEach( ( k: any ) => {
      let v = baseConfig[ k ]

      option.legend.data.push( v.name )

      option.series.push( {
        name: v.name,
        type: 'bar',
        data: v.data,
        barWidth: 20,
        itemStyle: {
          normal: {
            color: v.color,
            clickable: true
          }
        },
        label: {
          normal: {
            show: true,
            position: 'top',
            backgroundColor: '#ffa8b4',
            color: '#fff',
            padding: 5,
            borderRadius: 5,
            formatter: ( { value } ) => this.toTenThousand( value )
          }
        }
      } )
    } )
    // #94bf3c #b8e262
    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', params => {
      this.$emit( 'chose-month', params )
    } )
  }
}