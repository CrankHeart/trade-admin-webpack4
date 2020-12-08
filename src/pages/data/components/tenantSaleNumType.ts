import GmvUser from './gmvUser'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import tenantBasic from './tenantBasic'
import { userTypeObj } from '../../order/const/orderSearchCondition'
@Component( {
  name: 'tenant-sale-number',
  mixins: [ tenantBasic ]
} )
export default class TenantSaleNumber extends GmvUser {
  @Prop()
  isSaleCity: boolean
  @Prop()
  year: number
  @Prop( { type: [ Number, String ] } )
  type
  @Prop()
  month: number
  @Prop()
  regionProvince: string
  @Prop()
  userType: number
  @Prop()
  curTab: number
  @Prop()
  region: string
  @Prop()
  salesDepartmentsType: number
  @Prop( { default: false } )
  isSalesDepartment: boolean
  formatTitle () {
    let formatTypes: any = ( <any> this ).formatTypes
    let user = userTypeObj[ this.userType ]
    return this.year + '年' + ( this.month && this.month + '月' ) + ( this.region || '' ) + ( this.regionProvince || '' ) + formatTypes( this.type ) + ( user && user.name || '' ) + '销售金额分类'
  }
  get baseConfig (): any {
    return this.curTab ? {
      mySalesAmountType: { name: '金额分布' },
      num: { name: '客户数量' }
    } : {
      mySalesAmountType: { name: '金额分布' },
      gmv: { name: 'GMV' }
    }
  }
  salesAmountType: any = {
    0: '<500',
    1: '500-3000',
    2: '3000-6000',
    3: '>6000'
  }
  getData () {
    this.yexiao.showLoading()
    let url = this.curTab === 1 ? API.getSalesAmountProNum : API.getSalesAmountPro
    this.$http( url, ( <any> this ).ajaxOption ).then( ( { data } ) => {
      let d = data.data || []
      d.forEach( v => {
        v.mySalesAmountType = this.salesAmountType[ v.salesAmountType ]
      } )
      this.allData = d
      // this.$emit('chose-user', {
      //   data: {},
      //   name: ''
      // })
      // this.$emit('next-step')
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get option (): any {
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
          subtext: '销售金额',
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
        formatter: ( { name, percent, value } ) => `${name}<br/>销量：${this.curTab ? value : '¥' + this.toTenThousand( value )} 占比：${percent}%`
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
          radius: [ '0%', '65%' ],
          center: [ '50%', '63%' ],
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

      if ( +v[ prop ] ) {
        let salesAmountType = this.salesAmountType[ v.salesAmountType ]
        option.legend[ 0 ].data.push( {
          name: salesAmountType,
          icon: 'path://' + emptyRoundSvg
        } )
        option.series[ 0 ].data.push( {
          name: salesAmountType,
          value: v[ prop ],
          provice: v.provice,
          ...colors[ i ]
        } )
      }
      total += v[ prop ] * 100
    } )
    option.title[ 0 ].text = this.curTab ? total / 100 + '家' : '¥' + this.toTenThousand( total / 100 )
    return option
  }

  afterDraw () {
    this.yexiao.on( 'click', ( { name } ) => {
      for ( let i in this.salesAmountType ) {
        if ( this.salesAmountType[ i ] === name ) {
          this.$emit( 'chose-salesAmountType', +i )
          break
        }
      }
    } )
  }
}
