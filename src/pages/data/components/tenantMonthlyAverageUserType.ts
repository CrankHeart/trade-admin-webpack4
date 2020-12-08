import GmvUser from './gmvUser'

import { Component } from 'vue-property-decorator'

import API from '../../../API'

import { emptyRoundSvg } from '../const/svgPath'

import { userTypes } from '../../../const/'
import { thoundandSeparator } from '@/utils/'
@Component( {
  name: 'tenantMonthlyAverageUserType'
} )
export default class TenantMonthlyAverageUserType extends GmvUser {
  limitPromission = [ 724 ]
  formatTitle () {
    return this.year + '年' + ( this.month && this.month + '月' ) + '用户类型占比'
  }
  get baseConfig (): any {
    return {
      name: { name: '类型' },
      avgPurchasingAmount: { name: '当月平均GMV' }
    }
  }

  get option () {
    let option = {
      title: [
        {
          text: '',
          subtext: '各类型客户',
          textStyle: {
            color: '#338cea',
            fontSize: 30,
          },
          subtextStyle: {
            color: '#3d3d3d',
            fontSize: 18,
          },
          left: 20,
          top: 10
        }

      ],
      tooltip: {
        trigger: 'item',
        // formatter: '{b} <br/>本月销量：¥ {c}  <br/>占比：{d}%'
        formatter: function ( { data, name, percent } ) {
          // console.log(data)
          return `${name}<br/>月均值： ¥ ${thoundandSeparator( data.value || 0 )} 占比：${percent}%`
        }
      },
      legend: [
        {
          left: 20,
          top: 80,
          data: [],
          itemWidth: 10,
          width: '100%'
        }
      ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: [ '0%', '60%' ],
          center: [ '55%', '63%' ],
          label: {
            normal: {
              show: true,
              formatter: `{b}`
            },
            emphasis: {
              show: true
            }
          },
          data: [
            // { itemStyle: { normal: { color: '#94bf3c' } } },
            // { itemStyle: { normal: { color: '#ffc020' } } },
            // { itemStyle: { normal: { color: '#fe7065' } } },
            // { itemStyle: { normal: { color: '#5a8eca' } } },
            // { itemStyle: { normal: { color: '#dd9213' } } },
            // { itemStyle: { normal: { color: '#2d9213' } } }
          ]
        },
      ]
    }
    this.allData.forEach( ( v, i ) => {
      let { userType, name } = v
      option.legend[ 0 ].data.push( { name, icon: 'path://' + emptyRoundSvg } )
      let colors = [ '#94bf3c', '#ffc020', '#fe7065', '#5a8eca', '#dd9213', '#2d9213' ]
      option.series[ 0 ].data.push( {
        name, value: v.avgPurchasingAmount, userType,
        itemStyle: {
          normal: {
            color: colors[ i ]
          }
        }
      } )
      // Object.assign( option.series[ 0 ].data[ i ], { name, value: v.avgPurchasingAmount, userType } )
    } )
    return option
  }

  getData () {
    this.yexiao.showLoading()
    this.$http( API.getAvgPurchaseByYearAndMonth, {
      year: this.year,
      month: this.month,
      email: this.realEmail
    } ).then( ( { data } ) => {
      let d = data.data || []
      d.forEach( v => {
        let o: any = ( userTypes.filter( val => val.id == v.userType )[ 0 ] || {} )
        v.name = o.name
      } )
      this.allData = d || []
      this.drawChart()
      return 1
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
}