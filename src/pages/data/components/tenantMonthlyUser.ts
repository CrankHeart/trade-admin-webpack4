import GmvMonthly from './gmvMonthly'
import { Component } from 'vue-property-decorator'
import API from '../../../API/'
import { tenantMonthlyUserTypes } from '../const/index'
import { thoundandSeparator } from '../../../utils';
@Component( {
  name: 'tenant-monthly-user'
} )
export default class TenantMonthlyUser extends GmvMonthly {
  limitPromission = [ 724 ]
  getData () {
    this.yexiao.showLoading()
    this.$http( API.getCompanyNum, {
      year: this.year,
      email: this.realEmail
    } ).then( ( { data } ) => {
      let target = [ 12, 12, 12, 14, 14, 14, 16, 16, 16, 16, 16, 16 ]
      let d = data.data || []
      d.forEach( ( v, i ) => {
        v.target = target[ i ]

        let ar = `rePurchase,commonUserPurchase,enterprisesPurchase,externalUserPurchase,kAUserPurchase,enterprisesActivePurchase,
        enterprisesInactivityPurchase,enterprisesAndKAPurchase`.split( ',' )
        ar.forEach( k => {
          v[ k ] = v[ k ] * 1000000 / 10000
        } )

        v.num = v.num
      } )
      this.allData = d
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get baseConfig (): any {
    return tenantMonthlyUserTypes
  }
  get title () {
    return '用户数据'
  }
  get option (): any {
    let baseConfig = JSON.parse( JSON.stringify( this.baseConfig ) )

    let option = {
      title: [
        // {
        //   text: '年度总计：' + this.allData.reduce( ( prev, next ) => next.num + prev, 0 ),
        //   textStyle: {
        //     color: '#000',
        //     fontSize: 12,
        //     fontWeight: 'normal'
        //   },
        //   right: '50%',
        //   top: 0
        // }
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
        formatter: v => baseConfig[ v ].name
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
            show: false
          },
          axisTick: {
            show: false
          },
          data: this.xAxisData
        },
        {
          axisLabel: {
            formatter: ( value, index ) => ( ( ( +value.reNum ) + ( +value.newNum ) ) || '' ),
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
              value: { ...val, index: i }
            }
          } ),
          triggerEvent: true
        }
      ],
      yAxis: [
        {
          name: '用户数量',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            rotate: 30,
            textStyle: {
              fontSize: 14,
              color: '#baa0ea'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#baa0ea'
            }
          },
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ 'rgba(186,160,234,.1)' ]
            }
          }
        },
        {
          name: '复购率',
          nameLocation: 'middle',
          nameGap: 30,
          position: 'right',
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#42d9ef'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#42d9ef'
            }
          },
          min: 0,
          max: 100,
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ 'rgba(66,217,239,.1)' ]
            }
          }
        }
      ],
      series: []
    }
    let keys = [ 'num', 'newNum', 'reNum', 'rePurchase' ]
    // let keys = Object.keys(baseConfig)
    this.allData.forEach( ( o, i ) => {
      keys.forEach( v => {
        let config = baseConfig[ v ]
        config.data = config.data || []
        if ( v === 'rePurchase' ) {
          config.data.push( { ...o, value: o[ v ], name: config.name } )
        } else {
          config.data.push( o[ v ] || 0 )
        }

      } )
    } )
    let legend = [], series = []
    keys.forEach( ( k: any ) => {
      let v = baseConfig[ k ]

      option.legend.data.push( k )
      if ( k == 'target' ) {
        option.series.push( {
          name: k,
          type: 'line',
          data: v.data,
          yAxisIndex: 1,
          symbol: 'emptyCircle',
          symbolSize: 6,
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
            formatter: ( { dataIndex, name, value } ) => {
              let d = this.allData[ dataIndex ]
              let total = d.newNum
              return `${name}:<br/>
                目　标：${value} 家<br/>
                已完成：${total} 家<br/>
                完成度：${( total / value * 100 ).toFixed( 2 ) + '%'}`
            }
          }
        } )
      } else if ( k !== 'rePurchase' ) {
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
            formatter: ( data ) => {
              let { seriesName, marker, name, value } = data
              return `${name}:<br/>
              ${marker}${baseConfig[ seriesName ].name}：${thoundandSeparator( value, 0 )}`
            }
          },
          stack: k == 'num' ? null : 'yexiao'
        } )
      } else {
        option.series.push( {
          name: k,
          type: 'line',
          data: v.data,
          yAxisIndex: 1,
          symbol: 'emptyCircle',
          symbolSize: 6,
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
            formatter: ( { seriesName, marker, name, value, data } ) => {
              return `${name}:<br/>
              - 总复购率：${data.rePurchase.toFixed( 2 )}%<br/>
              - 企采用户复购率：${data.enterprisesPurchase.toFixed( 2 )}%<br/>
              - 集团用户复购率：${data.externalUserPurchase.toFixed( 2 )}%<br/>
              - 普通用户复购率：${data.commonUserPurchase.toFixed( 2 )}%<br/>
              - KA客户复购率: ${data.kAUserPurchase.toFixed( 2 )}%<br/>
              - 企采&KA客户复购率: ${data.enterprisesAndKAPurchase.toFixed( 2 )}%`

              // - 企采活跃客户复购率: ${data.enterprisesActivePurchase.toFixed( 2 )}%<br/>
              // - 企采非活跃客户复购率: ${data.enterprisesInactivityPurchase.toFixed( 2 )}%<br/>
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
      // if ( data.componentType == 'xAxis' ) {
      //   return
      // }
      if ( data.componentType == 'xAxis' ) {
        data.myType = 3
      }
      let index = 0
      try {
        let myIndex = data.value.index
        if ( myIndex ) {
          index = myIndex
        }
      } catch ( e ) { }

      // let value = data.value, index

      // for ( let i = 0, l = this.allData.length; i < l; i++ ) {
      //   let { reNum, newNum } = this.allData[ i ]
      //   let total = ( ( +reNum ) + ( +newNum ) ) || ''
      //   if ( total === value ) {
      //     index = i
      //     break
      //   }
      // }
      this.$emit( 'chose-month', { ...data, index } )
    } )
  }
}