import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import { tenantMonthlyGmvTypes, tenantMonthlyUserTypes } from '../const/index'
import TenantBasic from './tenantBasic'

@Component( {
  name: 'tenant-zone',
  mixins: [ TenantBasic ]
} )
export default class TenantZone extends GmvBasic {
  @Prop()
  year: number
  @Prop()
  isHistory: boolean
  @Prop()
  month: number
  @Prop( { type: [ Number, String ] } )
  type
  @Prop()
  curTab: number
  get baseConfig () {
    return this.curTab ? {
      region: { name: '地区' },
      num: { name: '数量' }
    } : {
      region: { name: '地区' },
      gmv: { name: 'GMV' }
    }
  }

  get tableData () {
    return this.allData.concat()
  }

  allData: any = []
  formatTitle () {
    let formatTypes: any = ( <any> this ).formatTypes
    // return this.year + '年' + ( this.type === '3,4' && this.isHistory ? '' : this.month && this.month + '月' ) + ( formatTypes( this.type ) ) + '大区占比'
    return this.year + '年' + ( this.type === 2 && this.isHistory ? '' : this.month && this.month + '月' ) + ( formatTypes( this.type ) ) + '大区占比'
  }
  getData () {
    this.yexiao.showLoading()
    let url = this.curTab === 1 ? API.getCompanyRegionProNum : API.getCompanyRegionPro
    let option = ( <any> this ).ajaxOption
    this.$http( url, option ).then( ( { data } ) => {
      let d = data.data || []
      this.allData = d

      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  get option () {
    let colors = [
      { itemStyle: { normal: { color: '#94bf3c' } } },
      { itemStyle: { normal: { color: '#ffc020' } } },
      { itemStyle: { normal: { color: '#fe7065' } } },
      { itemStyle: { normal: { color: '#5a8eca' } } },
      { itemStyle: { normal: { color: '#dd9213' } } }
    ]
    let option = {
      title: [
        {
          text: '0',
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
        formatter: ( { name, percent, value } ) => this.curTab ? `${name}<br/>数量： ${value} 占比：${percent}%` : `${name}<br/>销量： ¥ ${this.toTenThousand( value )} 占比：${percent}%`
      },
      legend: [
        {
          left: 20,
          top: 60,
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
          data: []
        },
      ]
    }
    let total = 0
    this.allData.forEach( ( v, i ) => {
      let prop = ''
      if ( this.curTab ) {
        prop = 'num'
      } else {
        prop = 'gmv'
      }
      total += v[ prop ]
      option.legend[ 0 ].data.push( { name: v.region, icon: 'path://' + emptyRoundSvg } )
      // type 不同传递过来的数据均存在gmv上
      option.series[ 0 ].data.push( { name: v.region, value: v[ prop ], ...colors[ i ] } )

    } )
    option.title[ 0 ].text = ( this.curTab && total + '家' ) || ( '¥' + this.toTenThousand( total ) )

    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', ( data ) => {
      this.$emit( 'chose-region', data )
    } )
  }
}
