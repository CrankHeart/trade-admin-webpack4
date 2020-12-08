import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { userTypeObj } from '../../order/const/orderSearchCondition'

import { emptyRoundSvg } from '../const/svgPath'
import { thoundandSeparator } from '@/utils'

@Component( {
  name: 'gmv-user'
} )
export default class GmvUser extends GmvBasic {
  @Prop()
  year: number
  @Watch( 'year' )
  yearWatcher ( v ) {
    this.getData()
  }
  tipsHtml = `
  <b>集团用户</b> 大型客户，未使用系统，领健代客下单<br />
  <b>企采用户</b> 开通企采模式的SaaS用户<br />
  <b>普通用户</b> 未开通企采模式，通过app下单的SaaS用户和app用户<br />
  <b>内部用户</b> 领健内部人员相关帐号<br />
  `
  @Prop()
  month: number
  @Watch( 'month' )
  monthWatcher ( v ) {
    this.getData()
  }
  get title (): string {
    return this.formatTitle()
  }
  allData: any = []
  get tableData () {
    return this.allData.concat()
  }
  get baseConfig () {
    return {
      name: { name: '类型' },
      gmv: { name: 'GMV' }
    }
  }
  // created() {
  //   this.formatTitle()
  // }
  formatTitle () {
    return this.year + '年' + ( this.month && this.month + '月' ) + '用户占比'
  }
  get option () {
    let option = {
      title: [
        {
          text: '0',
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
          return `${name}<br/>销量： ¥ ${thoundandSeparator( ( data.value || 0 ) )} 占比：${percent}%`
        }
      },
      legend: [
        {
          left: 20,
          top: 80,
          data: [

          ],
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
    };
    let total = 0

    this.allData.forEach( ( v, i ) => {
      total += v.gmv * 100
      this.encodeUserType( v )
      option.legend[ 0 ].data.push( { name: v.name, icon: 'path://' + emptyRoundSvg } )

      // Object.assign( option.series[ 0 ].data[ i ] || {}, { value: v.gmv, name: v.name, userType: v.userType } )

      let colors = [ '#94bf3c', '#ffc020', '#fe7065', '#5a8eca', '#dd9213', '#2d9213' ]
      option.series[ 0 ].data.push( {
        value: v.gmv, name: v.name, userType: v.userType,
        itemStyle: {
          normal: {
            color: colors[ i ]
          }
        }
      } )

    } )
    option.title[ 0 ].text = '¥' + thoundandSeparator( total / 100 )

    return option
  }

  encodeUserType ( user ) {
    // console.log( userTypeObj, user.userType, userTypeObj[ user.userType ].name )
    return user.name = userTypeObj[ user.userType ].name || '未知用户'
  }
  getData () {
    this.yexiao.showLoading()
    this.$http( API.getUserTypeProportion, {
      year: this.year,
      month: this.month,
      email: this.realEmail
    } ).then( ( { data } ) => {
      let d = data.data
      this.allData = d || []
      // this.$emit('chose-user', {
      //   data: {
      //     // userType: d[0].userType
      //   },
      //   name: ''
      // })

      // this.$emit('next-step')
      this.drawChart()
      return 1
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  afterDraw () {
    this.yexiao.on( 'click', params => {
      this.$emit( 'chose-user', params )
    } )
  }
}